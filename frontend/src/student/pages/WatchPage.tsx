import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, ChevronRight, CheckCircle2, PlayCircle, SkipForward,
  Clock, List, X, PlaySquare
} from 'lucide-react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { studentVideos, courses, watchProgress } from '@/student/services/studentService'
import type { Video } from '@/student/services/studentService'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

function HLSPlayer({
  videoId,
  initialTime,
  onTimeUpdate,
  onEnded,
}: {
  videoId: string
  initialTime: number
  onTimeUpdate: (t: number) => void
  onEnded: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Cleanup previous
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose()
      playerRef.current = null
    }

    const videoEl = document.createElement('video-js')
    videoEl.className = 'vjs-big-play-centered vjs-fill' // Use vjs-fill
    videoEl.setAttribute('controls', '')
    videoEl.setAttribute('preload', 'auto')
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(videoEl)

    const player = playerRef.current = videojs(videoEl, {
      fluid: false, // Turn off fluid
      fill: true,   // Use fill
      responsive: true,
      controls: true,
      autoplay: false,
      preload: 'auto',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
      sources: [
        {
          src: `${API_BASE}/api/stream/${videoId}`,
          type: 'application/x-mpegURL',
        },
      ],
    })

    player.ready(() => {
      if (initialTime > 5) {
        player.currentTime(initialTime)
      }
      player.on('timeupdate', () => {
        const t = player.currentTime()
        if (t) onTimeUpdate(t)
      })
      player.on('ended', onEnded)
      player.on('contextmenu', (e: Event) => e.preventDefault())
    })

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  return (
    <div
      data-vjs-player
      className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 relative group"
      onContextMenu={e => e.preventDefault()}
    >
      <style>{`
        .video-js.vjs-fill {
          display: block;
        }
        .video-js video {
          object-fit: contain !important;
        }
        .video-js .vjs-big-play-button {
          background-color: rgba(124, 58, 237, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.6);
          border-radius: 100px;
          line-height: 2.5em;
          height: 2.5em;
          width: 2.5em;
          top: 50% !important;
          left: 50% !important;
          margin-top: -1.25em !important;
          margin-left: -1.25em !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .video-js:hover .vjs-big-play-button {
          background-color: rgb(139, 92, 246);
          transform: scale(1.1);
        }
      `}</style>
      <div ref={containerRef} className="w-full aspect-video" />
    </div>
  )
}

