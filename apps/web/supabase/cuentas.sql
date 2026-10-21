-- Las cuentas de BrandIA: perfil de cada persona, sus marcas guardadas, los planes, las suscripciones y los cobros.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia). Se puede volver a correr: no rompe nada.
--
-- Las cuentas las maneja Supabase Auth (tabla auth.users): mail con código o enlace, y Google.
-- Seguridad por fila (RLS): cada persona ve y toca solo lo suyo. Las suscripciones y los cobros solo los escribe
-- el servidor (el webhook del cobro, con la clave de servicio): la persona los puede leer, nunca cambiar.

-- ─── Perfil ───────────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  creado timestamptz not null default now(),
  mail text,
  nombre text check (nombre is null or char_length(nombre) <= 80)
);

alter table public.perfiles enable row level security;

drop policy if exists "cada uno ve su perfil" on public.perfiles;
create policy "cada uno ve su perfil" on public.perfiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "cada uno cambia su perfil" on public.perfiles;
create policy "cada uno cambia su perfil" on public.perfiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select, update (nombre) on public.perfiles to authenticated;
grant select, insert, update, delete on public.perfiles to service_role;

-- Cuando alguien se crea una cuenta, se le arma el perfil solo (con el nombre que trae Google, si entró así)
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, mail, nombre)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_cuenta on auth.users;
create trigger al_crear_cuenta
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ─── Marcas ───────────────────────────────────────────────────────────────────────────────────────────────
-- Cada marca guardada en una cuenta. Lo que armó la persona (ficha, nombres, marca, feeds, web, productos) va
-- entero en un archivo JSON en la carpeta privada `marcas` de Storage: marcas/<id de la persona>/<id de la marca>.json.
-- Acá queda lo que hace falta para listarlas sin abrir el archivo.
create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  usuario uuid not null default auth.uid() references auth.users (id) on delete cascade,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  nombre text check (nombre is null or char_length(nombre) <= 80),
  rubro text check (rubro is null or char_length(rubro) <= 120),
  -- Los colores de la paleta (["#E8542C", …]), para la tarjeta de la marca
  colores jsonb not null default '[]'::jsonb check (jsonb_typeof(colores) = 'array' and pg_column_size(colores) <= 2000),
  -- Hasta dónde llegó: ficha, marca, contenido, productos, web
  pasos text[] not null default '{}',
  -- Cuánto pesa el archivo, en bytes
  tamano integer not null default 0 check (tamano >= 0)
);

create index if not exists marcas_usuario on public.marcas (usuario, actualizado desc);

alter table public.marcas enable row level security;

drop policy if exists "cada uno ve sus marcas" on public.marcas;
create policy "cada uno ve sus marcas" on public.marcas
  for select to authenticated using ((select auth.uid()) = usuario);

drop policy if exists "cada uno guarda sus marcas" on public.marcas;
create policy "cada uno guarda sus marcas" on public.marcas
  for insert to authenticated with check ((select auth.uid()) = usuario);

drop policy if exists "cada uno cambia sus marcas" on public.marcas;
create policy "cada uno cambia sus marcas" on public.marcas
  for update to authenticated using ((select auth.uid()) = usuario) with check ((select auth.uid()) = usuario);

drop policy if exists "cada uno borra sus marcas" on public.marcas;
create policy "cada uno borra sus marcas" on public.marcas
  for delete to authenticated using ((select auth.uid()) = usuario);

grant select, insert, update, delete on public.marcas to authenticated;
grant select, insert, update, delete on public.marcas to service_role;

-- La carpeta privada con lo que armó cada marca. Cada persona lee y escribe solo dentro de su carpeta (su id).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marcas', 'marcas', false, 26214400, array['application/json'])
on conflict (id) do nothing;

