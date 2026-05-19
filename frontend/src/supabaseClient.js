

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aagpvnpnfrusyvyjhswb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZ3B2bnBuZnJ1c3l2eWpoc3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDI2ODcsImV4cCI6MjA5MzUxODY4N30.NV0tnGGhHpEvN6-nhE0nCtlSxtMGltvRVTLC53uV66A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);