-- Run this in Supabase SQL Editor if tenants table already exists
alter table public.tenants
  add column if not exists electricity_ref text,
  add column if not exists gas_ref text;
