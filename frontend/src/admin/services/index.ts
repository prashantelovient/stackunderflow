import apiClient from './apiClient'

// ---- MOCK DATA (used when no backend available) ----
export const MOCK_STUDENTS = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', enrolledCourse: 'React Mastery', joinDate: '2024-01-15', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', enrolledCourse: 'Node.js Pro', joinDate: '2024-02-20', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', enrolledCourse: 'Python Basics', joinDate: '2024-03-05', status: 'suspended' },
  { id: '4', name: 'David Brown', email: 'david@example.com', enrolledCourse: 'React Mastery', joinDate: '2024-03-10', status: 'active' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', enrolledCourse: 'Vue.js Essentials', joinDate: '2024-04-01', status: 'active' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', enrolledCourse: 'Node.js Pro', joinDate: '2024-04-15', status: 'suspended' },
  { id: '7', name: 'Grace Lee', email: 'grace@example.com', enrolledCourse: 'Python Basics', joinDate: '2024-05-02', status: 'active' },
  { id: '8', name: 'Henry Wilson', email: 'henry@example.com', enrolledCourse: 'React Mastery', joinDate: '2024-05-18', status: 'active' },
]

export const MOCK_CATEGORIES = [
  { id: '1', name: 'Web Development', slug: 'web-development', videoCount: 24 },
  { id: '2', name: 'Data Science', slug: 'data-science', videoCount: 18 },
  { id: '3', name: 'Mobile Development', slug: 'mobile-development', videoCount: 12 },
  { id: '4', name: 'DevOps', slug: 'devops', videoCount: 9 },
]

export const MOCK_COURSES = [
  { id: '1', title: 'React Mastery', description: 'Complete React from zero to hero', thumbnail: null, category: 'Web Development', moduleCount: 4, lectureCount: 12 },
  { id: '2', title: 'Node.js Pro', description: 'Backend with Node.js and Express', thumbnail: null, category: 'Web Development', moduleCount: 3, lectureCount: 8 },
  { id: '3', title: 'Python Basics', description: 'Learn Python programming fundamentals', thumbnail: null, category: 'Data Science', moduleCount: 5, lectureCount: 10 },
  { id: '4', title: 'Vue.js Essentials', description: 'Master Vue.js 3 composition API', thumbnail: null, category: 'Web Development', moduleCount: 3, lectureCount: 7 },
]

export const MOCK_VIDEOS = [
  { id: '1', title: 'React Hooks Deep Dive', description: 'Mastering useState, useEffect and custom hooks', thumbnail: null, courseId: '1', courseTitle: 'React Mastery', uploadDate: '2024-01-10' },
  { id: '2', title: 'Redux Toolkit Tutorial', description: 'State management with Redux Toolkit', thumbnail: null, courseId: '1', courseTitle: 'React Mastery', uploadDate: '2024-01-17' },
  { id: '3', title: 'Node.js REST API', description: 'Building RESTful APIs with Express', thumbnail: null, courseId: '2', courseTitle: 'Node.js Pro', uploadDate: '2024-02-05' },
  { id: '4', title: 'Python Lists & Dicts', description: 'Data structures in Python', thumbnail: null, courseId: '3', courseTitle: 'Python Basics', uploadDate: '2024-02-12' },
  { id: '5', title: 'Async/Await in JS', description: 'Mastering asynchronous JavaScript', thumbnail: null, courseId: '1', courseTitle: 'React Mastery', uploadDate: '2024-03-01' },
]

export const MOCK_BLOGS = [
  { id: '1', title: 'Getting Started with React', slug: 'getting-started-react', thumbnail: null, content: '<p>React is a JavaScript library...</p>', publishDate: '2024-01-20', status: 'published' },
  { id: '2', title: 'Node.js Best Practices', slug: 'nodejs-best-practices', thumbnail: null, content: '<p>Follow these best practices...</p>', publishDate: '2024-02-15', status: 'published' },
  { id: '3', title: 'Python for Data Science', slug: 'python-data-science', thumbnail: null, content: '<p>Python is the go-to language...</p>', publishDate: '2024-03-10', status: 'draft' },
]

export * as authService from './authService'
export * as studentService from '@/student/services/studentService'
export * as videoService from './videoService'
export * as courseService from './courseService'
export * as moduleService from './moduleService'
export * as lectureService from './lectureService'
export * as blogService from './blogService'
export * as categoryService from './categoryService'
export * as storageService from './storageService'


export const MOCK_ANALYTICS = {
  totalStudents: 1284,
  totalVideos: 47,
  totalCourses: 8,
  totalBlogs: 23,
  studentsByMonth: [
    { month: 'Jan', count: 65 }, { month: 'Feb', count: 89 }, { month: 'Mar', count: 120 },
    { month: 'Apr', count: 98 }, { month: 'May', count: 145 }, { month: 'Jun', count: 167 },
    { month: 'Jul', count: 189 }, { month: 'Aug', count: 132 }, { month: 'Sep', count: 98 },
    { month: 'Oct', count: 76 }, { month: 'Nov', count: 110 }, { month: 'Dec', count: 135 },
  ],
  videosByMonth: [
    { month: 'Jan', count: 3 }, { month: 'Feb', count: 5 }, { month: 'Mar', count: 4 },
    { month: 'Apr', count: 6 }, { month: 'May', count: 8 }, { month: 'Jun', count: 5 },
    { month: 'Jul', count: 4 }, { month: 'Aug', count: 3 }, { month: 'Sep', count: 2 },
    { month: 'Oct', count: 3 }, { month: 'Nov', count: 2 }, { month: 'Dec', count: 2 },
  ],
}

export const analyticsService = {
  get: async () => {
    const res = await apiClient.get('/admin/analytics')
    return res.data
  },
}

export const settingsService = {
  get: async () => ({ platformName: 'VideoLearnPro', emailHost: 'smtp.example.com', s3Bucket: 'my-bucket', s3Region: 'us-east-1' }),
  update: async (data: unknown) => data,
}
