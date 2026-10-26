-- Migration: sponsor website links. Run this in your Supabase SQL Editor.
-- Safe to re-run.
--
-- Sponsor cards on /sponsors link out to the sponsor's site when this is set.
-- Entered on /admin/sponsors/create; bare domains are normalised to https://
-- by the app before saving and again when rendered.

ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS website_url TEXT;
