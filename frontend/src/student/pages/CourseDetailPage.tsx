import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, PlayCircle, CheckCircle2, Clock, PlaySquare, ChevronRight, ChevronDown, Lock,
    Layers, FileText, Link as LinkIcon, FileVideo
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { courses, watchProgress } from '@/student/services/studentService'
import type { Video, LectureItem, ModuleItem } from '@/student/services/studentService'
import { cn } from '@/utils'

const gradients = [
    'from-violet-600 to-purple-700',
    'from-indigo-600 to-blue-700',
    'from-pink-600 to-rose-700',
    'from-emerald-600 to-teal-700',
    'from-amber-600 to-orange-700',
    'from-cyan-600 to-sky-700',
]

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function LectureRow({
    lecture,
    index,
    progress,
    completed,
    courseId,
}: {
    lecture: LectureItem
    index: number
    progress?: number
    completed?: boolean
    courseId: string
}) {
    const navigate = useNavigate()
    const videoData = typeof lecture.videoId === 'object' && lecture.videoId ? lecture.videoId as Video : null
    const videoId = videoData?.id || (typeof lecture.videoId === 'string' ? lecture.videoId : null)
    const durationSec = videoData?.duration ? parseInt(videoData.duration) : 0
    const progressPct = (progress && durationSec) ? Math.min(100, Math.round((progress / durationSec) * 100)) : 0

    const handleClick = () => {
        if (lecture.type === 'video' && videoId) {
            navigate(`/student/watch/${videoId}?course=${courseId}`)
        } else if (lecture.resourceUrl) {
            window.open(lecture.resourceUrl, '_blank')
        }
    }

    const typeIcon = () => {
        switch (lecture.type) {
            case 'video': return <FileVideo className="w-5 h-5 text-violet-400" />
            case 'resource': return <LinkIcon className="w-5 h-5 text-blue-400" />
            case 'material': return <FileText className="w-5 h-5 text-amber-400" />
            default: return <FileVideo className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                'group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200',
                'bg-card border border-border hover:bg-muted/80 shadow-sm hover:shadow-md'
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

            {/* Icon */}
            <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800/50 overflow-hidden flex items-center justify-center">
                {lecture.type === 'video' && videoData?.thumbnail ? (
                    <img
                        src={`${API_BASE}${videoData.thumbnail}`}
                        alt={lecture.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    typeIcon()
                )}
                {completed && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className={cn(
                    'text-sm font-semibold leading-snug line-clamp-1 transition-colors',
                    completed ? 'text-muted-foreground/60 line-through' : 'text-foreground group-hover:text-primary'
                )}>
                    {lecture.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded">{lecture.type}</span>
                    {lecture.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{lecture.description}</p>
                    )}
                </div>
                {progress !== undefined && progress > 0 && !completed && lecture.type === 'video' && (
                    <div className="mt-2">
                        <div className="h-1 bg-muted rounded-full overflow-hidden w-32 border border-border/50">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Duration */}
            {lecture.type === 'video' && videoData?.duration && (
                <div className="flex-shrink-0 flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{videoData.duration}</span>
                </div>
            )}

            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
        </div>
    )
}

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

    const { data: course, isLoading: loadingCourse } = useQuery({
        queryKey: ['student-course', id],
        queryFn: () => courses.getById(id!),
        enabled: !!id,
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

    const courseModules = course?.modules || []

    // Count all video lectures for progress
    const allVideoLectures: { videoId: string; lecture: LectureItem }[] = []
    courseModules.forEach(mod => {
        (mod.lectures || []).forEach(lec => {
            if (lec.type === 'video') {
                const vid = typeof lec.videoId === 'object' && lec.videoId ? (lec.videoId as Video).id : lec.videoId as string
                if (vid) allVideoLectures.push({ videoId: vid, lecture: lec })
            }
        })
    })

    const completedCount = allVideoLectures.filter(l => progressMap[l.videoId]?.completed).length
    const totalLectures = courseModules.reduce((sum, m) => sum + (m.lectures?.length || 0), 0)
    const progressPercent = allVideoLectures.length > 0
        ? Math.round((completedCount / allVideoLectures.length) * 100)
        : 0

    const toggleModule = (modId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev)
            next.has(modId) ? next.delete(modId) : next.add(modId)
            return next
        })
    }

    // Auto-expand all modules
    useEffect(() => {
        if (courseModules.length > 0 && expandedModules.size === 0) {
            const allIds = new Set(courseModules.map(m => m.id))
            if (allIds.size > 0) {
                setExpandedModules(allIds)
            }
        }
    }, [courseModules, expandedModules.size])

    const gradientClass = course
        ? gradients[course.title.charCodeAt(0) % gradients.length]
        : gradients[0]

    // Find first video lecture for "Start Learning" button
    const firstVideoLecture = allVideoLectures[0]

    if (loadingCourse) {
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

    if (!course) {
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
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to courses
            </Link>

            {/* Hero card */}
            <div className={cn('relative rounded-3xl overflow-hidden shadow-2xl mb-10', gradientClass)}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                <div className="relative z-10 p-8 lg:p-12">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">Course</span>
                    <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">{course.title}</h1>
                    {course.description && (
                        <p className="text-white/80 mt-4 text-sm lg:text-lg max-w-2xl leading-relaxed">{course.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <Layers className="w-4 h-4 text-white/70" />
                            <span>{courseModules.length} module{courseModules.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <PlayCircle className="w-4 h-4 text-white/70" />
                            <span>{totalLectures} lecture{totalLectures !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 text-white/70" />
                            <span>{completedCount} completed</span>
                        </div>
                    </div>

                    {/* Progress */}
                    {allVideoLectures.length > 0 && (
                        <div className="mt-8 max-w-md">
                            <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-2 uppercase tracking-wider">
                                <span>Your Progress</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/10 p-[2px]">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Start/Continue button */}
                    {firstVideoLecture && (
                        <Link
                            to={`/student/watch/${firstVideoLecture.videoId}?course=${id}`}
                        >
                            <Button className="mt-10 h-12 px-8 bg-white text-primary-foreground hover:bg-white/90 hover:scale-105 transition-all rounded-xl font-bold text-base shadow-xl shadow-black/20">
                                <PlayCircle className="w-5 h-5 mr-2" />
                                {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Course Content (Modules + Lectures) */}
            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    Course Content
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                        {courseModules.length} Modules · {totalLectures} Lectures
                    </span>
                </h2>

                {loadingCourse ? (
                    <div className="space-y-2">
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-20 animate-pulse bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : courseModules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <PlaySquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p>No content in this course yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {courseModules.map((mod: ModuleItem) => {
                            const isExpanded = expandedModules.has(mod.id)
                            const moduleLectures = mod.lectures || []
                            const moduleVideoLds = moduleLectures.filter(l => l.type === 'video').map(l => {
                                const v = typeof l.videoId === 'object' && l.videoId ? (l.videoId as Video).id : l.videoId as string
                                return v
                            }).filter(Boolean)
                            const moduleCompleted = moduleVideoLds.filter(vid => progressMap[vid]?.completed).length

                            return (
                                <div key={mod.id} className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                                    {/* Module Header */}
                                    <button
                                        onClick={() => toggleModule(mod.id)}
                                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Layers className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold">{mod.title}</h3>
                                            {mod.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mod.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="hidden sm:flex flex-col items-end mr-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{moduleLectures.length} Items</span>
                                                {moduleVideoLds.length > 0 && (
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{moduleCompleted}/{moduleVideoLds.length} Done</span>
                                                )}
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                                        </div>
                                    </button>

                                    {/* Lectures */}
                                    {isExpanded && (
                                        <div className="border-t border-border p-4 space-y-3 bg-muted/20">
                                            {moduleLectures.length === 0 ? (
                                                <p className="text-xs text-gray-500 text-center py-4">No lectures in this module yet</p>
                                            ) : (
                                                moduleLectures.map((lecture, index) => {
                                                    const videoId = typeof lecture.videoId === 'object' && lecture.videoId ? (lecture.videoId as Video).id : lecture.videoId as string
                                                    return (
                                                        <LectureRow
                                                            key={lecture.id}
                                                            lecture={lecture}
                                                            index={index}
                                                            progress={videoId ? progressMap[videoId]?.progress : undefined}
                                                            completed={videoId ? progressMap[videoId]?.completed : false}
                                                            courseId={id!}
                                                        />
                                                    )
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
