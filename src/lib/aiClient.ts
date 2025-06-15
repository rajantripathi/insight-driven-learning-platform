
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  // For environments using Next.js, you might use these env vars.
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const generateLesson = (payload: unknown) =>
  fetch('/functions/v1/generate-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(async r => {
    const json = await r.json()
    if (!r.ok || json.error) throw new Error(json.error || 'Lesson generation failed')
    return json
  })

export const generateQuiz = (payload: unknown) =>
  fetch('/functions/v1/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(async r => {
    const json = await r.json()
    if (!r.ok || json.error) throw new Error(json.error || 'Quiz generation failed')
    return json
  })
