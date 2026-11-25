-- Los administradores de BrandIA: la lista cerrada de quienes entran a /costos, /pruebas y /pedidos.
-- Cada uno entra con su mail, su contraseña y el código de 6 números de Google Authenticator (login en dos pasos).
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.admins (
  mail text primary key check (mail = lower(mail) and char_length(mail) between 5 and 120),
  nombre text not null check (char_length(nombre) between 1 and 40),
  creado timestamptz not null default now(),
  -- La contraseña nunca se guarda: solo su huella (scrypt, con sal propia)
  clave_hash text,
  -- La semilla de Google Authenticator (base32). Solo vale cuando totp_activo es true
  totp_secreto text,
  totp_activo boolean not null default false,
  -- El último código usado, para que el mismo no sirva dos veces
  ultimo_paso bigint not null default 0,
  -- Intentos fallidos seguidos: a los 5, la cuenta queda frenada 15 minutos
  intentos int not null default 0,
  bloqueado_hasta timestamptz,
  ultimo_ingreso timestamptz
);

alter table public.admins enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor (service_role).
grant select, insert, update on public.admins to service_role;

-- La lista cerrada. Cambiá los mails por los reales ANTES de correrlo (en el SQL Editor, no en el repo:
-- el repo es público y los mails no van acá).
insert into public.admins (mail, nombre) values
  ('MAIL-DE-EZE', 'Eze'),
  ('MAIL-DE-JUAN-PEDRO', 'Juan Pedro'),
  ('MAIL-DE-RODRIGO', 'Rodrigo')
on conflict (mail) do nothing;

-- Si alguien pierde el celular o se olvida la contraseña, se le reinicia el alta y vuelve a hacerla en /admin/alta:
-- update public.admins set clave_hash = null, totp_secreto = null, totp_activo = false, intentos = 0,
--   bloqueado_hasta = null where mail = 'EL-MAIL';
