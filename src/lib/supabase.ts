import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  price: number;
  dietary: 'veg' | 'non-veg' | 'vegan' | 'egg' | 'mixed';
  spice_level: number;
  description: string | null;
  options: string[] | null; // Array of options like ["CHICKEN", "BUFF"]
  image_url: string | null;
  is_available: boolean;
};

export type Order = {
  id: string;
  table_number: number | null;
  items: CartItem[];
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  dietary: string;
  selectedOption?: string; // e.g. "CHICKEN"
};
