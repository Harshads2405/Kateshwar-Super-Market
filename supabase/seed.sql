-- Optional starter categories. Run after applying migrations.
insert into public.product_categories (name, slug, sort_order)
values
  ('Kirana', 'kirana', 1),
  ('Bhaji-pala', 'bhaji-pala', 2),
  ('Dairy', 'dairy', 3),
  ('Daily Use', 'daily-use', 4)
on conflict (slug) do nothing;
