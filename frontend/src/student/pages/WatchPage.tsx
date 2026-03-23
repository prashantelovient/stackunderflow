import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, ChevronRight, ChevronDown, CheckCircle2, PlayCircle, SkipForward,
  Clock, List, X, PlaySquare, Layers, ShieldCheck, FileText, Link as LinkIcon, Download
} from 'lucide-react'
import { toast } from 'sonner'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import { studentVideos, courses, watchProgress, lectureService } from '@/student/services/studentService'
import type { Video } from '@/student/services/studentService'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
        'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all relative group/item',
        isActive
          ? 'bg-primary/20 border border-primary/30 ring-1 ring-primary/20'
          : 'hover:bg-muted/80 border border-transparent'
      )}
    >
      <div className="relative flex-shrink-0 w-14 h-9 rounded-lg bg-gray-800/80 overflow-hidden border border-white/5">
        {video.thumbnail ? (
          <img
            src={getThumbnailUrl(video.thumbnail)!}
            alt={video.title}
            className="w-full h-full object-cover transition-transform group-hover/item:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaySquare className="w-3.5 h-3.5 text-gray-500" />
          </div>
        )}
        {isActive && !isCompleted && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
            <PlayCircle className="w-3.5 h-3.5 text-primary-foreground drop-shadow-md" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[1px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow-md" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-semibold line-clamp-2 leading-tight tracking-tight',
          isActive ? 'text-primary' : isCompleted ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'
        )}>
          {video.title}
        </p>
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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Save progress timer
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTimeRef = useRef(0)

  // Queries
  const { data: video, isLoading: loadingVideo } = useQuery({
    queryKey: ['student-video', videoId, courseId],
    queryFn: () => studentVideos.getById(videoId!, courseId),
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

  // Course videos (flat list from all modules/lectures for sidebar and next)
  const courseVideos: Video[] = []
  if (course?.modules) {
    course.modules.forEach(mod => {
      (mod.lectures || []).forEach(lec => {
        if (lec.type === 'video') {
          const v = typeof lec.videoId === 'object' && lec.videoId ? lec.videoId as Video : null
          if (v) courseVideos.push(v)
        }
      })
    })
  } else if (courseId && allVideos) {
    // Fallback if modules not loaded
    const courseVids = allVideos.filter(v => v.courseId === courseId)
    courseVideos.push(...courseVids)
  }

  // Initialize expanded modules to contain the current video's module
  useEffect(() => {
    if (course?.modules && videoId && expandedModules.size === 0) {
      const activeModule = course.modules.find(mod =>
        mod.lectures.some(lec => {
          const vid = typeof lec.videoId === 'object' && lec.videoId ? (lec.videoId as Video).id : lec.videoId as string
          return vid === videoId
        })
      )
      if (activeModule) {
        setExpandedModules(new Set([activeModule.id]))
      } else if (course.modules.length > 0) {
        setExpandedModules(new Set([course.modules[0].id]))
      }
    }
  }, [course, videoId, expandedModules.size])

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      next.has(modId) ? next.delete(modId) : next.add(modId)
      return next
    })
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background relative">
      {/* Mobile Backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar (course content) - Responsive Overlay/Relative */}
      {(course?.modules || courseVideos.length > 0) && (
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-2xl overflow-hidden',
            'lg:relative lg:z-20 lg:shadow-none lg:translate-x-0',
            showSidebar ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
          )}
        >
          {showSidebar && (
            <div className="flex flex-col h-full w-80">
              <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border h-[64px] bg-sidebar/50 backdrop-blur-md flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold tracking-tight text-foreground uppercase text-[10px]">Course Content</h3>
                  {course && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">{course.title}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8 hover:bg-muted rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 lg:scrollbar-thin">
                {course?.modules ? (
                  course.modules.map((mod) => {
                    const isExpanded = expandedModules.has(mod.id)
                    const moduleVideoLectures = mod.lectures.filter(l => l.type === 'video')

                    return (
                      <div key={mod.id} className="space-y-1.5">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all hover:bg-muted/60 group",
                            isExpanded ? "bg-muted/40" : ""
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                            isExpanded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                          )}>
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider line-clamp-1 truncate">{mod.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium">{moduleVideoLectures.length} lessons</p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="pl-9 space-y-1 mt-1 border-l ml-3.5 border-dashed border-muted-foreground/20">
                            {mod.lectures.map((lec) => {
                              if (lec.type === 'video') {
                                const v = typeof lec.videoId === 'object' && lec.videoId ? lec.videoId as Video : null
                                if (!v) return null

                                return (
                                  <SidebarVideoItem
                                    key={v.id}
                                    video={v}
                                    isActive={v.id === videoId}
                                    isCompleted={progressMap[v.id]?.completed || false}
                                    onClick={() => navigate(`/student/watch/${v.id}?course=${courseId}`)}
                                  />
                                )
                              }

                              return (
                                <button
                                  key={lec.id || (lec as any)._id}
                                  onClick={async () => {
                                    const lid = (lec.id || (lec as any)._id) as string;
                                    if (!lid) return toast.error('Lecture ID missing');
                                    try {
                                      const url = await lectureService.getResourceUrl(lid);
                                      if (!url) throw new Error('No URL returned from server');
                                      window.open(url, '_blank');
                                    } catch (error) {
                                      console.error('Resource download error:', error);
                                      toast.error('Failed to access resource');
                                    }
                                  }}
                                  className={cn(
                                    'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border border-transparent hover:bg-muted/80 group/res'
                                  )}
                                >
                                  <div className="w-14 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    {lec.type === 'material' ? <FileText className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4 text-emerald-500" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold line-clamp-2 leading-tight tracking-tight text-foreground/80">
                                      {lec.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">{lec.resourceName || 'Resource'}</p>
                                  </div>
                                  <Download className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/res:opacity-100 transition-opacity" />
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  // Fallback to flat list if no modules
                  courseVideos.map((v) => (
                    <SidebarVideoItem
                      key={v.id}
                      video={v}
                      isActive={v.id === videoId}
                      isCompleted={progressMap[v.id]?.completed || false}
                      onClick={() => navigate(`/student/watch/${v.id}?course=${courseId}`)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Toggle sidebar button when closed (desktop) - Moved to Left */}
      {!showSidebar && (course?.modules || courseVideos.length > 0) && (
        <button
          onClick={() => setShowSidebar(true)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 w-7 h-20 bg-sidebar border border-sidebar-border rounded-r-xl items-center justify-center text-muted-foreground hover:text-foreground transition-all z-30 shadow-2xl hover:w-9"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background/50">
        {/* Back nav */}
        <div className="px-4 lg:px-8 py-3 flex items-center gap-3 border-b border-border h-[64px] bg-card/30 backdrop-blur-sm sticky top-0 z-10">
          <Link
            to={courseId ? `/student/courses/${courseId}` : '/student/courses'}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
          {course && (
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span className="text-sm text-foreground font-bold truncate">{course.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate font-medium">{video.title}</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-[10px] font-black uppercase tracking-widest h-8 px-3 gap-1.5"
            >
              <List className="w-3.5 h-3.5" />
              Content
            </Button>
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-40">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Stream
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-10 flex-1 min-w-0 max-w-[1400px] mx-auto w-full">
          {/* Player */}
          <div className="w-full relative shadow-3xl">
            <HLSPlayer
              key={videoId}
              videoId={videoId!}
              initialTime={savedProgress?.progress || 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          </div>

          {/* Video info */}
          <div className="mt-8">
            <div className="flex items-start justify-between gap-6 flex-wrap lg:flex-nowrap">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">{video.title}</h1>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {video.courseTitle && (
                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">• {video.courseTitle}</span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 className="w-3 h-3" />
                      Protocol Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Autoplay toggle */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-primary/20">
                  <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">Autoplay</span>
                  <Switch
                    checked={autoplay}
                    onCheckedChange={setAutoplay}
                  />
                </div>

                {/* Next video */}
                {nextVideo && (
                  <Button
                    onClick={() => navigate(`/student/watch/${nextVideo.id}?course=${courseId}`)}
                    className="h-11 px-6 gap-2 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Next Logic <SkipForward className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {video.description && (
                  <div className="p-6 bg-card rounded-3xl border border-border shadow-md">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Lesson Directive</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{video.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Next video preview */}
                {nextVideo && (
                  <div
                    className="flex flex-col gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10 cursor-pointer hover:bg-primary/10 transition-all group relative overflow-hidden"
                    onClick={() => navigate(`/student/watch/${nextVideo.id}?course=${courseId}`)}
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <SkipForward className="w-16 h-16 -mr-4 -mt-4" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Sequence</span>
                      <SkipForward className="w-4 h-4 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight mb-1">Coming up next</p>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                        {nextVideo.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
