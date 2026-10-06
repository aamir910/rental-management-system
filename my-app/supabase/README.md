# Supabase setup (Phase 1)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full contents of [`schema.sql`](./schema.sql).
3. Create your admin user:
   - **Authentication → Users → Add user**
   - Email + password (confirm email if required, or disable email confirm in Auth settings for personal use)
4. Copy project keys into `my-app/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Restart the Next.js app:

```bash
npm run dev
```

6. Open `http://localhost:3000/login` and sign in.

A profile row is created automatically via the `handle_new_user` trigger.

## Later migrations

If you already ran `schema.sql` before utility fields were added, also run:

[`migration_add_utility_refs.sql`](./migration_add_utility_refs.sql)

That adds `electricity_ref` and `gas_ref` on `tenants`.

For bill refs + Admin Home (utility bills + reminders), run this **one file**:

[`APPLY_BILLS_AND_HOME.sql`](./APPLY_BILLS_AND_HOME.sql)

Or run separately:
- [`migration_add_utility_refs.sql`](./migration_add_utility_refs.sql)
- [`migration_home_utilities_reminders.sql`](./migration_home_utilities_reminders.sql)
