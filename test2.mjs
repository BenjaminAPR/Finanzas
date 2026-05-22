import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('Incomes:', await supabase.from('incomes').select('*'));
  console.log('Budgets:', await supabase.from('budgets').select('*'));
  console.log('Expenses:', await supabase.from('expenses').select('*'));
  console.log('Debts:', await supabase.from('debts').select('*'));
}
run();
