
import { Database } from '@/integrations/supabase/types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  'https://ubzitwkzwzmjztybnpsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieml0d2t6d3ptanp0eWJucHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Nzk0NDUsImV4cCI6MjA2NTU1NTQ0NX0.qLnRe3UoYgbSH3cvMGFVM7tyw20z-yd8A9darHFCp-8'
)

export const generateLesson = (payload: any) =>
  fetch('/functions/v1/generate-lesson', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(r=>r.json())

export const generateQuiz = (payload: any) =>
  fetch('/functions/v1/generate-quiz', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}).then(r=>r.json())
