// Tipi generati a mano per rispecchiare supabase/schema.sql
// In futuro puoi sostituirli con: npx supabase gen types typescript

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type PrimaryGoal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness'
export type Units = 'metric' | 'imperial'
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'other'
export type WorkoutType =
  | 'running' | 'walking' | 'cycling' | 'gym' | 'weights' | 'hiit'
  | 'swimming' | 'soccer' | 'yoga' | 'stretching' | 'custom'
export type GoalType =
  | 'calories' | 'exercise_minutes' | 'stand_hours' | 'steps' | 'distance_km' | 'water_ml'
  | 'food_calories' | 'protein_g' | 'carbs_g' | 'fat_g' | 'weight_kg' | 'workouts_per_week' | 'sleep_hours'

export interface Profile {
  id: string
  full_name: string | null
  sex: 'male' | 'female' | 'other' | 'unspecified'
  birth_date: string | null
  height_cm: number | null
  current_weight_kg: number | null
  target_weight_kg: number | null
  activity_level: ActivityLevel
  primary_goal: PrimaryGoal
  units: Units
  avatar_url: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'dark' | 'light' | 'system'
  notifications_enabled: boolean
  water_reminder_enabled: boolean
  workout_reminder_enabled: boolean
  daily_summary_enabled: boolean
  dashboard_widgets: string[] | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  goal_type: GoalType
  target_value: number
  unit: string
  start_date: string
  end_date: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface DailyActivity {
  id: string
  user_id: string
  activity_date: string
  active_calories: number
  resting_calories: number
  exercise_minutes: number
  stand_hours: number
  steps: number
  distance_km: number
  flights_climbed: number
  move_goal: number
  exercise_goal: number
  stand_goal: number
  steps_goal: number
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  workout_type: WorkoutType
  workout_date: string
  start_time: string | null
  duration_minutes: number
  calories: number | null
  distance_km: number | null
  avg_pace: string | null
  avg_speed_kmh: number | null
  avg_heart_rate: number | null
  max_heart_rate: number | null
  perceived_effort: number | null
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  user_id: string
  name: string
  order_index: number
  notes: string | null
  created_at: string
}

export interface ExerciseSet {
  id: string
  exercise_id: string
  user_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  is_personal_record: boolean
  created_at: string
}

export interface Food {
  id: string
  user_id: string | null
  name: string
  brand: string | null
  default_unit: string
  calories_per_unit: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  salt_g: number
  is_favorite: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface FoodEntry {
  id: string
  user_id: string
  food_id: string | null
  entry_date: string
  meal_type: MealType
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  salt_g: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SavedMeal {
  id: string
  user_id: string
  name: string
  meal_type: MealType | null
  total_calories: number
  items: Array<{ food_name: string; quantity: number; unit: string; calories: number }>
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  user_id: string
  name: string
  servings: number
  instructions: string | null
  total_calories: number
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  user_id: string
  food_id: string | null
  name: string
  quantity: number
  unit: string
  calories: number
  created_at: string
}

export interface WaterEntry {
  id: string
  user_id: string
  entry_date: string
  amount_ml: number
  logged_at: string
  created_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  measured_date: string
  weight_kg: number | null
  body_fat_pct: number | null
  muscle_mass_kg: number | null
  bmi: number | null
  waist_cm: number | null
  chest_cm: number | null
  hips_cm: number | null
  arm_cm: number | null
  thigh_cm: number | null
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  resting_heart_rate: number | null
  blood_glucose: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SleepEntry {
  id: string
  user_id: string
  sleep_date: string
  bedtime: string
  wake_time: string
  duration_minutes: number
  quality: number | null
  awakenings: number
  deep_sleep_minutes: number
  light_sleep_minutes: number
  rem_sleep_minutes: number
  energy_on_wake: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  target_days: number[]
  target_value: number
  unit: string
  reminder_time: string | null
  is_archived: boolean
  current_streak: number
  best_streak: number
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  log_date: string
  value: number
  completed: boolean
  created_at: string
}

export interface DailyNote {
  id: string
  user_id: string
  note_date: string
  content: string
  created_at: string
  updated_at: string
}

export interface Mood {
  id: string
  user_id: string
  mood_date: string
  mood_level: number
  energy_level: number | null
  notes: string | null
  logged_at: string
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string | null
  icon: string
  earned_at: string
  created_at: string
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string | null
  notification_type: 'reminder' | 'insight' | 'achievement' | 'system'
  is_read: boolean
  created_at: string
}

// Wrapper minimo compatibile con il generic <Database> di supabase-js / postgrest-js.
// Tbl<> aggiunge automaticamente "Relationships", richiesto dal tipo GenericTable interno.
type Tbl<Row, Insert, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Tbl<Profile, Partial<Profile> & { id: string }>
      user_settings: Tbl<UserSettings, Partial<UserSettings> & { user_id: string }>
      goals: Tbl<Goal, Partial<Goal> & { user_id: string; goal_type: GoalType; target_value: number; unit: string }>
      daily_activity: Tbl<DailyActivity, Partial<DailyActivity> & { user_id: string }>
      workouts: Tbl<Workout, Partial<Workout> & { user_id: string; name: string; workout_type: WorkoutType }>
      workout_exercises: Tbl<WorkoutExercise, Partial<WorkoutExercise> & { workout_id: string; user_id: string; name: string }>
      exercise_sets: Tbl<ExerciseSet, Partial<ExerciseSet> & { exercise_id: string; user_id: string }>
      foods: Tbl<Food, Partial<Food> & { name: string }>
      food_entries: Tbl<FoodEntry, Partial<FoodEntry> & { user_id: string; meal_type: MealType; food_name: string }>
      saved_meals: Tbl<SavedMeal, Partial<SavedMeal> & { user_id: string; name: string }>
      recipes: Tbl<Recipe, Partial<Recipe> & { user_id: string; name: string }>
      recipe_ingredients: Tbl<RecipeIngredient, Partial<RecipeIngredient> & { recipe_id: string; user_id: string; name: string }>
      water_entries: Tbl<WaterEntry, Partial<WaterEntry> & { user_id: string; amount_ml: number }>
      body_measurements: Tbl<BodyMeasurement, Partial<BodyMeasurement> & { user_id: string }>
      sleep_entries: Tbl<SleepEntry, Partial<SleepEntry> & { user_id: string; bedtime: string; wake_time: string }>
      habits: Tbl<Habit, Partial<Habit> & { user_id: string; name: string }>
      habit_logs: Tbl<HabitLog, Partial<HabitLog> & { habit_id: string; user_id: string }>
      daily_notes: Tbl<DailyNote, Partial<DailyNote> & { user_id: string; content: string }>
      moods: Tbl<Mood, Partial<Mood> & { user_id: string; mood_level: number }>
      achievements: Tbl<Achievement, Partial<Achievement> & { user_id: string; achievement_type: string; title: string }>
      notifications: Tbl<AppNotification, Partial<AppNotification> & { user_id: string; title: string }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
