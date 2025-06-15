
-- Helper function to check if a user is the instructor of a course
CREATE OR REPLACE FUNCTION public.is_course_instructor(course_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.courses
    WHERE id = course_id_to_check AND instructor_id = auth.uid()
  );
END;
$$;

-- Helper function to check if a user is the instructor for a lesson
CREATE OR REPLACE FUNCTION public.is_lesson_instructor(lesson_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  course_id_for_lesson uuid;
BEGIN
  -- Find the course_id for the given lesson_id
  SELECT course_id INTO course_id_for_lesson FROM public.lessons WHERE id = lesson_id_to_check;
  
  -- If a course_id was found, check if the current user is the instructor
  IF course_id_for_lesson IS NOT NULL THEN
    RETURN public.is_course_instructor(course_id_for_lesson);
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


-- Secure 'courses' table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view their own courses"
ON public.courses FOR SELECT
USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can create courses"
ON public.courses FOR INSERT
WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their own courses"
ON public.courses FOR UPDATE
USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their own courses"
ON public.courses FOR DELETE
USING (auth.uid() = instructor_id);


-- Secure 'lessons' table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage lessons for their courses"
ON public.lessons FOR ALL
USING (public.is_course_instructor(course_id));

-- Secure 'resources' table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage resources for their lessons"
ON public.resources FOR ALL
USING (public.is_lesson_instructor(lesson_id));

-- Secure 'activities' table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage activities for their lessons"
ON public.activities FOR ALL
USING (public.is_lesson_instructor(lesson_id));

