import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection test warning:', error.message);
      return false;
    }
    console.log('✅ Connected successfully to Supabase API.');
    return true;
  } catch (err) {
    console.warn('⚠️ Supabase Connection Error:', err.message);
    return false;
  }
}
