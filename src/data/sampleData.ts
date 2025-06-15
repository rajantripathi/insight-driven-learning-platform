
export interface CLO {
  id: string;
  description: string;
  courseId: string;
}

export interface Resource {
  id: string;
  type: 'pdf' | 'video' | 'lab';
  title: string;
  url: string;
  duration?: string;
}

export interface Lesson {
  id: string;
  title: string;
  sessionNo: number;
  cloId: string;
  resources: Resource[];
  status: 'draft' | 'published' | 'completed';
  estimatedDuration: string;
}

export interface Course {
  id: string;
  name: string;
  learnerLevel: string;
  totalSessions: number;
  instructor: string;
  description: string;
}

// Sample Course Data
export const sampleCourse: Course = {
  id: 'ml-intro-001',
  name: 'Introduction to Machine Learning',
  learnerLevel: 'Undergraduate',
  totalSessions: 4,
  instructor: 'Dr. Sarah Chen',
  description: 'A comprehensive introduction to machine learning concepts, algorithms, and practical applications.'
};

// Sample CLOs for the ML course
export const sampleCLOs: CLO[] = [
  {
    id: 'clo-1',
    description: 'Understand fundamental machine learning concepts and terminology',
    courseId: 'ml-intro-001'
  },
  {
    id: 'clo-2',
    description: 'Apply supervised learning algorithms to solve classification problems',
    courseId: 'ml-intro-001'
  },
  {
    id: 'clo-3',
    description: 'Implement and evaluate unsupervised learning techniques',
    courseId: 'ml-intro-001'
  },
  {
    id: 'clo-4',
    description: 'Design and deploy end-to-end machine learning projects',
    courseId: 'ml-intro-001'
  }
];

// Sample Lessons with pre-filled resources
export const sampleLessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Introduction to Machine Learning Fundamentals',
    sessionNo: 1,
    cloId: 'clo-1',
    status: 'published',
    estimatedDuration: '2 hours',
    resources: [
      {
        id: 'res-1-1',
        type: 'pdf',
        title: 'ML Fundamentals Textbook - Chapter 1',
        url: '/resources/ml-fundamentals-ch1.pdf'
      },
      {
        id: 'res-1-2',
        type: 'video',
        title: 'Introduction to Machine Learning',
        url: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        duration: '45 min'
      },
      {
        id: 'res-1-3',
        type: 'lab',
        title: 'Python Setup and Data Exploration Lab',
        url: '/labs/python-setup-lab'
      }
    ]
  },
  {
    id: 'lesson-2',
    title: 'Supervised Learning: Classification Algorithms',
    sessionNo: 2,
    cloId: 'clo-2',
    status: 'published',
    estimatedDuration: '2.5 hours',
    resources: [
      {
        id: 'res-2-1',
        type: 'pdf',
        title: 'Classification Algorithms Research Paper',
        url: '/resources/classification-algorithms.pdf'
      },
      {
        id: 'res-2-2',
        type: 'video',
        title: 'Decision Trees and Random Forests Explained',
        url: 'https://www.youtube.com/watch?v=7VeUPuFGJHk',
        duration: '32 min'
      },
      {
        id: 'res-2-3',
        type: 'lab',
        title: 'Building Your First Classifier',
        url: '/labs/first-classifier-lab'
      }
    ]
  },
  {
    id: 'lesson-3',
    title: 'Unsupervised Learning: Clustering and Dimensionality Reduction',
    sessionNo: 3,
    cloId: 'clo-3',
    status: 'draft',
    estimatedDuration: '2 hours',
    resources: [
      {
        id: 'res-3-1',
        type: 'pdf',
        title: 'Unsupervised Learning Techniques',
        url: '/resources/unsupervised-learning.pdf'
      },
      {
        id: 'res-3-2',
        type: 'video',
        title: 'K-Means Clustering Visual Guide',
        url: 'https://www.youtube.com/watch?v=4b5d3muPQmA',
        duration: '28 min'
      },
      {
        id: 'res-3-3',
        type: 'lab',
        title: 'Customer Segmentation Lab',
        url: '/labs/customer-segmentation-lab'
      }
    ]
  },
  {
    id: 'lesson-4',
    title: 'ML Project Development and Deployment',
    sessionNo: 4,
    cloId: 'clo-4',
    status: 'draft',
    estimatedDuration: '3 hours',
    resources: [
      {
        id: 'res-4-1',
        type: 'pdf',
        title: 'MLOps Best Practices Guide',
        url: '/resources/mlops-best-practices.pdf'
      },
      {
        id: 'res-4-2',
        type: 'video',
        title: 'Deploying ML Models to Production',
        url: 'https://www.youtube.com/watch?v=nhKdqVlzPdA',
        duration: '40 min'
      },
      {
        id: 'res-4-3',
        type: 'lab',
        title: 'End-to-End ML Project Lab',
        url: '/labs/end-to-end-project-lab'
      }
    ]
  }
];

// Sample Quiz Data
export const sampleQuizData = {
  id: 'quiz-1',
  title: 'Machine Learning Fundamentals Quiz',
  lessonId: 'lesson-1',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the primary goal of supervised learning?',
      options: [
        'To find hidden patterns in data',
        'To predict outcomes based on labeled training data',
        'To reduce dimensionality of datasets',
        'To cluster similar data points'
      ],
      correctAnswer: 1,
      bloomsLevel: 'Knowledge'
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'Which of the following is NOT a supervised learning algorithm?',
      options: [
        'Linear Regression',
        'Decision Trees',
        'K-Means Clustering',
        'Support Vector Machines'
      ],
      correctAnswer: 2,
      bloomsLevel: 'Comprehension'
    }
  ]
};
