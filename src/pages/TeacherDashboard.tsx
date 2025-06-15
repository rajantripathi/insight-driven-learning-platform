
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, BarChart3, Settings, Calendar, CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

const fetchUserCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    // Don't throw here, let useQuery handle the error state.
    // This allows us to display a toast message in the component.
    throw error;
  }
  return data || [];
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: courses, isLoading: loading, error } = useQuery<Course[], Error>({
    queryKey: ['teacherCourses'],
    queryFn: fetchUserCourses,
    retry: false, // Don't retry on failure, show error to user immediately.
  });

  if (error) {
    toast({
        title: "Error",
        description: `Failed to load your courses. Please try again later.`,
        variant: "destructive",
    });
  }

  const recentActivity = [
    { action: "Lesson plan generated", course: "Introduction to Programming", time: "2 hours ago" },
    { action: "New student enrolled", course: "Data Structures", time: "4 hours ago" },
    { action: "Quiz created", course: "Introduction to Programming", time: "1 day ago" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bikal-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your courses and track student progress</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/course-setup')}
              className="bg-bikal-blue hover:bg-bikal-blue/90 text-white rounded-xl px-6"
            >
              Create New Course
            </Button>
            <Button variant="outline" className="rounded-xl px-6">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-bikal-blue to-blue-700 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Courses</p>
                  <p className="text-3xl font-bold">{courses?.length ?? 0}</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Students</p>
                  <p className="text-3xl font-bold">284</p>
                </div>
                <Users className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg. Progress</p>
                  <p className="text-3xl font-bold">73%</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">This Week</p>
                  <p className="text-3xl font-bold">18</p>
                  <p className="text-orange-100 text-sm">Assessments</p>
                </div>
                <Calendar className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Courses */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Active Courses</CardTitle>
                <CardDescription>Manage and monitor your course progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(courses?.length ?? 0) === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No courses found. Create your first course to get started!</p>
                    <Button 
                      onClick={() => navigate('/course-setup')}
                      className="bg-bikal-blue hover:bg-bikal-blue/90 text-white"
                    >
                      Create Course
                    </Button>
                  </div>
                ) : (
                  courses?.map((course) => (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                         onClick={() => navigate(`/lesson-board?courseId=${course.id}`)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.description || 'No description'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Course Progress</span>
                          <span className="text-gray-900 font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                    <div className="bg-bikal-blue p-1 rounded-full mt-1">
                      <CheckIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.course}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl hover:bg-blue-50"
                  onClick={() => navigate('/assessment-builder')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-blue-50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
