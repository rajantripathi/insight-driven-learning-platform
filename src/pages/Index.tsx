
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BarChart3, BookOpen, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description: "Every student gets a unique learning path adapted to their pace and style"
    },
    {
      icon: Users,
      title: "Teacher Control",
      description: "Full oversight with human-in-the-loop approvals and real-time monitoring"
    },
    {
      icon: BarChart3,
      title: "Learning Analytics",
      description: "Track CLO/PLO attainment with comprehensive progress insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Personalized AI Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Give every learner the feeling of a 1-to-1 tutor with AI that adapts content, 
            practice, and feedback in real time—while keeping teachers fully in control.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/role-select')}
            >
              Get Started
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg rounded-xl border-2 hover:bg-blue-50 transition-all duration-200"
            >
              Watch Demo
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 rounded-2xl shadow-2xl">
          <CardContent className="py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-blue-100">Student Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">40%</div>
                <div className="text-blue-100">Faster Learning</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">60%</div>
                <div className="text-blue-100">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-blue-100">Teacher Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
