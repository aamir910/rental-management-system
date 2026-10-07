-- Payment channels: cash vs account (EasyPaisa, UBL, Meezan, Askari, Alfalah, …)
-- Run in Supabase SQL Editor

-- Rent payments
alter table public.rent_payments
  add column if not exists payment_channel text
    check (payment_channel is null or payment_channel in ('cash', 'account'));

alter table public.rent_payments
  add column if not exists account_provider text
    check (
      account_provider is null
      or account_provider in (
        'easypaisa', 'jazzcash', 'ubl', 'meezan', 'askari', 'alfalah', 'hbl', 'other'
      )
    );

-- Daily expenses
alter table public.daily_expenses
  add column if not exists payment_channel text not null default 'cash'
    check (payment_channel in ('cash', 'account'));

alter table public.daily_expenses
  add column if not exists account_provider text
    check (
      account_provider is null
      or account_provider in (
        'easypaisa', 'jazzcash', 'ubl', 'meezan', 'askari', 'alfalah', 'hbl', 'other'
      )
    );

create index if not exists rent_payments_payment_channel_idx
  on public.rent_payments (payment_channel);

create index if not exists daily_expenses_payment_channel_idx
  on public.daily_expenses (payment_channel);
