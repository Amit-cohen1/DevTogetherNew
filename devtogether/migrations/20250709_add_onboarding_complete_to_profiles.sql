-- Migration: Add onboarding_complete to profiles
-- Adds the onboarding_complete boolean column to profiles, default true, and backfills all users

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT true;

UPDATE profiles SET onboarding_complete = true WHERE onboarding_complete IS NULL; 