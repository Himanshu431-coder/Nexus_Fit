import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otgkroxtmpcuyauducwt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z2tyb3h0bXBjdXlhdWR1Y3d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjM1NjIsImV4cCI6MjA5MTgzOTU2Mn0.iwFQViCnSBkpuQTvEv9794XCZgHPO_2DudUn7utjmPI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)