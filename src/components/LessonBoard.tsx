
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LessonColumn } from './LessonColumn';
import { LessonCard } from './LessonCard';
import { LessonModal } from './LessonModal';

interface Lesson {
  id: string;
  title: string;
  session_no: number;
  estimated_duration: string;
  learning_objectives: string[];
  course_id: string;
  clo_id?: string;
}

interface LessonBoardProps {
  courseId: string;
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const LessonBoard: React.FC<LessonBoardProps> = ({ courseId }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setError(null);
      
      // Validate UUID format
      if (!isValidUUID(courseId)) {
        setError('Invalid course ID format. Please select a valid course.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('session_no');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to load lessons. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load lessons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lesson = lessons.find(l => l.id === active.id);
    setActiveLesson(lesson || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLesson(null);

    if (!over) return;

    const lessonId = active.id as string;
    const newSessionNo = parseInt(over.id as string);
    const lesson = lessons.find(l => l.id === lessonId);

    if (!lesson || lesson.session_no === newSessionNo) return;

    // Optimistic update
    const originalLessons = [...lessons];
    const updatedLessons = lessons.map(l =>
      l.id === lessonId ? { ...l, session_no: newSessionNo } : l
    );
    setLessons(updatedLessons);

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ session_no: newSessionNo })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lesson moved to Session ${newSessionNo}`,
      });
    } catch (error) {
      // Revert optimistic update
      setLessons(originalLessons);
      console.error('Error updating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to move lesson",
        variant: "destructive",
      });
    }
  };

  const handleLessonDoubleClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  const maxSessions = Math.max(12, Math.max(...lessons.map(l => l.session_no), 0) + 1);
  const sessionColumns = Array.from({ length: maxSessions }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bikal-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchLessons}
            className="px-4 py-2 bg-bikal-blue text-white rounded hover:bg-bikal-blue/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sessionColumns.map(sessionNo => (
            <LessonColumn
              key={sessionNo}
              sessionNo={sessionNo}
              lessons={lessons.filter(l => l.session_no === sessionNo)}
              onLessonDoubleClick={handleLessonDoubleClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLesson ? (
            <LessonCard
              lesson={activeLesson}
              onDoubleClick={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <LessonModal
        lesson={selectedLesson}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLesson(null);
        }}
        onLessonUpdated={fetchLessons}
      />
    </div>
  );
};
