-- Allow anon users to insert (for the scraper integration using anon key)
-- CAUTION: This allows anyone with your anon key to insert data. 
-- Ideally use Service Role key for scripts.
create policy "Allow anon insert"
on public.articles
for insert
with check (true);
