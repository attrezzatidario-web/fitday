-- =====================================================================
-- FITDAY — MIGRAZIONE 002: personalizzazione dashboard
-- Esegui questo file nel SQL editor di Supabase DOPO aver già eseguito
-- supabase/schema.sql (aggiunge solo una colonna, non tocca le tabelle esistenti)
-- =====================================================================

alter table user_settings
  add column if not exists dashboard_widgets text[] default array[
    'steps','distance','active_calories','total_calories','workouts','water',
    'calories_in','protein','carbs','fat','weight','balance','sleep','habits'
  ];
