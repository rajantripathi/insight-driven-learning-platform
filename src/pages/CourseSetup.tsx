
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const CourseSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a course.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim()) {
        toast({
          title: "Validation Error",
          description: "Course title is required.",
          variant: "destructive",
        });
        return;
    }

    setLoading(true);

    try {
      console.log('Creating course with user ID:', user.id);
      const { data, error } = await supabase.from('courses').insert({
        title: title.trim(),
        description: description.trim() || null,
        instructor_id: user.id,
      }).select().single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Course created successfully:', data);
      toast({
        title: "Success!",
        description: "Your new course has been created.",
      });
      navigate('/teacher-dashboard');
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
      <div className="w-full max-w-2xl">
        <Button
          variant="outline"
          onClick={() => navigate('/teacher-dashboard')}
          className="mb-4 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a New Course</CardTitle>
            <CardDescription>Fill in the details below to set up your new course.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium text-gray-800">Course Title *</label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Computer Science"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
                  rows={4}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-bikal-blue hover:bg-bikal-blue/90 rounded-xl" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CourseSetup;
