-- Create the table for storing analysts
create table public.analysts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  companies text[] -- Array of strings for company names assigned to this analyst
);

-- Enable Row Level Security (RLS)
alter table public.analysts enable row level security;

-- Create a policy that allows public read access (so frontend can fetch them)
create policy "Allow public read access"
  on public.analysts
  for select
  using (true);

-- Create a policy that allows anon/authenticated insert (for seeding script)
-- CAUTION: In production, restrict this to service_role or authenticated admins only.
create policy "Allow insert for all"
  on public.analysts
  for insert
  with check (true);
