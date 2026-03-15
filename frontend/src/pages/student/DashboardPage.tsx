import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PlayCircle, BookOpen, Clock, Trophy, TrendingUp,
  ChevronRight, Flame, ArrowRight, ListVideo
} from 'lucide-react'
import { useStudentAuthStore } from '@/store/studentAuthStore'
import { playlists, studentVideos, watchProgress } from '@/services/studentService'
import type { Playlist, Video, WatchProgress } from '@/services/studentService'
import { cn } from '@/utils'

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-2xl bg-white/5 overflow-hidden', className)}>
      <div className="bg-white/5 h-36" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
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
    <div className="bg-white/5 backdrop-blur border border-white/8 rounded-2xl p-5 hover:bg-white/8 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const initial = playlist.title.charAt(0).toUpperCase()
  const colors = [
    'from-violet-600 to-purple-600',
    'from-indigo-600 to-blue-600',
    'from-pink-600 to-rose-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
  ]
  const colorClass = colors[playlist.title.charCodeAt(0) % colors.length]

  return (
    <Link
      to={`/student/courses/${playlist.id}`}
      className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
    >
      <div className={cn('relative h-36 bg-gradient-to-br', colorClass, 'flex items-center justify-center')}>
        <span className="text-5xl font-bold text-white/30">{initial}</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
            <PlayCircle className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-violet-300 transition-colors line-clamp-1">
          {playlist.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{playlist.description || 'No description'}</p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-[11px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded-full">View Course</span>
        </div>
      </div>
    </Link>
  )
}

function VideoCard({ video, progress }: { video: Video; progress?: number }) {
  const percent = progress ? Math.min(100, Math.round((progress / (parseInt(video.duration) || 1)) * 100)) : 0

  return (
    <Link
      to={`/student/watch/${video.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all"
    >
      <div className="relative flex-shrink-0 w-20 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden">
        {video.thumbnail ? (
          <img src={`http://localhost:5000${video.thumbnail}`} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-gray-500" />
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
        <p className="text-xs text-gray-500 mt-0.5">{video.playlistTitle}</p>
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
    </Link>
  )
}

export default function StudentDashboardPage() {
  const { student } = useStudentAuthStore()

  const { data: allPlaylists, isLoading: loadingPlaylists } = useQuery({
    queryKey: ['student-playlists'],
    queryFn: playlists.getAll,
  })

  const { data: allVideos, isLoading: loadingVideos } = useQuery({
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

  const recentVideos = allVideos?.slice(0, 8) ?? []
  const recentPlaylists = allPlaylists?.slice(0, 6) ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-purple-900/30 border border-violet-500/20 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/15 rounded-full blur-2xl" />
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
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-violet-500/20"
          >
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ListVideo}
          label="Available Courses"
          value={allPlaylists?.length || 0}
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
        {loadingPlaylists ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentPlaylists.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ListVideo className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No courses available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {recentPlaylists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
          </div>
        )}
      </section>

      {/* Recent Videos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Recently Added</h2>
            <p className="text-sm text-gray-400">Latest videos from all courses</p>
          </div>
        </div>
        {loadingVideos ? (
          <div className="space-y-2">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : recentVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PlayCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No videos available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recentVideos.map((v) => (
              <VideoCard key={v.id} video={v} progress={progressMap[v.id]} />
            ))}
          </div>
        )}
      </section>

      {/* Blogs CTA */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/50 to-violet-900/30 border border-indigo-500/20 p-6 flex items-center justify-between">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-base font-semibold text-white">Explore Our Blog</h3>
            <p className="text-sm text-gray-400 mt-1">Tutorials, deep-dives and learning resources</p>
          </div>
          <Link
            to="/student/blogs"
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors flex-shrink-0 ml-4"
          >
            <BookOpen className="w-4 h-4" />
            Read Blogs
          </Link>
        </div>
      </section>
    </div>
  )
}
