
-- Indexes for speed
CREATE INDEX IF NOT EXISTS lessons_course_idx      ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS resources_lesson_idx    ON public.resources(lesson_id);
CREATE INDEX IF NOT EXISTS activities_lesson_idx   ON public.activities(lesson_id);
CREATE INDEX IF NOT EXISTS assessments_lesson_idx  ON public.assessments(lesson_id);
CREATE INDEX IF NOT EXISTS questions_assess_idx    ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS attempts_student_idx    ON public.attempts(student_id);

-- Teacher grading rights
CREATE POLICY "Teachers can grade attempts"
  ON public.attempts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.assessments
    JOIN public.lessons  ON lessons.id  = assessments.lesson_id
    JOIN public.courses  ON courses.id  = lessons.course_id
    WHERE assessments.id = attempts.assessment_id
      AND courses.instructor_id = auth.uid()
  ));
