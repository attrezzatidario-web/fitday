-- =====================================================================
-- FITDAY — SCHEMA SUPABASE COMPLETO
-- Esegui questo file nel SQL editor di Supabase (Project -> SQL Editor)
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- FUNZIONE TRIGGER GENERICA: aggiorna updated_at automaticamente
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- 1. PROFILES — dati anagrafici + obiettivi base (onboarding)
-- =====================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  sex text check (sex in ('male','female','other','unspecified')) default 'unspecified',
  birth_date date,
  height_cm numeric(5,2),
  current_weight_kg numeric(5,2),
  target_weight_kg numeric(5,2),
  activity_level text check (activity_level in ('sedentary','light','moderate','active','very_active')) default 'moderate',
  primary_goal text check (primary_goal in ('lose_weight','maintain','gain_muscle','improve_fitness')) default 'maintain',
  units text check (units in ('metric','imperial')) default 'metric',
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = id);
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

-- Crea automaticamente il profilo alla registrazione
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger trg_on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- =====================================================================
-- 2. USER_SETTINGS — preferenze app, notifiche, unità
-- =====================================================================
create table user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text check (theme in ('dark','light','system')) default 'dark',
  notifications_enabled boolean default true,
  water_reminder_enabled boolean default true,
  workout_reminder_enabled boolean default true,
  daily_summary_enabled boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table user_settings enable row level security;
create policy "settings_all_own" on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_settings_updated before update on user_settings for each row execute function set_updated_at();

-- =====================================================================
-- 3. GOALS — obiettivi configurabili (calorie, passi, acqua, peso...)
-- =====================================================================
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null check (goal_type in (
    'calories','exercise_minutes','stand_hours','steps','distance_km','water_ml',
    'food_calories','protein_g','carbs_g','fat_g','weight_kg','workouts_per_week','sleep_hours'
  )),
  target_value numeric(10,2) not null,
  unit text not null,
  start_date date not null default current_date,
  end_date date,
  status text check (status in ('active','completed','archived')) default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table goals enable row level security;
create policy "goals_all_own" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_goals_user_type on goals(user_id, goal_type, status);
create trigger trg_goals_updated before update on goals for each row execute function set_updated_at();

create table goal_history (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_value numeric(10,2),
  new_value numeric(10,2),
  changed_at timestamptz not null default now()
);
alter table goal_history enable row level security;
create policy "goal_history_all_own" on goal_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_goal_history_goal on goal_history(goal_id);

-- =====================================================================
-- 4. DAILY_ACTIVITY — riepilogo giornaliero (anelli: move/exercise/stand)
-- =====================================================================
create table daily_activity (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  active_calories numeric(7,2) not null default 0,
  resting_calories numeric(7,2) not null default 0,
  exercise_minutes integer not null default 0,
  stand_hours integer not null default 0,
  steps integer not null default 0,
  distance_km numeric(6,3) not null default 0,
  flights_climbed integer not null default 0,
  move_goal numeric(7,2) not null default 700,
  exercise_goal integer not null default 60,
  stand_goal integer not null default 12,
  steps_goal integer not null default 10000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date)
);
alter table daily_activity enable row level security;
create policy "daily_activity_all_own" on daily_activity for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_daily_activity_user_date on daily_activity(user_id, activity_date desc);
create trigger trg_daily_activity_updated before update on daily_activity for each row execute function set_updated_at();

-- =====================================================================
-- 5. WORKOUTS + 6. WORKOUT_EXERCISES + 7. EXERCISE_SETS
-- =====================================================================
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  workout_type text not null check (workout_type in (
    'running','walking','cycling','gym','weights','hiit','swimming','soccer','yoga','stretching','custom'
  )),
  workout_date date not null default current_date,
  start_time time,
  duration_minutes integer not null default 0,
  calories numeric(7,2) default 0,
  distance_km numeric(6,3),
  avg_pace text,
  avg_speed_kmh numeric(5,2),
  avg_heart_rate integer,
  max_heart_rate integer,
  perceived_effort integer check (perceived_effort between 1 and 10),
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table workouts enable row level security;
create policy "workouts_all_own" on workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_workouts_user_date on workouts(user_id, workout_date desc);
create trigger trg_workouts_updated before update on workouts for each row execute function set_updated_at();

