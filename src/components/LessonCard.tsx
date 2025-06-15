
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  session_no: number;
  estimated_duration: string;
  learning_objectives: string[];
  course_id: string;
  clo_id?: string;
}

interface LessonCardProps {
  lesson: Lesson;
  onDoubleClick: () => void;
  isDragging?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  onDoubleClick,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onDoubleClick={onDoubleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <Clock className="h-3 w-3" />
          <span>{lesson.estimated_duration}</span>
        </div>
        
        {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Target className="h-3 w-3 mt-0.5" />
            <span className="line-clamp-2">
              {lesson.learning_objectives[0]}
              {lesson.learning_objectives.length > 1 && ` +${lesson.learning_objectives.length - 1} more`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
