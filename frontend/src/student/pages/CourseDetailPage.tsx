import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, PlayCircle, CheckCircle2, Clock, PlaySquare, ChevronRight, ChevronDown, Lock,
    Layers, FileText, Link as LinkIcon, FileVideo
} from 'lucide-react'
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

            {/* Icon */}
            <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800/50 overflow-hidden flex items-center justify-center">
                {lecture.type === 'video' && videoData?.thumbnail ? (
                    <img
                        src={`http://localhost:5000${videoData.thumbnail}`}
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
                    'text-sm font-medium leading-snug line-clamp-1 transition-colors',
                    completed ? 'text-gray-400 line-through' : 'text-white group-hover:text-violet-300'
                )}>
                    {lecture.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 capitalize px-1.5 py-0.5 bg-white/5 rounded">{lecture.type}</span>
                    {lecture.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{lecture.description}</p>
                    )}
                </div>
                {progress !== undefined && progress > 0 && !completed && lecture.type === 'video' && (
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
    if (courseModules.length > 0 && expandedModules.size === 0) {
        const allIds = new Set(courseModules.map(m => m.id))
        if (allIds.size > 0) {
            setExpandedModules(allIds)
        }
    }

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
                    <h1 className="text-2xl lg:text-4xl font-bold text-white leading-tight">{course.title}</h1>
                    {course.description && (
                        <p className="text-white/70 mt-3 text-sm lg:text-base max-w-2xl">{course.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 mt-5">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Layers className="w-4 h-4" />
                            <span>{courseModules.length} module{courseModules.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <PlayCircle className="w-4 h-4" />
                            <span>{totalLectures} lecture{totalLectures !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{completedCount} completed</span>
                        </div>
                    </div>

                    {/* Progress */}
                    {allVideoLectures.length > 0 && (
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
                    {firstVideoLecture && (
                        <Link
                            to={`/student/watch/${firstVideoLecture.videoId}?course=${id}`}
                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
                        >
                            <PlayCircle className="w-4 h-4" />
                            {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Link>
                    )}
                </div>
            </div>

            {/* Course Content (Modules + Lectures) */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                    Course Content
                    <span className="ml-2 text-sm font-normal text-gray-400">
                        {courseModules.length} module{courseModules.length !== 1 ? 's' : ''} · {totalLectures} lecture{totalLectures !== 1 ? 's' : ''}
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
                                <div key={mod.id} className="rounded-xl border border-white/8 overflow-hidden bg-white/3">
                                    {/* Module Header */}
                                    <button
                                        onClick={() => toggleModule(mod.id)}
                                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <Layers className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                                            {mod.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mod.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-500">{moduleLectures.length} lecture{moduleLectures.length !== 1 ? 's' : ''}</span>
                                            {moduleVideoLds.length > 0 && (
                                                <span className="text-xs text-emerald-400">{moduleCompleted}/{moduleVideoLds.length}</span>
                                            )}
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                        </div>
                                    </button>

                                    {/* Lectures */}
                                    {isExpanded && (
                                        <div className="border-t border-white/5 p-3 space-y-2">
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
