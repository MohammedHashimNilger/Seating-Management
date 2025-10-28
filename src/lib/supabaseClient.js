import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ijwncjpasdktxirvggoi.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqd25janBhc2RrdHhpcnZnZ29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjUyMzAsImV4cCI6MjA3MDc0MTIzMH0.64rWSTG5OEbyH9RaTixDOMU0gdqhA4K7aJmJraoIM9M"; // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
