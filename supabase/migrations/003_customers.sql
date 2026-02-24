create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


alter table deliveries
add column customer_id uuid references customers(id) on delete set null;



alter table customers enable row level security;


create policy "Users can view their customers"
on customers
for select
using (auth.uid() = user_id);


create policy "Users can insert their customers"
on customers
for insert
with check (auth.uid() = user_id);


create policy "Users can update their customers"
on customers
for update
using (auth.uid() = user_id);