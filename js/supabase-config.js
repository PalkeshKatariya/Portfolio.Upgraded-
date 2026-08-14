/**
 * ============================================================================
 * SUPABASE CONFIGURATION
 * ============================================================================
 * 
 * 1. Create a free project at https://supabase.com
 * 2. Go to Project Settings -> API
 * 3. Paste your "Project URL" and "anon public API key" below.
 */

const SUPABASE_URL = "https://cyzishlkwfrboljjexsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5emlzaGxrd2ZyYm9sampleHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MzcyOTYsImV4cCI6MjEwMTUxMzI5Nn0.unp-JNTidR1UPMniamNy0RBOY5eNEqNizNh94ia0rDo";

// Initialize the Supabase client globally so both main.js and admin.js can use it
window.supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE") {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase is not configured! Please add your keys to js/supabase-config.js.");
}
