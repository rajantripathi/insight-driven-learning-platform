
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelect from "./pages/RoleSelect";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/role-select" element={
              <ProtectedRoute>
                <RoleSelect />
              </ProtectedRoute>
            } />
            <Route path="/teacher-dashboard" element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            {/* Placeholder routes for future development */}
            <Route path="/course-setup" element={
              <ProtectedRoute>
                <div className="p-8 text-center"><h1 className="text-2xl">Course Setup Wizard - Coming Soon</h1></div>
              </ProtectedRoute>
            } />
            <Route path="/lesson-board" element={
              <ProtectedRoute>
                <div className="p-8 text-center"><h1 className="text-2xl">Lesson Plan Board - Coming Soon</h1></div>
              </ProtectedRoute>
            } />
            <Route path="/student-lesson" element={
              <ProtectedRoute>
                <div className="p-8 text-center"><h1 className="text-2xl">Student Lesson View - Coming Soon</h1></div>
              </ProtectedRoute>
            } />
            <Route path="/assessment-builder" element={
              <ProtectedRoute>
                <div className="p-8 text-center"><h1 className="text-2xl">Assessment Builder - Coming Soon</h1></div>
              </ProtectedRoute>
            } />
            <Route path="/program-dashboard" element={
              <ProtectedRoute>
                <div className="p-8 text-center"><h1 className="text-2xl">Program Lead Dashboard - Coming Soon</h1></div>
              </ProtectedRoute>
            } />
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
