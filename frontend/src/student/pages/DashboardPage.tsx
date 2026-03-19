import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PlayCircle, BookOpen, Clock, Trophy, TrendingUp,
  ChevronRight, Flame, ArrowRight, ListVideo
} from 'lucide-react'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'
import { courses, studentVideos, watchProgress } from '@/student/services/studentService'
import type { Course, Video } from '@/student/services/studentService'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/5">
      <Skeleton className="h-36 w-full opacity-10" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4 opacity-10" />
        <Skeleton className="h-3 w-1/2 opacity-10" />
      </CardContent>
    </Card>
  )
}

function StatCard({
  icon: Icon, label, value, trend, color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  color: string
}) {
  return (
    <Card className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/8 transition-colors">
      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-black/20', color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-none">
              {trend}
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

function CourseCard({ course }: { course: Course }) {
  const initial = course.title.charAt(0).toUpperCase()
  const colors = [
    'from-violet-600 to-purple-600',
    'from-indigo-600 to-blue-600',
    'from-pink-600 to-rose-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
  ]
  const colorClass = colors[course.title.charCodeAt(0) % colors.length]

  return (
    <Link to={`/student/courses/${course.id}`} className="group">
      <Card className="h-full bg-white/5 border-white/10 overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-xl hover:shadow-black/30">
        <div className={cn('relative h-36 bg-gradient-to-br', colorClass, 'flex items-center justify-center')}>
          <span className="text-5xl font-bold text-white/30">{initial}</span>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <PlayCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-violet-300 transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description || 'No description'}</p>
          <div className="mt-3">
            <Badge variant="secondary" className="text-[10px] font-medium bg-white/5 text-gray-400">View Course</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function VideoCard({ video, progress }: { video: Video; progress?: number }) {
  const percent = progress ? Math.min(100, Math.round((progress / (parseInt(video.duration) || 1)) * 100)) : 0

  return (
    <Link to={`/student/watch/${video.id}`} className="group block">
      <Card className="p-3 bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 w-20 h-14 bg-gradient-to-br from-gray-800 to-gray-950 rounded-lg overflow-hidden border border-white/5">
            {video.thumbnail ? (
              <img src={`${API_BASE}${video.thumbnail}`} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white line-clamp-1 group-hover:text-violet-300 transition-colors">
              {video.title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{video.courseTitle}</p>
            {percent > 0 && (
              <div className="mt-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{percent}% complete</p>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{video.duration}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function StudentDashboardPage() {
  const { student } = useStudentAuthStore()

  const { data: allCourses, isLoading: loadingCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: courses.getAll,
  })

  const { data: allVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const { data: progressList } = useQuery({
    queryKey: ['student-progress'],
    queryFn: watchProgress.getAll,
  })

  const progressMap: Record<string, number> = {}
  progressList?.forEach((p) => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    if (vid) progressMap[vid] = p.progress
  })

  const completedCount = progressList?.filter((p) => p.completed).length || 0
  const inProgressVideos = allVideos?.filter((v) => progressMap[v.id] && progressMap[v.id] > 0 && !progressList?.find(p => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    return vid === v.id && p.completed
  })).slice(0, 5) ?? []

  const recentCourses = allCourses?.slice(0, 6) ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero greeting */}
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-purple-950/40 border-violet-500/30 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/15 rounded-full blur-2xl opacity-50" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Keep the streak going!</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            {greeting}, {student?.name?.split(' ')[0] || 'Learner'} 👋
          </h2>
          <p className="text-gray-300 mt-1.5 text-sm lg:text-base">
            {completedCount > 0
              ? `You've completed ${completedCount} video${completedCount !== 1 ? 's' : ''}. Keep it up!`
              : "You haven't started watching yet. Pick a course and begin!"}
          </p>
          <Link to="/student/courses">
            <Button className="mt-4 bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/20">
              Browse Courses <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListVideo}
          label="Available Courses"
          value={allCourses?.length || 0}
          color="bg-violet-600"
        />
        <StatCard
          icon={PlayCircle}
          label="Total Videos"
          value={allVideos?.length || 0}
          color="bg-indigo-600"
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={completedCount}
          color="bg-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress"
          value={inProgressVideos.length}
          color="bg-pink-600"
        />
      </div>

      {/* Continue Watching */}
      {inProgressVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Continue Watching</h2>
              <p className="text-sm text-gray-400">Pick up where you left off</p>
            </div>
            <Link
              to="/student/courses"
              className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {inProgressVideos.map((video) => (
              <VideoCard key={video.id} video={video} progress={progressMap[video.id]} />
            ))}
          </div>
        </section>
      )}

      {/* My Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Browse Courses</h2>
            <p className="text-sm text-gray-400">All available learning paths</p>
          </div>
          <Link
            to="/student/courses"
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loadingCourses ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentCourses.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-center py-12 text-gray-500">
            <ListVideo className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No courses available yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentCourses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Blogs CTA */}
      <section>
        <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-950/80 to-violet-950/60 border-indigo-500/30 p-6">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl opacity-50" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Explore Our Blog</h3>
              <p className="text-sm text-gray-400 mt-1">Tutorials, deep-dives and learning resources</p>
            </div>
            <Link to="/student/blogs">
              <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Blogs
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