drop policy if exists "marcas: cada uno lee su carpeta" on storage.objects;
create policy "marcas: cada uno lee su carpeta" on storage.objects
  for select to authenticated
  using (bucket_id = 'marcas' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "marcas: cada uno sube a su carpeta" on storage.objects;
create policy "marcas: cada uno sube a su carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'marcas' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "marcas: cada uno pisa lo suyo" on storage.objects;
create policy "marcas: cada uno pisa lo suyo" on storage.objects
  for update to authenticated
  using (bucket_id = 'marcas' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'marcas' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "marcas: cada uno borra lo suyo" on storage.objects;
create policy "marcas: cada uno borra lo suyo" on storage.objects
  for delete to authenticated
  using (bucket_id = 'marcas' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─── Planes ───────────────────────────────────────────────────────────────────────────────────────────────
-- Los planes que se venden. Los textos de la pantalla siguen en apps/web/src/lib/planes.ts; acá, lo que hace
-- falta para cobrar. Los lee cualquiera (también sin cuenta).
create table if not exists public.planes (
  id text primary key check (id in ('marca', 'mensual', 'branderia')),
  nombre text not null,
  -- unico: se paga una vez · mensual: se cobra solo cada mes · cotizar: no se cobra desde la app
  cobro text not null check (cobro in ('unico', 'mensual', 'cotizar')),
  precio_usd numeric(10, 2),
  -- Lo que se cobra de verdad, en pesos uruguayos (Mercado Pago Uruguay cobra en pesos).
  -- Los de abajo son provisorios (USD a unos 40 pesos): los fijan los socios y se cambian acá o en el Table Editor
  precio_uyu numeric(10, 2),
  activo boolean not null default true
);

insert into public.planes (id, nombre, cobro, precio_usd, precio_uyu) values
  ('marca', 'Tu marca', 'unico', 19.99, 800),
  ('mensual', 'Tu marca andando', 'mensual', 29, 1190),
  ('branderia', 'BranderIA', 'cotizar', null, null)
on conflict (id) do nothing;

alter table public.planes enable row level security;

drop policy if exists "los planes los ve cualquiera" on public.planes;
create policy "los planes los ve cualquiera" on public.planes for select to anon, authenticated using (true);

grant select on public.planes to anon, authenticated;
grant select, insert, update on public.planes to service_role;

-- ─── Suscripciones ────────────────────────────────────────────────────────────────────────────────────────
-- Una fila por suscripción (el plan mensual) o por compra única (el plan "Tu marca").
-- La crea el servidor al mandar a la persona a pagar (estado pendiente) y el webhook del cobro la marca activa.
create table if not exists public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario uuid not null references auth.users (id) on delete cascade,
  plan text not null references public.planes (id),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  -- pendiente: fue a pagar y todavía no volvió · activa: pagó · pausada / cancelada: la frenó él o falló el cobro
  estado text not null default 'pendiente' check (estado in ('pendiente', 'activa', 'pausada', 'cancelada')),
  proveedor text not null default 'mercadopago' check (proveedor in ('mercadopago')),
  -- El id en Mercado Pago: el de la suscripción (preapproval) o el de la preferencia de pago, según el plan
  proveedor_id text unique,
  -- Hasta cuándo está pago (el próximo cobro). En una compra única queda vacío: no vence
  hasta timestamptz,
  -- Para modo prueba: no se cuenta como cliente real
  prueba boolean not null default false
);

create index if not exists suscripciones_usuario on public.suscripciones (usuario, estado);

alter table public.suscripciones enable row level security;

drop policy if exists "cada uno ve sus suscripciones" on public.suscripciones;
create policy "cada uno ve sus suscripciones" on public.suscripciones
  for select to authenticated using ((select auth.uid()) = usuario);

grant select on public.suscripciones to authenticated;
grant select, insert, update on public.suscripciones to service_role;

-- ─── Cobros ───────────────────────────────────────────────────────────────────────────────────────────────
-- Cada pago que avisa Mercado Pago (el primero y los de cada mes). Se llama `cobros` porque `pagos` ya es el
-- registro de gastos del equipo (/costos).
create table if not exists public.cobros (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  usuario uuid references auth.users (id) on delete set null,
  suscripcion uuid references public.suscripciones (id) on delete set null,
  proveedor text not null default 'mercadopago',
  -- El id del pago en Mercado Pago: el mismo aviso puede llegar dos veces y no se anota dos veces
  proveedor_id text not null unique,
  -- approved, pending, rejected, refunded… tal cual lo dice Mercado Pago
  estado text not null,
  monto numeric(12, 2),
  moneda text,
  prueba boolean not null default false,
  -- Lo que mandó Mercado Pago, por si hay que revisar
  datos jsonb check (datos is null or pg_column_size(datos) <= 50000)
);

create index if not exists cobros_usuario on public.cobros (usuario, creado desc);

alter table public.cobros enable row level security;

drop policy if exists "cada uno ve sus cobros" on public.cobros;
create policy "cada uno ve sus cobros" on public.cobros
  for select to authenticated using ((select auth.uid()) = usuario);

grant select on public.cobros to authenticated;
grant select, insert, update on public.cobros to service_role;
grant usage on sequence public.cobros_id_seq to service_role;
