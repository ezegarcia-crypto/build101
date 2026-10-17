-- ============================================================
-- BrandIA · Lista de espera · tablas en Supabase
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- La landing usa la clave pública "anon": SOLO puede insertar.
-- Nadie puede leer la lista desde la web; se lee desde el panel
-- de Supabase o con la service key (nunca en el HTML).
-- ============================================================

create table if not exists public.waitlist (
  id            uuid primary key,
  created_at    timestamptz not null default now(),
  email         text not null check (char_length(email) between 5 and 254),
  fuente        text,          -- 'hero' | 'cierre'
  landing       text,          -- versión de la landing, ej. 'waitlist-v1'
  angulo        text,          -- ángulo del anuncio (?a=...)
  utm_source    text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  fbclid        text,
  referrer      text,
  idioma        text
);
-- Un mail, una fila. Si alguien se anota dos veces, la web recibe 409 y lo toma como "ya estabas".
create unique index if not exists waitlist_email_unico on public.waitlist (lower(email));

create table if not exists public.waitlist_perfil (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  lead_id       uuid,          -- = waitlist.id (sin FK: si el mail ya existía, el id es nuevo)
  email         text,
  nombre        text check (char_length(nombre) <= 80),
  pais          text,
  tiene_marca   text,          -- 'no' | 'a_medias' | 'si'
  etapa         text,          -- 'idea' | 'arrancando' | 'funcionando' | 'empresa'
  interes       text[],        -- 'identidad' | 'productos' | 'redes' | 'renovar'
  precio        text,          -- '<50' | '50-100' | '100-200' | '>200' | 'no_se'
  beta          boolean default false,
  whatsapp      text check (char_length(whatsapp) <= 30),
  angulo        text
);

-- Seguridad: RLS prendido y una sola política, insertar.
alter table public.waitlist        enable row level security;
alter table public.waitlist_perfil enable row level security;

drop policy if exists "anon inserta" on public.waitlist;
create policy "anon inserta" on public.waitlist
  for insert to anon with check (true);

drop policy if exists "anon inserta" on public.waitlist_perfil;
create policy "anon inserta" on public.waitlist_perfil
  for insert to anon with check (true);

-- Vista para leer resultados desde el panel (no expuesta a anon).
create or replace view public.waitlist_resumen as
select w.created_at, w.email, w.angulo, w.utm_campaign, w.utm_content,
       p.nombre, p.pais, p.tiene_marca, p.etapa, p.interes, p.precio, p.beta, p.whatsapp
from public.waitlist w
left join public.waitlist_perfil p on lower(p.email) = lower(w.email);
revoke all on public.waitlist_resumen from anon, authenticated;
