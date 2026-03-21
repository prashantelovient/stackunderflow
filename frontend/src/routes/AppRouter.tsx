import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/auth/store/authStore'
import { useEffect, useState } from 'react'

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage from '@/auth/pages/LoginPage'
import RegisterPage from '@/auth/pages/RegisterPage'

// ── Admin ────────────────────────────────────────────────────────────────────
import AdminLayout from '@/admin/layout/AdminLayout'
import DashboardPage from '@/admin/pages/DashboardPage'
import StudentsPage from '@/admin/pages/StudentsPage'
import VideosPage from '@/admin/pages/VideosPage'
import AdminCoursesPage from '@/admin/pages/CoursesPage'
import AdminBlogsPage from '@/admin/pages/BlogsPage'
import CategoriesPage from '@/admin/pages/CategoriesPage'
import SettingsPage from '@/admin/pages/SettingsPage'

// ── Instructor ──────────────────────────────────────────────────────────────
import InstructorLayout from '@/instructor/layout/InstructorLayout'
import InstructorDashboardPage from '@/instructor/pages/DashboardPage'
import InstructorCoursesPage from '@/instructor/pages/CoursesPage'
import InstructorVideosPage from '@/instructor/pages/VideosPage'
import InstructorStudentsPage from '@/instructor/pages/StudentsPage'
import InstructorEnrollmentsPage from '@/instructor/pages/EnrollmentsPage'
import InstructorAnalyticsPage from '@/instructor/pages/AnalyticsPage'


// ── Student ───────────────────────────────────────────────────────────────────
import StudentLayout from '@/student/layout/StudentLayout'
import StudentDashboardPage from '@/student/pages/DashboardPage'
import CoursesPage from '@/student/pages/CoursesPage'
import CourseDetailPage from '@/student/pages/CourseDetailPage'
import WatchPage from '@/student/pages/WatchPage'
import StudentBlogsPage from '@/student/pages/BlogsPage'
import BlogDetailPage from '@/student/pages/BlogDetailPage'
import ProfilePage from '@/student/pages/ProfilePage'

// ── Route guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({
  children,
  requiredRole
}: {
  children: React.ReactNode,
  requiredRole?: 'student' | 'instructor' | 'admin'
}) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Handle case where auth is authenticated but user info hasn't loaded (hydration)
  if (!user) {
    return null; // Return null effectively "waiting" for store hydration
  }

  if (requiredRole && user?.role !== requiredRole) {
    const role = user?.role || 'student'
    const homeMap: Record<string, string> = {
      student: '/student/dashboard',
      instructor: '/instructor/dashboard',
      admin: '/admin/dashboard'
    }
    return <Navigate to={homeMap[role] || '/login'} replace />
  }

  return <>{children}</>
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const { isAuthenticated, user } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Zustand persist/hydrate check
    const checkHydration = () => {
      setIsHydrated(true)
    }
    checkHydration()
  }, [])

  if (!isHydrated) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              <Navigate to={user?.role === 'student' ? '/student/dashboard' : user?.role === 'instructor' ? '/instructor/dashboard' : '/admin/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Root redirect based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={user?.role === 'student' ? '/student/dashboard' : user?.role === 'instructor' ? '/instructor/dashboard' : '/admin/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Student protected ───────────────────────────── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="blogs" element={<StudentBlogsPage />} />
          <Route path="blog/:id" element={<BlogDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ── Instructor protected ──────────────────────────── */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/instructor/dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboardPage />} />
          <Route path="courses" element={<InstructorCoursesPage />} />
          <Route path="videos" element={<InstructorVideosPage />} />
          <Route path="students" element={<InstructorStudentsPage />} />
          <Route path="enrollments" element={<InstructorEnrollmentsPage />} />
          <Route path="analytics" element={<InstructorAnalyticsPage />} />

          <Route path="messages" element={<div className="p-8 text-white h-[400px] flex items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">Instructor Messages (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-8 text-white h-[400px] flex items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">Instructor Settings (Coming Soon)</div>} />
        </Route>

        {/* ── Admin protected ─────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="blogs" element={<AdminBlogsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
