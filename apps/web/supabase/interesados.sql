-- La gente que se anota para un plan en /crear/planes. Todavía no se cobra: el equipo los contacta.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.interesados (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  plan text not null check (plan in ('marca', 'mensual', 'branderia')),
  nombre text not null check (char_length(nombre) between 1 and 80),
  -- Un mail o un WhatsApp
  contacto text not null check (char_length(contacto) between 6 and 120),
  -- El nombre de la marca, si ya la armó en la app
  marca text check (marca is null or char_length(marca) <= 80),
  -- El número de cliente de la app (el mismo de /costos), para saber qué recorrido hizo
  cliente text check (cliente is null or char_length(cliente) <= 40)
);

alter table public.interesados enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor
-- (service_role). La pantalla y cualquiera de afuera no tienen acceso.
grant select, insert on public.interesados to service_role;
