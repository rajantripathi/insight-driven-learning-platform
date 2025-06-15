
-- FK indexes for performance (only the indexes, policy already exists)
CREATE INDEX IF NOT EXISTS idx_lessons_course      ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_lesson    ON resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_activities_lesson   ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lesson  ON assessments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_assess    ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student    ON attempts(student_id);
