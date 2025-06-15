
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { generateLesson } from '@/lib/aiClient';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Clock, Target, BookOpen, Activity, Loader2 } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  session_no: number;
  estimated_duration: string;
  learning_objectives: string[];
  course_id: string;
  clo_id?: string;
}

interface Resource {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  duration?: string;
}

interface LessonActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  estimated_time: string;
}

interface LessonModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onLessonUpdated: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onLessonUpdated,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<LessonActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lesson && isOpen) {
      fetchLessonDetails();
    }
  }, [lesson, isOpen]);

  const fetchLessonDetails = async () => {
    if (!lesson) return;

    setLoading(true);
    try {
      const [resourcesResponse, activitiesResponse] = await Promise.all([
        supabase.from('resources').select('*').eq('lesson_id', lesson.id).order('order_index'),
        supabase.from('activities').select('*').eq('lesson_id', lesson.id).order('order_index'),
      ]);

      if (resourcesResponse.error) throw resourcesResponse.error;
      if (activitiesResponse.error) throw activitiesResponse.error;

      setResources(resourcesResponse.data || []);
      setActivities(activitiesResponse.data || []);
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lesson) return;

    setRegenerating(true);
    try {
      // Generate new lesson content
      const response = await generateLesson({
        courseId: lesson.course_id,
        cloId: lesson.clo_id,
        sessionNo: lesson.session_no,
        topic: lesson.title,
        learningOutcomes: lesson.learning_objectives,
      });

      // Update lesson
      const { error: lessonError } = await supabase
        .from('lessons')
        .update({
          title: response.title,
          estimated_duration: response.estimatedDuration,
          learning_objectives: response.learningObjectives,
        })
        .eq('id', lesson.id);

      if (lessonError) throw lessonError;

      // Delete existing resources and activities
      await Promise.all([
        supabase.from('resources').delete().eq('lesson_id', lesson.id),
        supabase.from('activities').delete().eq('lesson_id', lesson.id),
      ]);

      // Insert new resources
      if (response.resources.length > 0) {
        const { error: resourcesError } = await supabase
          .from('resources')
          .insert(
            response.resources.map((resource, index) => ({
              lesson_id: lesson.id,
              type: resource.type,
              title: resource.title,
              description: resource.description,
              url: resource.url,
              duration: resource.duration,
              order_index: index,
            }))
          );

        if (resourcesError) throw resourcesError;
      }

      // Insert new activities
      if (response.activities.length > 0) {
        const { error: activitiesError } = await supabase
          .from('activities')
          .insert(
            response.activities.map((activity, index) => ({
              lesson_id: lesson.id,
              type: activity.type,
              title: activity.title,
              description: activity.description,
              estimated_time: activity.estimatedTime,
              order_index: index,
            }))
          );

        if (activitiesError) throw activitiesError;
      }

      // Refresh data
      await fetchLessonDetails();
      onLessonUpdated();

      toast({
        title: "Success",
        description: "Lesson content regenerated successfully",
      });
    } catch (error) {
      console.error('Error regenerating lesson:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate lesson content",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {lesson.title}
            </DialogTitle>
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-bikal-blue hover:bg-bikal-blue/90"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI Regenerate
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lesson Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lesson Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {lesson.estimated_duration}</span>
                  <Badge variant="outline">Session {lesson.session_no}</Badge>
                </div>
                
                {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Learning Objectives:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {lesson.learning_objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            {resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Resources ({resources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <div key={resource.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {resource.type}
                              </Badge>
                              <h5 className="font-medium text-sm">{resource.title}</h5>
                              {resource.duration && (
                                <span className="text-xs text-gray-500">({resource.duration})</span>
                              )}
                            </div>
                            {resource.description && (
                              <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                            )}
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-bikal-blue hover:underline"
                            >
                              {resource.url}
                            </a>
                          </div>
                        </div>
                        {index < resources.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activities ({activities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {activity.type}
                              </Badge>
                              <h5 className="font-medium text-sm">{activity.title}</h5>
                              <span className="text-xs text-gray-500">({activity.estimated_time})</span>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            )}
                          </div>
                        </div>
                        {index < activities.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resources.length === 0 && activities.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No resources or activities found for this lesson.</p>
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="mt-4"
                    variant="outline"
                  >
                    Generate Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
