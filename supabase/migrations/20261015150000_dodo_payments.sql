-- Paid posts move from Lemon Squeezy order ids to a Dodo payment id.
-- Apply after 20261015103000_init_job_board.sql. Do not edit that file.

alter table public.submissions rename column lemonsqueezy_order_id to payment_id;

drop index if exists public.submissions_order_idx;

create unique index submissions_payment_idx on public.submissions (payment_id)
  where payment_id is not null;
