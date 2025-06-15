
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LessonBoard as LessonBoardComponent } from '@/components/LessonBoard';

const LessonBoardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">Please select a valid course to view lesson plans.</p>
            <Button onClick={() => navigate('/teacher-dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/teacher-dashboard')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lesson Plan Board</h1>
              <p className="text-gray-600 mt-2">Drag lessons between sessions to reorganize your course</p>
            </div>
          </div>
        </div>

        {/* Lesson Board */}
        <LessonBoardComponent courseId={courseId} />
      </div>
    </div>
  );
};

export default LessonBoardPage;
