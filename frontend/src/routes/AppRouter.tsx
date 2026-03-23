import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/auth/store/authStore'
import { useEffect, useState, Suspense, lazy } from 'react'

// 🔥 Lazy Imports

// Auth
const LoginPage = lazy(() => import('@/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/auth/pages/RegisterPage'))
const LandingPage = lazy(() => import('@/auth/pages/LandingPage'))

// Admin
const AdminLayout = lazy(() => import('@/admin/layout/AdminLayout'))
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'))
const StudentsPage = lazy(() => import('@/admin/pages/StudentsPage'))
const VideosPage = lazy(() => import('@/admin/pages/VideosPage'))
const AdminCoursesPage = lazy(() => import('@/admin/pages/CoursesPage'))
const AdminBlogsPage = lazy(() => import('@/admin/pages/BlogsPage'))
const CategoriesPage = lazy(() => import('@/admin/pages/CategoriesPage'))
const SettingsPage = lazy(() => import('@/admin/pages/SettingsPage'))

// Instructor
const InstructorLayout = lazy(() => import('@/instructor/layout/InstructorLayout'))
const InstructorDashboardPage = lazy(() => import('@/instructor/pages/DashboardPage'))
const InstructorCoursesPage = lazy(() => import('@/instructor/pages/CoursesPage'))
const InstructorVideosPage = lazy(() => import('@/instructor/pages/VideosPage'))
const InstructorStudentsPage = lazy(() => import('@/instructor/pages/StudentsPage'))
const InstructorEnrollmentsPage = lazy(() => import('@/instructor/pages/EnrollmentsPage'))
const InstructorAnalyticsPage = lazy(() => import('@/instructor/pages/AnalyticsPage'))
const InstructorNotesPage = lazy(() => import('@/instructor/pages/NotesPage'))
const InstructorSettingsPage = lazy(() => import('@/instructor/pages/InstructorSettingsPage'))

// Student
const StudentLayout = lazy(() => import('@/student/layout/StudentLayout'))
const StudentDashboardPage = lazy(() => import('@/student/pages/DashboardPage'))
const CoursesPage = lazy(() => import('@/student/pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('@/student/pages/CourseDetailPage'))
const WatchPage = lazy(() => import('@/student/pages/WatchPage'))
const StudentBlogsPage = lazy(() => import('@/student/pages/BlogsPage'))
const BlogDetailPage = lazy(() => import('@/student/pages/BlogDetailPage'))
const ProfilePage = lazy(() => import('@/student/pages/ProfilePage'))
const StudentNotesPage = lazy(() => import('@/student/pages/NotesPage'))
const ChatDashboardPage = lazy(() => import('@/pages/chat/ChatDashboardPage'))

// 🔥 Loader
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Route Guard
function ProtectedRoute({
  children,
  requiredRole
}: {
  children: React.ReactNode,
  requiredRole?: 'student' | 'instructor' | 'admin'
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user) return null

  if (requiredRole && user.role !== requiredRole) {
    const homeMap = {
      student: '/student/dashboard',
      instructor: '/instructor/dashboard',
      admin: '/admin/dashboard'
    }
    return <Navigate to={homeMap[user.role]} replace />
  }

  return <>{children}</>
}

// Router
export default function AppRouter() {
  const { isAuthenticated, user } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* Auth */}
          <Route
            path="/login"
            element={
              isAuthenticated && user ? (
                <Navigate to={`/${user.role}/dashboard`} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root */}
          <Route
            path="/"
            element={
              isAuthenticated && user ? (
                <Navigate to={`/${user.role}/dashboard`} replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="watch/:videoId" element={<WatchPage />} />
            <Route path="blogs" element={<StudentBlogsPage />} />
            <Route path="blog/:id" element={<BlogDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notes" element={<StudentNotesPage />} />
            <Route path="messages" element={<ChatDashboardPage />} />
          </Route>

          {/* Instructor */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboardPage />} />
            <Route path="courses" element={<InstructorCoursesPage />} />
            <Route path="videos" element={<InstructorVideosPage />} />
            <Route path="notes" element={<InstructorNotesPage />} />
            <Route path="students" element={<InstructorStudentsPage />} />
            <Route path="enrollments" element={<InstructorEnrollmentsPage />} />
            <Route path="analytics" element={<InstructorAnalyticsPage />} />
            <Route path="messages" element={<ChatDashboardPage />} />
            <Route path="settings" element={<InstructorSettingsPage />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="messages" element={<ChatDashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}