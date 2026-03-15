import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useStudentAuthStore } from '@/store/studentAuthStore'

// Admin
import AdminLayout from '@/layouts/AdminLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import StudentsPage from '@/pages/StudentsPage'
import VideosPage from '@/pages/VideosPage'
import PlaylistsPage from '@/pages/PlaylistsPage'
import BlogsPage from '@/pages/BlogsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import SettingsPage from '@/pages/SettingsPage'

// Student
import StudentLayout from '@/layouts/StudentLayout'
import StudentLoginPage from '@/pages/student/LoginPage'
import StudentRegisterPage from '@/pages/student/RegisterPage'
import StudentDashboardPage from '@/pages/student/DashboardPage'
import CoursesPage from '@/pages/student/CoursesPage'
import PlaylistDetailPage from '@/pages/student/PlaylistDetailPage'
import WatchPage from '@/pages/student/WatchPage'
import StudentBlogsPage from '@/pages/student/BlogsPage'
import BlogDetailPage from '@/pages/student/BlogDetailPage'
import ProfilePage from '@/pages/student/ProfilePage'

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

function StudentProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStudentAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → student login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student public */}
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/register" element={<StudentRegisterPage />} />

        {/* Student protected */}
        <Route
          path="/student"
          element={
            <StudentProtectedRoute>
              <StudentLayout />
            </StudentProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<PlaylistDetailPage />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="blogs" element={<StudentBlogsPage />} />
          <Route path="blog/:id" element={<BlogDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin public */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin protected */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="blogs" element={<BlogsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Wildcard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
