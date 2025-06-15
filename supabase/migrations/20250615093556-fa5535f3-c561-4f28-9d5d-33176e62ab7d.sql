
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student', 'program_lead')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CLOs (Course Learning Outcomes) table
CREATE TABLE public.clos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bloom_level TEXT CHECK (bloom_level IN ('Knowledge', 'Comprehension', 'Application', 'Analysis', 'Synthesis', 'Evaluation')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  clo_id UUID REFERENCES public.clos(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  session_no INTEGER NOT NULL,
  estimated_duration TEXT DEFAULT '2 hours',
  learning_objectives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('pdf', 'video', 'lab', 'reading', 'external')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  duration TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('reading', 'video-watch', 'lab-exercise', 'discussion', 'quiz')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT DEFAULT '30 min',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_duration TEXT DEFAULT '30 minutes',
  total_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('multiple-choice', 'true-false', 'short-answer')) NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB, -- For multiple choice options
  correct_answer TEXT NOT NULL,
  bloom_level TEXT CHECK (bloom_level IN ('Knowledge', 'Comprehension', 'Application', 'Analysis', 'Synthesis', 'Evaluation')),
  explanation TEXT,
  points INTEGER DEFAULT 5,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attempts table
CREATE TABLE public.attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Store student answers
  score INTEGER,
  total_possible INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for courses (teachers can manage, students can view enrolled courses)
CREATE POLICY "Teachers can manage own courses" ON public.courses FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Students can view courses" ON public.courses FOR SELECT USING (true);

-- RLS Policies for CLOs (inherit from course permissions)
CREATE POLICY "CLOs viewable by course viewers" ON public.clos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = clos.course_id)
);
CREATE POLICY "Teachers can manage CLOs in own courses" ON public.clos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = clos.course_id AND courses.instructor_id = auth.uid())
);

-- RLS Policies for lessons
CREATE POLICY "Lessons viewable by course viewers" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id)
);
CREATE POLICY "Teachers can manage lessons in own courses" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id AND courses.instructor_id = auth.uid())
);

-- RLS Policies for resources
CREATE POLICY "Resources viewable by lesson viewers" ON public.resources FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = resources.lesson_id
  )
);
CREATE POLICY "Teachers can manage resources in own courses" ON public.resources FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = resources.lesson_id AND courses.instructor_id = auth.uid()
  )
);

-- RLS Policies for activities
CREATE POLICY "Activities viewable by lesson viewers" ON public.activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = activities.lesson_id
  )
);
CREATE POLICY "Teachers can manage activities in own courses" ON public.activities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = activities.lesson_id AND courses.instructor_id = auth.uid()
  )
);

-- RLS Policies for assessments
CREATE POLICY "Assessments viewable by lesson viewers" ON public.assessments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = assessments.lesson_id
  )
);
CREATE POLICY "Teachers can manage assessments in own courses" ON public.assessments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.lessons 
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE lessons.id = assessments.lesson_id AND courses.instructor_id = auth.uid()
  )
);

-- RLS Policies for questions
CREATE POLICY "Questions viewable by assessment viewers" ON public.questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessments 
    JOIN public.lessons ON lessons.id = assessments.lesson_id
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE assessments.id = questions.assessment_id
  )
);
CREATE POLICY "Teachers can manage questions in own courses" ON public.questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.assessments 
    JOIN public.lessons ON lessons.id = assessments.lesson_id
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE assessments.id = questions.assessment_id AND courses.instructor_id = auth.uid()
  )
);

-- RLS Policies for attempts
CREATE POLICY "Students can view own attempts" ON public.attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create own attempts" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own attempts" ON public.attempts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view attempts in own courses" ON public.attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessments 
    JOIN public.lessons ON lessons.id = assessments.lesson_id
    JOIN public.courses ON courses.id = lessons.course_id
    WHERE assessments.id = attempts.assessment_id AND courses.instructor_id = auth.uid()
  )
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
