const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔌 Initializing Supabase clients...');

// Admin client - bypasses RLS (use in backend only)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,  // ✅ This must be the SERVICE ROLE key
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// Public client - respects RLS (for frontend or when user context matters)
const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log('✅ Supabase clients initialized');

module.exports = { supabaseAdmin, supabasePublic };