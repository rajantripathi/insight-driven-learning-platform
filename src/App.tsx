
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RoleSelect from "./pages/RoleSelect";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          {/* Placeholder routes for future development */}
          <Route path="/course-setup" element={<div className="p-8 text-center"><h1 className="text-2xl">Course Setup Wizard - Coming Soon</h1></div>} />
          <Route path="/lesson-board" element={<div className="p-8 text-center"><h1 className="text-2xl">Lesson Plan Board - Coming Soon</h1></div>} />
          <Route path="/student-lesson" element={<div className="p-8 text-center"><h1 className="text-2xl">Student Lesson View - Coming Soon</h1></div>} />
          <Route path="/assessment-builder" element={<div className="p-8 text-center"><h1 className="text-2xl">Assessment Builder - Coming Soon</h1></div>} />
          <Route path="/program-dashboard" element={<div className="p-8 text-center"><h1 className="text-2xl">Program Lead Dashboard - Coming Soon</h1></div>} />
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
