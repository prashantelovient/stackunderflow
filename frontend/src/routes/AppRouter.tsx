import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/admin/store/authStore'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'

// ── Admin ────────────────────────────────────────────────────────────────────
import AdminLayout from '@/admin/layout/AdminLayout'
import AdminLoginPage from '@/admin/pages/LoginPage'
import DashboardPage from '@/admin/pages/DashboardPage'
import StudentsPage from '@/admin/pages/StudentsPage'
import VideosPage from '@/admin/pages/VideosPage'
import PlaylistsPage from '@/admin/pages/PlaylistsPage'
import AdminBlogsPage from '@/admin/pages/BlogsPage'
import CategoriesPage from '@/admin/pages/CategoriesPage'
import SettingsPage from '@/admin/pages/SettingsPage'

// ── Student ───────────────────────────────────────────────────────────────────
import StudentLayout from '@/student/layout/StudentLayout'
import StudentLoginPage from '@/student/pages/LoginPage'
import StudentRegisterPage from '@/student/pages/RegisterPage'
import StudentDashboardPage from '@/student/pages/DashboardPage'
import CoursesPage from '@/student/pages/CoursesPage'
import PlaylistDetailPage from '@/student/pages/PlaylistDetailPage'
import WatchPage from '@/student/pages/WatchPage'
import StudentBlogsPage from '@/student/pages/BlogsPage'
import BlogDetailPage from '@/student/pages/BlogDetailPage'
import ProfilePage from '@/student/pages/ProfilePage'

// ── Route guards ──────────────────────────────────────────────────────────────
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStudentAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → student login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Student public ──────────────────────────────── */}
        <Route path="/login"    element={<StudentLoginPage />} />
        <Route path="/register" element={<StudentRegisterPage />} />

        {/* ── Student protected ───────────────────────────── */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <StudentLayout />
            </StudentRoute>
          }
        >
          <Route index                  element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard"       element={<StudentDashboardPage />} />
          <Route path="courses"         element={<CoursesPage />} />
          <Route path="courses/:id"     element={<PlaylistDetailPage />} />
          <Route path="watch/:videoId"  element={<WatchPage />} />
          <Route path="blogs"           element={<StudentBlogsPage />} />
          <Route path="blog/:id"        element={<BlogDetailPage />} />
          <Route path="profile"         element={<ProfilePage />} />
        </Route>

        {/* ── Admin public ────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ── Admin protected ─────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index               element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="students"     element={<StudentsPage />} />
          <Route path="videos"       element={<VideosPage />} />
          <Route path="playlists"    element={<PlaylistsPage />} />
          <Route path="blogs"        element={<AdminBlogsPage />} />
          <Route path="categories"   element={<CategoriesPage />} />
          <Route path="settings"     element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
