
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Target, Sparkles, RefreshCw } from 'lucide-react';
import { generateSessionPlan } from '@/api/sessionGeneration';
import { generateCourseTopics } from '@/api/topicGeneration';

interface SessionPlan {
  sessionNo: number;
  title: string;
  objectives: string[];
  estimatedDuration: string;
}

const CourseSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numberOfSessions, setNumberOfSessions] = useState(12);
  const [courseTopics, setCourseTopics] = useState('');
  const [sessionFrequency, setSessionFrequency] = useState('weekly');
  const [sessionDuration, setSessionDuration] = useState('2 hours');
  const [courseLevel, setCourseLevel] = useState('intermediate');
  const [courseCategory, setCourseCategory] = useState('');
  
  // Generated session plan
  const [sessionPlan, setSessionPlan] = useState<SessionPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingTopics, setGeneratingTopics] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      if (!title.trim()) {
        toast({
          title: "Validation Error",
          description: "Course title is required.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!courseTopics.trim()) {
        toast({
          title: "Validation Error",
          description: "Please provide the main topics you want to cover or use AI to generate them.",
          variant: "destructive",
        });
        return;
      }
      await generateSessions();
    } else if (step === 3) {
      await createCourseWithSessions();
    }
  };

  const handleGenerateTopics = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a course title first to generate topics.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingTopics(true);
    try {
      const generatedTopics = await generateCourseTopics({
        courseTitle: title,
        courseDescription: description,
        numberOfSessions,
        sessionDuration,
        courseLevel,
        courseCategory,
      });
      
      setCourseTopics(generatedTopics);
      
      toast({
        title: "Success!",
        description: "Course topics generated successfully. You can review and edit them.",
      });
    } catch (error: any) {
      console.error('Error generating topics:', error);
      toast({
        title: "Error",
        description: `Failed to generate topics: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGeneratingTopics(false);
    }
  };

  const generateSessions = async () => {
    setGenerating(true);
    try {
      const generatedPlan = await generateSessionPlan({
        courseTitle: title,
        courseDescription: description,
        numberOfSessions,
        topics: courseTopics,
        sessionDuration,
      });
      
      setSessionPlan(generatedPlan);
      setStep(3);
      
      toast({
        title: "Success!",
        description: "Session plan generated successfully. Review and customize if needed.",
      });
    } catch (error: any) {
      console.error('Error generating sessions:', error);
      toast({
        title: "Error",
        description: `Failed to generate session plan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const createCourseWithSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          instructor_id: user.id,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create lessons for each session
      const lessonsToInsert = sessionPlan.map(session => ({
        course_id: course.id,
        title: session.title,
        session_no: session.sessionNo,
        estimated_duration: session.estimatedDuration,
        learning_objectives: session.objectives,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert);

      if (lessonsError) throw lessonsError;

      toast({
        title: "Success!",
        description: `Course "${title}" created with ${sessionPlan.length} sessions.`,
      });
      
      navigate(`/lesson-board?courseId=${course.id}`);
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSessionTitle = (sessionNo: number, newTitle: string) => {
    setSessionPlan(prev => 
      prev.map(session => 
        session.sessionNo === sessionNo 
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to create a course.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate('/teacher-dashboard')}
          className="mb-4 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {step} of 3</span>
            <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-bikal-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-0 shadow-lg rounded-2xl">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create a New Course</CardTitle>
                <CardDescription>Let's start with the basic information about your course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="font-medium text-gray-800">Course Title *</label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Computer Science"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="font-medium text-gray-800">Course Description</label>
                  <Textarea
                    id="description"
                    placeholder="A brief summary of what this course is about."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="level" className="font-medium text-gray-800">Course Level</label>
                    <select
                      id="level"
                      value={courseLevel}
                      onChange={(e) => setCourseLevel(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="font-medium text-gray-800">Course Category</label>
                    <Input
                      id="category"
                      placeholder="e.g., Computer Science, Mathematics, Business"
                      value={courseCategory}
                      onChange={(e) => setCourseCategory(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Plan Your Sessions</CardTitle>
                <CardDescription>Configure your course structure and define the topics to cover.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="sessions" className="font-medium text-gray-800">Number of Sessions *</label>
                    <Input
                      id="sessions"
                      type="number"
                      min="1"
                      max="20"
                      value={numberOfSessions}
                      onChange={(e) => setNumberOfSessions(parseInt(e.target.value) || 12)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="duration" className="font-medium text-gray-800">Session Duration</label>
                    <select
                      id="duration"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                      <option value="2.5 hours">2.5 hours</option>
                      <option value="3 hours">3 hours</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="topics" className="font-medium text-gray-800">Course Topics & Outline *</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateTopics}
                      disabled={generatingTopics || !title.trim()}
                      className="rounded-xl"
                    >
                      {generatingTopics ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="topics"
                    placeholder="List the main topics, concepts, or modules you want to cover in this course. Be as detailed as possible to help us create a better session plan."
                    value={courseTopics}
                    onChange={(e) => setCourseTopics(e.target.value)}
                    rows={8}
                    className="rounded-xl"
                  />
                  <p className="text-sm text-gray-500">
                    💡 Tip: Use the "Generate with AI" button to automatically create a comprehensive topic outline based on your course details.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Review Your Session Plan</CardTitle>
                <CardDescription>
                  Here's your AI-generated session plan. You can edit session titles before creating the course.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {sessionPlan.map((session) => (
                    <div key={session.sessionNo} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-bikal-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                          {session.sessionNo}
                        </div>
                        <Input
                          value={session.title}
                          onChange={(e) => updateSessionTitle(session.sessionNo, e.target.value)}
                          className="font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{session.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{session.objectives.length} objectives</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <ul className="list-disc list-inside space-y-1">
                          {session.objectives.slice(0, 2).map((objective, idx) => (
                            <li key={idx}>{objective}</li>
                          ))}
                          {session.objectives.length > 2 && (
                            <li className="text-gray-500">+{session.objectives.length - 2} more objectives</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex gap-3">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="rounded-xl"
                disabled={loading || generating}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="flex-1 bg-bikal-blue hover:bg-bikal-blue/90 rounded-xl"
              disabled={loading || generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Sessions...
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Course...
                </>
              ) : step === 3 ? (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Course with {sessionPlan.length} Sessions
                </>
              ) : (
                <>
                  {step === 2 ? 'Generate Session Plan' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CourseSetup;
