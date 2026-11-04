-- Create a table for saving user projects
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'Untitled Project',
  state_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table projects enable row level security;

create policy "Users can view own projects."
  on projects for select
  using ( auth.uid() = user_id );

create policy "Users can insert own projects."
  on projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own projects."
  on projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete own projects."
  on projects for delete
  using ( auth.uid() = user_id );
