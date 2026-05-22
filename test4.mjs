import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const userId = "b520-7a6fb94aa79e";
  console.log("Fetching member...");
  const res1 = await supabase.from('household_members').select('*').eq('user_id', userId);
  console.log(JSON.stringify(res1, null, 2));

  console.log("Fetching bank accounts...");
  const res2 = await supabase.from('bank_accounts').select('*').eq('user_id', userId);
  console.log(JSON.stringify(res2, null, 2));
}

run();
