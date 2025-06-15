
import { sampleLessons, sampleCLOs } from '../data/sampleData';

export interface LessonDraftRequest {
  courseTitle: string;
  learnerLevel: string;
  sessionNumber: number;
  cloDescription: string;
}

export interface LessonDraftResponse {
  id: string;
  title: string;
  sessionNo: number;
  cloId: string;
  estimatedDuration: string;
  learningObjectives: string[];
  resources: Array<{
    type: 'pdf' | 'video' | 'lab';
    title: string;
    description: string;
    url: string;
    duration?: string;
  }>;
  activities: Array<{
    type: 'reading' | 'video-watch' | 'lab-exercise' | 'discussion';
    title: string;
    description: string;
    estimatedTime: string;
  }>;
}

// Stub API function that returns static lesson JSON
export const generateLessonDraft = async (request: LessonDraftRequest): Promise<LessonDraftResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Find matching sample lesson or create a new one
  const existingLesson = sampleLessons.find(lesson => lesson.sessionNo === request.sessionNumber);
  
  if (existingLesson) {
    return {
      id: existingLesson.id,
      title: existingLesson.title,
      sessionNo: existingLesson.sessionNo,
      cloId: existingLesson.cloId,
      estimatedDuration: existingLesson.estimatedDuration,
      learningObjectives: [
        `Understand ${request.cloDescription.toLowerCase()}`,
        `Apply concepts through practical exercises`,
        `Analyze real-world examples and case studies`
      ],
      resources: existingLesson.resources.map(resource => ({
        type: resource.type,
        title: resource.title,
        description: `Comprehensive ${resource.type} resource covering key concepts`,
        url: resource.url,
        duration: resource.duration
      })),
      activities: [
        {
          type: 'reading',
          title: 'Pre-class Reading',
          description: 'Review fundamental concepts and terminology',
          estimatedTime: '30 min'
        },
        {
          type: 'video-watch',
          title: 'Instructional Video',
          description: 'Watch demonstration of key concepts',
          estimatedTime: '45 min'
        },
        {
          type: 'lab-exercise',
          title: 'Hands-on Practice',
          description: 'Complete guided exercises and experiments',
          estimatedTime: '60 min'
        }
      ]
    };
  }
  
  // Return a generic lesson structure for new sessions
  return {
    id: `lesson-${request.sessionNumber}`,
    title: `${request.courseTitle} - Session ${request.sessionNumber}`,
    sessionNo: request.sessionNumber,
    cloId: `clo-${request.sessionNumber}`,
    estimatedDuration: '2 hours',
    learningObjectives: [
      `Understand ${request.cloDescription.toLowerCase()}`,
      `Apply concepts through practical exercises`,
      `Analyze real-world examples and case studies`
    ],
    resources: [
      {
        type: 'pdf',
        title: `Session ${request.sessionNumber} Reading Materials`,
        description: 'Comprehensive PDF covering key concepts',
        url: `/resources/session-${request.sessionNumber}.pdf`
      },
      {
        type: 'video',
        title: `Session ${request.sessionNumber} Lecture Video`,
        description: 'Instructional video explaining core topics',
        url: `https://www.youtube.com/watch?v=example${request.sessionNumber}`,
        duration: '45 min'
      },
      {
        type: 'lab',
        title: `Session ${request.sessionNumber} Lab Exercise`,
        description: 'Hands-on practice and experimentation',
        url: `/labs/session-${request.sessionNumber}-lab`
      }
    ],
    activities: [
      {
        type: 'reading',
        title: 'Pre-class Reading',
        description: 'Review fundamental concepts and terminology',
        estimatedTime: '30 min'
      },
      {
        type: 'video-watch',
        title: 'Instructional Video',
        description: 'Watch demonstration of key concepts',
        estimatedTime: '45 min'
      },
      {
        type: 'lab-exercise',
        title: 'Hands-on Practice',
        description: 'Complete guided exercises and experiments',
        estimatedTime: '60 min'
      }
    ]
  };
};
