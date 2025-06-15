
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LessonCard } from './LessonCard';

interface Lesson {
  id: string;
  title: string;
  session_no: number;
  estimated_duration: string;
  learning_objectives: string[];
  course_id: string;
  clo_id?: string;
}

interface LessonColumnProps {
  sessionNo: number;
  lessons: Lesson[];
  onLessonDoubleClick: (lesson: Lesson) => void;
}

export const LessonColumn: React.FC<LessonColumnProps> = ({
  sessionNo,
  lessons,
  onLessonDoubleClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sessionNo.toString(),
  });

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          Session {sessionNo}
        </h3>
        
        <div
          ref={setNodeRef}
          className={`min-h-96 space-y-3 transition-colors ${
            isOver ? 'bg-blue-50 border-2 border-dashed border-bikal-blue rounded-lg' : ''
          }`}
        >
          <SortableContext
            items={lessons.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onDoubleClick={() => onLessonDoubleClick(lesson)}
              />
            ))}
          </SortableContext>
          
          {lessons.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Drop lessons here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
