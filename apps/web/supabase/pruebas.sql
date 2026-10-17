-- Todo lo que genera cada prueba de la app (lib/pruebas.ts). Cada fila es un pedido a la IA: qué se le
-- mandó, qué devolvió, cuánto tardó y de qué cliente (pestaña) era. Las imágenes y audios van a la
-- carpeta `pruebas` de Storage y en la fila queda su link.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto Brandia-app).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.pruebas (
  id bigint generated always as identity primary key,
  -- El id de la pestaña (lib/cliente.ts): junta todo lo de una misma persona probando
  cliente text check (cliente ~ '^[a-z0-9-]{4,40}$'),
  -- El paso de la IA (PASOS en lib/ia/gastos.ts): entrevista, nombres, logo, contenidos-lote…
  paso text not null,
  corrida text not null,
  -- Cómo respondió la ruta (200 bien, 4xx o 5xx con error)
  estado int not null,
  segundos numeric not null,
  -- production, preview (links de cada rama) o compu (npm run dev)
  origen text not null,
  entrada jsonb,
  salida jsonb,
  creado timestamptz not null default now()
);

create index if not exists pruebas_cliente on public.pruebas (cliente, creado);
create index if not exists pruebas_creado on public.pruebas (creado desc);

alter table public.pruebas enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor
grant select, insert on public.pruebas to service_role;
grant usage on sequence public.pruebas_id_seq to service_role;

-- Las imágenes y los audios de las pruebas. Carpeta pública para poder verlos en el panel con su link
-- (el nombre de cada archivo es una huella al azar, no se puede adivinar); solo el servidor sube.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pruebas', 'pruebas', true, 26214400, array['image/*', 'audio/*', 'video/*', 'application/octet-stream'])
on conflict (id) do nothing;
