-- Los pedidos de BranderIA: el kit que arma la persona en /crear/branderia (productos y cantidades) y sus datos.
-- Todavía no se cobra: el equipo ve el pedido en /pedidos, le pasa la cotización por WhatsApp y lo produce.
-- Se corre una sola vez en el SQL Editor de Supabase (proyecto brandia).
-- Solo lo lee y escribe el servidor de la app con la clave de servicio: sin políticas, nadie más entra.

create table if not exists public.pedidos_branderia (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  estado text not null default 'recibido'
    check (estado in ('recibido', 'cotizado', 'en-produccion', 'enviado', 'entregado', 'cancelado')),
  nombre text not null check (char_length(nombre) between 1 and 80),
  -- WhatsApp o mail
  contacto text not null check (char_length(contacto) between 6 and 120),
  -- A dónde se manda: ciudad, barrio o dirección
  entrega text not null check (char_length(entrega) between 2 and 200),
  nota text check (nota is null or char_length(nota) <= 500),
  -- La marca: su nombre y sus colores, para producir
  marca text not null check (char_length(marca) between 1 and 80),
  colores jsonb not null default '[]'::jsonb,
  -- Los productos: [{ nombre, detalle, tecnica, estampa, cantidad }]
  items jsonb not null check (jsonb_typeof(items) = 'array' and pg_column_size(items) <= 20000),
  unidades integer not null check (unidades > 0),
  -- El número de cliente de la app (el mismo de /costos), para saber qué recorrido hizo
  cliente text check (cliente is null or char_length(cliente) <= 40)
);

alter table public.pedidos_branderia enable row level security;

-- El proyecto no expone tablas nuevas solo: el permiso se da a mano y únicamente al servidor
-- (service_role). La pantalla y cualquiera de afuera no tienen acceso.
grant select, insert, update on public.pedidos_branderia to service_role;