create table workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
alter table workout_exercises enable row level security;
create policy "workout_exercises_all_own" on workout_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_workout_exercises_workout on workout_exercises(workout_id);

create table exercise_sets (
  id uuid primary key default uuid_generate_v4(),
  exercise_id uuid not null references workout_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  set_number integer not null default 1,
  reps integer,
  weight_kg numeric(6,2),
  duration_seconds integer,
  is_personal_record boolean default false,
  created_at timestamptz not null default now()
);
alter table exercise_sets enable row level security;
create policy "exercise_sets_all_own" on exercise_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_exercise_sets_exercise on exercise_sets(exercise_id);

-- =====================================================================
-- 8. FOODS — catalogo alimenti (globale + personalizzati)
-- =====================================================================
create table foods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  default_unit text not null default 'g',
  calories_per_unit numeric(7,2) not null default 0,
  protein_g numeric(6,2) default 0,
  carbs_g numeric(6,2) default 0,
  fat_g numeric(6,2) default 0,
  fiber_g numeric(6,2) default 0,
  sugar_g numeric(6,2) default 0,
  salt_g numeric(6,2) default 0,
  is_favorite boolean default false,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table foods enable row level security;
create policy "foods_select" on foods for select using (is_public = true or auth.uid() = user_id);
create policy "foods_insert_own" on foods for insert with check (auth.uid() = user_id);
create policy "foods_update_own" on foods for update using (auth.uid() = user_id);
create policy "foods_delete_own" on foods for delete using (auth.uid() = user_id);
create index idx_foods_user on foods(user_id);
create index idx_foods_name on foods using gin (to_tsvector('simple', name));
create trigger trg_foods_updated before update on foods for each row execute function set_updated_at();

-- =====================================================================
-- 9. FOOD_ENTRIES — diario alimentare
-- =====================================================================
create table food_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references foods(id) on delete set null,
  entry_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','other')),
  food_name text not null,
  quantity numeric(8,2) not null default 1,
  unit text not null default 'g',
  calories numeric(7,2) not null default 0,
  protein_g numeric(6,2) default 0,
  carbs_g numeric(6,2) default 0,
  fat_g numeric(6,2) default 0,
  fiber_g numeric(6,2) default 0,
  sugar_g numeric(6,2) default 0,
  salt_g numeric(6,2) default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table food_entries enable row level security;
create policy "food_entries_all_own" on food_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_food_entries_user_date on food_entries(user_id, entry_date desc);
create trigger trg_food_entries_updated before update on food_entries for each row execute function set_updated_at();

-- =====================================================================
-- 10. SAVED_MEALS + 11. RECIPES + 12. RECIPE_INGREDIENTS
-- =====================================================================
create table saved_meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  meal_type text check (meal_type in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','other')),
  total_calories numeric(7,2) default 0,
  items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table saved_meals enable row level security;
create policy "saved_meals_all_own" on saved_meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_saved_meals_user on saved_meals(user_id);
create trigger trg_saved_meals_updated before update on saved_meals for each row execute function set_updated_at();

create table recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  servings integer not null default 1,
  instructions text,
  total_calories numeric(7,2) default 0,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table recipes enable row level security;
create policy "recipes_all_own" on recipes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_recipes_user on recipes(user_id);
create trigger trg_recipes_updated before update on recipes for each row execute function set_updated_at();

create table recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references foods(id) on delete set null,
  name text not null,
  quantity numeric(8,2) not null default 1,
  unit text not null default 'g',
  calories numeric(7,2) default 0,
  created_at timestamptz not null default now()
);
alter table recipe_ingredients enable row level security;
create policy "recipe_ingredients_all_own" on recipe_ingredients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_recipe_ingredients_recipe on recipe_ingredients(recipe_id);

