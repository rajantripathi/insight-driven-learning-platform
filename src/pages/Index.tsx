
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-bikal-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-bikal-blue mr-2" />
              <span className="text-xl font-bold text-bikal-blue">AI Learning Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Revolutionize Education with
            <span className="text-bikal-blue"> AI-Powered Learning</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Create personalized lesson plans, generate adaptive assessments, and track student progress 
            with our cutting-edge AI platform designed for modern educators.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link to="/role-select">
              <Button size="lg" className="bg-bikal-blue hover:bg-bikal-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to create and deliver exceptional learning experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-bikal-blue mx-auto mb-4" />
                <CardTitle>AI Lesson Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate comprehensive lesson plans aligned with learning outcomes using advanced AI
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart className="h-12 w-12 text-bikal-blue mx-auto mb-4" />
                <CardTitle>Smart Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create adaptive quizzes and assessments that match Bloom's taxonomy levels
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-bikal-blue mx-auto mb-4" />
                <CardTitle>Student Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track student progress and identify learning gaps with detailed analytics
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <GraduationCap className="h-12 w-12 text-bikal-blue mx-auto mb-4" />
                <CardTitle>Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organize courses, manage CLOs, and streamline educational workflows
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
