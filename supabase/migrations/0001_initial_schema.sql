-- Kateshwar Super Market - initial schema foundation
-- Review and apply in a development Supabase project first.
-- RLS is enabled below. Policies are intentionally not permissive by default;
-- add narrowly scoped policies as authentication and customer access flows are implemented.

create extension if not exists pgcrypto;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  unit text not null,
  image_url text,
  in_stock boolean not null default true,
  stock_quantity numeric(10,3) check (stock_quantity is null or stock_quantity >= 0),
  low_stock_threshold numeric(10,3) check (low_stock_threshold is null or low_stock_threshold >= 0),
  track_inventory boolean not null default false,
  minimum_quantity numeric(10,3) not null default 1 check (minimum_quantity > 0),
  quantity_step numeric(10,3) not null default 1 check (quantity_step > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  address text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'New'
    check (status in ('New','Accepted','Packing','Out for Delivery','Delivered','Cancelled')),
  delivery_time text not null check (delivery_time in ('Now','Evening')),
  delivery_address text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  payment_method text not null default 'COD' check (payment_method = 'COD'),
  notes text,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit text not null,
  qty numeric(10,3) not null check (qty > 0),
  price numeric(10,2) not null check (price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null
    check (new_status in ('New','Accepted','Packing','Out for Delivery','Delivered','Cancelled')),
  changed_by uuid,
  reason text,
  changed_at timestamptz not null default now()
);

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null default 'Kateshwar Super Market',
  shop_phone text,
  delivery_boy_phone text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  delivery_radius_meters integer not null default 500 check (delivery_radius_meters > 0),
  opening_time time,
  closing_time time,
  minimum_order_amount numeric(10,2) not null default 0 check (minimum_order_amount >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_stock on public.products(in_stock);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_history_order on public.order_status_history(order_id, changed_at);
create index if not exists idx_order_tokens_order on public.order_access_tokens(order_id);

-- Enable RLS. Add least-privilege policies in a subsequent migration before
-- exposing these tables through application queries.
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.shop_settings enable row level security;
alter table public.order_access_tokens enable row level security;

insert into public.shop_settings (shop_name, delivery_radius_meters, minimum_order_amount)
select 'Kateshwar Super Market', 500, 0
where not exists (select 1 from public.shop_settings);
