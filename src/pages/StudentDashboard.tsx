
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, BarChart3, CheckIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIChatWidget } from "@/components/AIChatWidget";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const enrolledCourses = [
    { 
      id: 1, 
      name: "Introduction to Machine Learning", 
      progress: 65, 
      nextLesson: "Neural Networks Basics",
      instructor: "Dr. Sarah Chen",
      dueDate: "Tomorrow"
    },
    { 
      id: 2, 
      name: "Data Structures & Algorithms", 
      progress: 42, 
      nextLesson: "Binary Trees",
      instructor: "Prof. Michael Rodriguez",
      dueDate: "Dec 20"
    },
    { 
      id: 3, 
      name: "Web Development Fundamentals", 
      progress: 88, 
      nextLesson: "React Components",
      instructor: "Dr. Emily Johnson",
      dueDate: "Dec 18"
    }
  ];

  const upcomingTasks = [
    { task: "Complete ML Quiz 3", course: "Machine Learning", due: "Tomorrow", priority: "high" },
    { task: "Submit Algorithm Project", course: "Data Structures", due: "Dec 20", priority: "medium" },
    { task: "Read Chapter 8", course: "Web Development", due: "Dec 22", priority: "low" }
  ];

  const achievements = [
    { title: "Fast Learner", description: "Completed 5 lessons in one day", earned: true },
    { title: "Quiz Master", description: "Scored 95%+ on 3 consecutive quizzes", earned: true },
    { title: "Consistent Student", description: "7-day learning streak", earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex!</h1>
            <p className="text-gray-600 mt-2">Continue your learning journey with AI-powered assistance</p>
          </div>
          <div className="flex gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6">
              Continue Learning
            </Button>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Courses</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <BookOpen className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Learning Streak</p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-blue-100 text-sm">days</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg. Score</p>
                  <p className="text-3xl font-bold">87%</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Time Studied</p>
                  <p className="text-3xl font-bold">24h</p>
                  <p className="text-orange-100 text-sm">this week</p>
                </div>
                <Calendar className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all cursor-pointer group"
                       onClick={() => navigate('/student-lesson')}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                        <p className="text-sm text-blue-600 font-medium">Next: {course.nextLesson}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Due {course.dueDate}</span>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mt-1 ml-auto transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900 font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Achievements</CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.earned 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-green-600' : 'bg-gray-400'
                        }`}>
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold ml-3">{achievement.title}</h4>
                      </div>
                      <p className="text-sm">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border-0 shadow-lg rounded-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.task}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{task.course}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">AI Study Assistant</CardTitle>
                <CardDescription>Get instant help and guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Your AI companion is ready to help with questions, explanations, and study guidance.
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white rounded-xl"
                  onClick={() => {
                    // This would trigger the AI chat widget
                    console.log("Opening AI chat");
                  }}
                >
                  Start AI Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
};

export default StudentDashboard;
