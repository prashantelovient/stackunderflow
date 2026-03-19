import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  User, Mail, Calendar, PlayCircle, CheckCircle2, Trophy,
  TrendingUp, Clock, BookOpen, ChevronRight
} from 'lucide-react'
import { useStudentAuthStore } from '@/student/store/studentAuthStore'
import { playlists, studentVideos, watchProgress } from '@/student/services/studentService'
import { formatDate } from '@/utils'

function StatItem({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { student } = useStudentAuthStore()
  const displayName = student?.name || 'Student'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const { data: allPlaylists } = useQuery({
    queryKey: ['student-playlists'],
    queryFn: playlists.getAll,
  })

  const { data: allVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const { data: progressList, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-progress'],
    queryFn: watchProgress.getAll,
  })

  const completedVideos = progressList?.filter(p => p.completed) ?? []
  const inProgressVideos = progressList?.filter(p => !p.completed && p.progress > 0) ?? []

  const videoTotal = allVideos?.length || 0
  const completedCount = completedVideos.length
  const overallPercent = videoTotal > 0 ? Math.round((completedCount / videoTotal) * 100) : 0

  // Find which playlists have been touched
  const progressVideoIds = new Set(progressList?.map(p => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    return vid
  }))

  const touchedPlaylistIds = new Set(
    allVideos?.filter(v => progressVideoIds.has(v.id) && v.playlistId).map(v => v.playlistId!) ?? []
  )
  const enrolledPlaylists = allPlaylists?.filter(p => touchedPlaylistIds.has(p.id)) ?? []

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-purple-900/30 border border-violet-500/20 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-500/30">
              {avatarInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#0f0f23] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-gray-300 mt-1 flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              {student?.email}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Active learner</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-300 mb-1.5">
                <span>Overall Progress</span>
                <span>{overallPercent}%</span>
              </div>
              <div className="h-2.5 w-72 max-w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {completedCount} of {videoTotal} videos completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={PlayCircle} label="Total Videos" value={videoTotal} color="bg-indigo-600" />
        <StatItem icon={CheckCircle2} label="Completed" value={completedCount} color="bg-emerald-600" />
        <StatItem icon={TrendingUp} label="In Progress" value={inProgressVideos.length} color="bg-pink-600" />
        <StatItem icon={Trophy} label="Courses" value={enrolledPlaylists.length} color="bg-amber-600" />
      </div>

      {/* Enrolled courses */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Active Courses
          <span className="ml-2 text-sm font-normal text-gray-400">
            {enrolledPlaylists.length}
          </span>
        </h2>

        {loadingProgress ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : enrolledPlaylists.length === 0 ? (
          <div className="text-center py-12 bg-white/3 rounded-xl border border-white/5">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
            <h3 className="text-gray-300 font-medium text-sm">No courses started yet</h3>
            <p className="text-gray-500 text-xs mt-1.5">Start watching videos to track your progress</p>
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Browse courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledPlaylists.map(playlist => {
              const playlistVideos = allVideos?.filter(v => v.playlistId === playlist.id) ?? []
              const completedInPlaylist = completedVideos.filter(p => {
                const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
                return playlistVideos.some(v => v.id === vid)
              }).length
              const pct = playlistVideos.length > 0
                ? Math.round((completedInPlaylist / playlistVideos.length) * 100)
                : 0

              return (
                <Link
                  key={playlist.id}
                  to={`/student/courses/${playlist.id}`}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/8 rounded-xl hover:bg-white/8 hover:border-white/15 transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {playlist.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {playlist.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {completedInPlaylist}/{playlistVideos.length} videos
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed videos */}
      {completedVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Completed Videos
            <span className="ml-2 text-sm font-normal text-gray-400">{completedVideos.length}</span>
          </h2>
          <div className="space-y-2">
            {completedVideos.slice(0, 8).map(p => {
              const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)
              const videoObj = allVideos?.find(v => v.id === (typeof vid === 'string' ? vid : vid?.id))
              if (!videoObj) return null
              return (
                <Link
                  key={p.id}
                  to={`/student/watch/${videoObj.id}${videoObj.playlistId ? `?playlist=${videoObj.playlistId}` : ''}`}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/8 transition-colors group"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-violet-300 transition-colors line-clamp-1">
                      {videoObj.title}
                    </p>
                    <p className="text-xs text-gray-500">{videoObj.playlistTitle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{videoObj.duration}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

