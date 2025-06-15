
-- FK indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course      ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_lesson    ON resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_activities_lesson   ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lesson  ON assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_assess    ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student    ON attempts(student_id);

-- teacher grading rights
CREATE POLICY "Teachers can grade attempts"
  ON attempts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN lessons  ON lessons.id  = assessments.lesson_id
      JOIN courses  ON courses.id  = lessons.course_id
      WHERE assessments.id = attempts.assessment_id
        AND courses.instructor_id = auth.uid()
    )
  );