-- =====================================================================
-- 13. WATER_ENTRIES
-- =====================================================================
create table water_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  amount_ml integer not null,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table water_entries enable row level security;
create policy "water_entries_all_own" on water_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_water_entries_user_date on water_entries(user_id, entry_date desc);

-- =====================================================================
-- 14. BODY_MEASUREMENTS
-- =====================================================================
create table body_measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_date date not null default current_date,
  weight_kg numeric(5,2),
  body_fat_pct numeric(4,2),
  muscle_mass_kg numeric(5,2),
  bmi numeric(4,2),
  waist_cm numeric(5,2),
  chest_cm numeric(5,2),
  hips_cm numeric(5,2),
  arm_cm numeric(5,2),
  thigh_cm numeric(5,2),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  resting_heart_rate integer,
  blood_glucose numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table body_measurements enable row level security;
create policy "body_measurements_all_own" on body_measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_body_measurements_user_date on body_measurements(user_id, measured_date desc);
create trigger trg_body_measurements_updated before update on body_measurements for each row execute function set_updated_at();

-- =====================================================================
-- 15. SLEEP_ENTRIES
-- =====================================================================
create table sleep_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sleep_date date not null default current_date,
  bedtime timestamptz not null,
  wake_time timestamptz not null,
  duration_minutes integer not null default 0,
  quality integer check (quality between 1 and 5),
  awakenings integer default 0,
  deep_sleep_minutes integer default 0,
  light_sleep_minutes integer default 0,
  rem_sleep_minutes integer default 0,
  energy_on_wake integer check (energy_on_wake between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table sleep_entries enable row level security;
create policy "sleep_entries_all_own" on sleep_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_sleep_entries_user_date on sleep_entries(user_id, sleep_date desc);
create trigger trg_sleep_entries_updated before update on sleep_entries for each row execute function set_updated_at();

-- =====================================================================
-- 16. HABITS + 17. HABIT_LOGS
-- =====================================================================
create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default 'circle-check',
  color text default '#A6FF00',
  frequency text check (frequency in ('daily','weekly','custom')) default 'daily',
  target_days smallint[] default '{0,1,2,3,4,5,6}',
  target_value numeric(8,2) default 1,
  unit text default 'volte',
  reminder_time time,
  is_archived boolean default false,
  current_streak integer default 0,
  best_streak integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table habits enable row level security;
create policy "habits_all_own" on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_habits_user on habits(user_id, is_archived);
create trigger trg_habits_updated before update on habits for each row execute function set_updated_at();

create table habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  value numeric(8,2) not null default 1,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);
alter table habit_logs enable row level security;
create policy "habit_logs_all_own" on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_habit_logs_habit_date on habit_logs(habit_id, log_date desc);

-- =====================================================================
-- 18. DAILY_NOTES
-- =====================================================================
create table daily_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null default current_date,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table daily_notes enable row level security;
create policy "daily_notes_all_own" on daily_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_daily_notes_user_date on daily_notes(user_id, note_date desc);
create trigger trg_daily_notes_updated before update on daily_notes for each row execute function set_updated_at();

-- =====================================================================
-- 19. MOODS
-- =====================================================================
create table moods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood_date date not null default current_date,
  mood_level integer not null check (mood_level between 1 and 5),
  energy_level integer check (energy_level between 1 and 5),
  notes text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table moods enable row level security;
create policy "moods_all_own" on moods for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_moods_user_date on moods(user_id, mood_date desc);

-- =====================================================================
-- 20. ACHIEVEMENTS
-- =====================================================================
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  title text not null,
  description text,
  icon text default 'award',
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table achievements enable row level security;
create policy "achievements_all_own" on achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_achievements_user on achievements(user_id, earned_at desc);

-- =====================================================================
-- 21. NOTIFICATIONS
-- =====================================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  notification_type text check (notification_type in ('reminder','insight','achievement','system')) default 'system',
  is_read boolean default false,
  created_at timestamptz not null default now()
);
alter table notifications enable row level security;
create policy "notifications_all_own" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_notifications_user on notifications(user_id, is_read, created_at desc);

-- =====================================================================
-- FINE SCHEMA
-- =====================================================================
