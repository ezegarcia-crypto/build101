-- Registro de pagos del equipo (panel /costos): quién pagó qué, para que BrandIA le devuelva a cada uno.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.pagos (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  fecha date not null,
  quien text not null check (quien in ('Eze', 'Juan Pedro', 'Rodrigo')),
  concepto text not null check (char_length(concepto) between 1 and 120),
  categoria text not null check (categoria in ('ia', 'voz', 'hosting', 'dominio', 'otro')),
  monto_usd numeric(10, 2) not null check (monto_usd > 0),
  -- todo: es todo de BrandIA · uso_voz: se reparte con Gary según el uso de ElevenLabs de ese mes ·
  -- porcentaje: a BrandIA le toca un porcentaje fijo
  reparto text not null default 'todo' check (reparto in ('todo', 'uso_voz', 'porcentaje')),
  porcentaje numeric(5, 2) check (porcentaje is null or (porcentaje >= 0 and porcentaje <= 100)),
  nota text check (nota is null or char_length(nota) <= 300)
);

alter table public.pagos enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor
-- (service_role). La pantalla y cualquiera de afuera no tienen acceso.
grant select, insert, delete on public.pagos to service_role;
