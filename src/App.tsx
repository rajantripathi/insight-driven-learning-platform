import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthDebug from "@/components/AuthDebug";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelect from "./pages/RoleSelect";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import LessonBoard from "./pages/LessonBoard";
import CourseSetup from "./pages/CourseSetup";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [toastMessage, setToastMessage] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            {/* Accessibility announcement for toast messages */}
            <div aria-live="assertive" className="sr-only" id="toast-announcer">
              {toastMessage}
            </div>
            
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
              <Route path="/lesson-board" element={
                <ProtectedRoute>
                  <LessonBoard />
                </ProtectedRoute>
              } />
              <Route path="/course-setup" element={
                <ProtectedRoute>
                  <CourseSetup />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AuthDebug />
          </BrowserRouter>
          
          {/* Toast providers at the end for proper z-index */}
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
