import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Households:', await supabase.from('households').select('*'));
  console.log('Household Members:', await supabase.from('household_members').select('*'));
  console.log('Users:', await supabase.from('users').select('*'));
}
run();
