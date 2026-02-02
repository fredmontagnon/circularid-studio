import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL to create the products table in Supabase:
// Run this in Supabase SQL editor:
/*
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  raw_input TEXT NOT NULL,
  compliance_data JSONB NOT NULL,
  data_completeness_score NUMERIC(5,2) DEFAULT 0,
  circularity_score NUMERIC(5,2) DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_products_scores ON products (data_completeness_score, circularity_score);
CREATE INDEX idx_products_created ON products (created_at DESC);
*/
