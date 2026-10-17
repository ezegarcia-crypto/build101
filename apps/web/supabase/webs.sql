-- Las webs publicadas de los clientes (/w/[slug]). Cada fila es una web: lo que armó la IA, la ficha de la web
-- y la identidad de la marca, tal cual las dibuja la vista.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.webs (
  -- La dirección: minúsculas, sin tildes y con guiones ("hoy-rueda")
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  -- Para volver a publicar la misma web: solo quien la publicó la tiene (queda en su navegador)
  clave text not null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  datos jsonb not null check (pg_column_size(datos) <= 300000)
);

alter table public.webs enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor
-- (service_role). La pantalla y cualquiera de afuera no tienen acceso.
grant select, insert, update on public.webs to service_role;
