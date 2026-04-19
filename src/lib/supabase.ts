import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ibndiciahzodewwqvvpb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibmRpY2lhaHpvZGV3d3F2dnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MjkyNjQsImV4cCI6MjA5MjEwNTI2NH0.d0dtAu_8zzpLDLcuDyAmeXOQssx-_VemDKKv9gcj09I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