function SidebarVideoItem({
  video,
  isActive,
  isCompleted,
  onClick,
}: {
  video: Video
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
        isActive
          ? 'bg-primary/20 border border-primary/30'
          : 'hover:bg-muted/80 border border-transparent'
      )}
    >
      <div className="relative flex-shrink-0 w-16 h-11 rounded-lg bg-gray-800 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={getThumbnailUrl(video.thumbnail)!}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaySquare className="w-4 h-4 text-gray-600" />
          </div>
        )}
        {isActive && !isCompleted && (
          <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-violet-300" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-medium line-clamp-2 leading-snug',
          isActive ? 'text-primary font-semibold' : isCompleted ? 'text-muted-foreground/60 line-through' : 'text-foreground/90'
        )}>
          {video.title}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-[10px] text-muted-foreground/60">{video.duration}</span>
        </div>
      </div>
    </button>
  )
}

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('course')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showSidebar, setShowSidebar] = useState(true)
  const [autoplay, setAutoplay] = useState(true)

  // Save progress timer
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTimeRef = useRef(0)

  // Queries
  const { data: video, isLoading: loadingVideo } = useQuery({
    queryKey: ['student-video', videoId],
    queryFn: () => studentVideos.getById(videoId!),
    enabled: !!videoId,
  })

  const { data: allVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const { data: course } = useQuery({
    queryKey: ['student-course', courseId],
    queryFn: () => courses.getById(courseId!),
    enabled: !!courseId,
  })

  const { data: savedProgress } = useQuery({
    queryKey: ['student-video-progress', videoId],
    queryFn: () => watchProgress.getForVideo(videoId!),
    enabled: !!videoId,
  })

  const { data: progressList } = useQuery({
    queryKey: ['student-progress'],
    queryFn: watchProgress.getAll,
  })

  const progressMap: Record<string, { progress: number; completed: boolean }> = {}
  progressList?.forEach((p) => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    if (vid) progressMap[vid] = { progress: p.progress, completed: p.completed }
  })

  const saveMutation = useMutation({
    mutationFn: ({ seconds, completed }: { seconds: number; completed?: boolean }) =>
      watchProgress.save(videoId!, seconds, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-progress'] })
      qc.invalidateQueries({ queryKey: ['student-video-progress', videoId] })
    },
  })

  // Course videos (flat list from all modules/lectures for sidebar)
  const courseVideos: Video[] = []
  if (courseId && allVideos) {
    // Get videos that belong to this course
    const courseVids = allVideos.filter(v => v.courseId === courseId)
    courseVideos.push(...courseVids)
  }

  const currentIndex = courseVideos.findIndex(v => v.id === videoId)
  const nextVideo = currentIndex >= 0 && currentIndex < courseVideos.length - 1
    ? courseVideos[currentIndex + 1]
    : null

  // Start saving progress every 10 seconds
  useEffect(() => {
    if (!videoId) return
    progressTimerRef.current = setInterval(() => {
      if (currentTimeRef.current > 0) {
        saveMutation.mutate({ seconds: currentTimeRef.current })
      }
    }, 10_000)

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [videoId])

  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time
  }, [])

  const handleVideoEnded = useCallback(() => {
    // Mark as completed
    saveMutation.mutate({ seconds: currentTimeRef.current, completed: true })
    // Autoplay next
    if (autoplay && nextVideo) {
      setTimeout(() => {
        navigate(`/student/watch/${nextVideo.id}?course=${courseId}`)
      }, 1500)
    }
  }, [autoplay, nextVideo, courseId, navigate])

  if (loadingVideo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <PlaySquare className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-gray-300 font-semibold">Video not found</h3>
        <Link to="/student/courses" className="text-violet-400 text-sm mt-2 hover:underline">
          ← Back to courses
        </Link>
      </div>
    )
  }

  const isCompleted = progressMap[videoId!]?.completed || false

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Back nav */}
        <div className="px-4 lg:px-6 py-3 flex items-center gap-3 border-b border-border">
          <Link
            to={courseId ? `/student/courses/${courseId}` : '/student/courses'}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {course?.title || 'Back'}
          </Link>
          {course && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-sm text-foreground/80 font-medium line-clamp-1">{video.title}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-xs gap-1.5"
            >
              <List className="w-4 h-4" />
              Course
            </Button>
          </div>
        </div>

        <div className="p-4 lg:p-6 flex-1 min-w-0">
          {/* Player */}
          <div className="max-w-5xl w-full mx-auto">
            <HLSPlayer
              key={videoId}
              videoId={videoId!}
              initialTime={savedProgress?.progress || 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          </div>

          {/* Video info */}
          <div className="mt-5 max-w-5xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-bold">{video.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {video.duration}
                  </span>
                  {video.courseTitle && (
                    <span className="text-sm text-muted-foreground/70">• {video.courseTitle}</span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Autoplay toggle */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Autoplay</span>
                  <Switch
                    checked={autoplay}
                    onCheckedChange={setAutoplay}
                  />
                </div>

                {/* Next video */}
                {nextVideo && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/student/watch/${nextVideo.id}?course=${courseId}`)}
                    className="gap-1.5"
                  >
                    Next <SkipForward className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="mt-5 p-5 bg-card rounded-xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold mb-2">About this lesson</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
              </div>
            )}

            {/* Next video preview */}
            {nextVideo && (
              <div
                className="mt-5 flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors group"
                onClick={() => navigate(`/student/watch/${nextVideo.id}?course=${courseId}`)}
              >
                <SkipForward className="w-5 h-5 text-primary/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Up next</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {nextVideo.title}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary/50" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar (course content) */}
      {courseVideos.length > 0 && (
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-sidebar border-l border-sidebar-border transition-all duration-300 shadow-xl',
            showSidebar ? 'w-80' : 'w-0 overflow-hidden'
          )}
        >
          {showSidebar && (
            <>
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border h-[60px]">
                <div>
                  <h3 className="text-sm font-semibold">Course Content</h3>
                  {course && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{course.title}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
                {courseVideos.map((v) => (
                  <SidebarVideoItem
                    key={v.id}
                    video={v}
                    isActive={v.id === videoId}
                    isCompleted={progressMap[v.id]?.completed || false}
                    onClick={() => navigate(`/student/watch/${v.id}?course=${courseId}`)}
                  />
                ))}
              </div>
            </>
          )}
        </aside>
      )}

      {/* Toggle sidebar button when closed (desktop) */}
      {!showSidebar && courseVideos.length > 0 && (
        <button
          onClick={() => setShowSidebar(true)}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 bg-sidebar border border-sidebar-border rounded-l-xl items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10 shadow-lg"
        >
          <List className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
