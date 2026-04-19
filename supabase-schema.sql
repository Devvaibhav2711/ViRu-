-- =============================================================
-- ViRu Wadapav — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================

-- -----------------------------------------------
-- 1. Orders table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]'::jsonb,
  total         NUMERIC NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed')),
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  review_id     TEXT
);

-- -----------------------------------------------
-- 2. Reviews table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  order_id      TEXT REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_by_admin BOOLEAN NOT NULL DEFAULT false
);

-- -----------------------------------------------
-- 3. Row Level Security (RLS)
-- -----------------------------------------------

-- Enable RLS on both tables
ALTER TABLE orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon role) to insert orders
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to read orders (admin dashboard uses anon key)
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

-- Allow anyone to update orders (for status toggle)
CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anyone to insert reviews
CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to read reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO anon
  USING (true);

-- Allow anyone to update reviews (for mark-as-seen)
CREATE POLICY "Anyone can update reviews"
  ON reviews FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------
-- 4. Keep-alive helper (used by GitHub Actions cron)
-- -----------------------------------------------
-- This is a simple RPC that returns 1, used to ping the database.
CREATE OR REPLACE FUNCTION keep_alive() RETURNS INT AS $$
  SELECT 1;
$$ LANGUAGE sql SECURITY DEFINER;
