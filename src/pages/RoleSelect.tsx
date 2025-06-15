
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Master courses quickly with AI-powered personalized learning",
      icon: GraduationCap,
      features: ["Adaptive lesson paths", "Instant AI tutoring", "Progress tracking", "Voice & text chat"],
      color: "from-green-500 to-emerald-600",
      route: "/student-dashboard"
    },
    {
      id: "teacher",
      title: "Teacher",
      description: "Create and manage courses with intelligent AI assistance",
      icon: Users,
      features: ["Course setup wizard", "AI lesson generation", "Assessment builder", "Student monitoring"],
      color: "from-blue-500 to-indigo-600",
      route: "/teacher-dashboard"
    },
    {
      id: "program-lead",
      title: "Program Lead",
      description: "Monitor learning outcomes and generate comprehensive reports",
      icon: BarChart3,
      features: ["CLO/PLO analytics", "Cohort insights", "Export reports", "Accreditation tools"],
      color: "from-purple-500 to-violet-600",
      route: "/program-dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to access personalized features and dashboards
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl bg-white/90 backdrop-blur-sm hover:scale-105 group cursor-pointer"
              onClick={() => navigate(role.route)}
            >
              <CardHeader className="text-center pb-6">
                <div className={`bg-gradient-to-r ${role.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">{role.title}</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(role.route);
                  }}
                >
                  Enter as {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
