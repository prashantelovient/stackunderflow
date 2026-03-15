import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, PlayCircle, CheckCircle2, Clock, PlaySquare, ChevronRight, Lock
} from 'lucide-react'
import { playlists, studentVideos, watchProgress } from '@/services/studentService'
import type { Video } from '@/services/studentService'
import { cn } from '@/utils'

const gradients = [
  'from-violet-600 to-purple-700',
  'from-indigo-600 to-blue-700',
  'from-pink-600 to-rose-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-sky-700',
]

function VideoRow({
  video,
  index,
  progress,
  completed,
  playlistId,
}: {
  video: Video
  index: number
  progress?: number
  completed?: boolean
  playlistId: string
}) {
  const navigate = useNavigate()
  const durationSec = parseInt(video.duration) || 0
  const progressPct = (progress && durationSec) ? Math.min(100, Math.round((progress / durationSec) * 100)) : 0

  return (
    <div
      onClick={() => navigate(`/student/watch/${video.id}?playlist=${playlistId}`)}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200',
        'bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/12'
      )}
    >
      {/* Index / status */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        ) : (
          <span className="text-gray-500 group-hover:hidden">{index + 1}</span>
        )}
        {!completed && (
          <PlayCircle className="w-6 h-6 text-violet-400 hidden group-hover:block" />
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-20 h-14 rounded-lg bg-gray-800 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={`http://localhost:5000${video.thumbnail}`}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaySquare className="w-5 h-5 text-gray-600" />
          </div>
        )}
        {completed && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm font-medium leading-snug line-clamp-1 transition-colors',
          completed ? 'text-gray-400 line-through' : 'text-white group-hover:text-violet-300'
        )}>
          {video.title}
        </h4>
        {video.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{video.description}</p>
        )}
        {progress !== undefined && progress > 0 && !completed && (
          <div className="mt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 flex items-center gap-1 text-gray-500">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">{video.duration}</span>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
    </div>
  )
}

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: playlist, isLoading: loadingPlaylist } = useQuery({
    queryKey: ['student-playlist', id],
    queryFn: () => playlists.getById(id!),
    enabled: !!id,
  })

  const { data: allVideos, isLoading: loadingVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const { data: progressList } = useQuery({
    queryKey: ['student-progress'],
    queryFn: watchProgress.getAll,
  })

  const playlistVideos = allVideos?.filter(v => v.playlistId === id) ?? []

  const progressMap: Record<string, { progress: number; completed: boolean }> = {}
  progressList?.forEach((p) => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    if (vid) progressMap[vid] = { progress: p.progress, completed: p.completed }
  })

  const completedCount = playlistVideos.filter(v => progressMap[v.id]?.completed).length
  const progressPercent = playlistVideos.length > 0
    ? Math.round((completedCount / playlistVideos.length) * 100)
    : 0

  const gradientClass = playlist
    ? gradients[playlist.title.charCodeAt(0) % gradients.length]
    : gradients[0]

  if (loadingPlaylist) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lock className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-gray-300 font-semibold">Course not found</h3>
        <Link to="/student/courses" className="text-violet-400 text-sm mt-2 hover:underline">
          ← Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </Link>

      {/* Hero card */}
      <div className={cn('relative rounded-2xl overflow-hidden bg-gradient-to-br mb-8', gradientClass)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">Course</span>
          <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-white/70 mt-3 text-sm lg:text-base max-w-2xl">{playlist.description}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <PlayCircle className="w-4 h-4" />
              <span>{playlistVideos.length} videos</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedCount} completed</span>
            </div>
          </div>

          {/* Progress */}
          {playlistVideos.length > 0 && (
            <div className="mt-5 max-w-sm">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
                <span>Course Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Start/Continue button */}
          {playlistVideos.length > 0 && (
            <Link
              to={`/student/watch/${playlistVideos[0].id}?playlist=${id}`}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
            </Link>
          )}
        </div>
      </div>

      {/* Videos list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Course Content
          <span className="ml-2 text-sm font-normal text-gray-400">
            {playlistVideos.length} lesson{playlistVideos.length !== 1 ? 's' : ''}
          </span>
        </h2>

        {loadingVideos ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : playlistVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PlaySquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No videos in this course yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {playlistVideos.map((video, index) => (
              <VideoRow
                key={video.id}
                video={video}
                index={index}
                progress={progressMap[video.id]?.progress}
                completed={progressMap[video.id]?.completed}
                playlistId={id!}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
