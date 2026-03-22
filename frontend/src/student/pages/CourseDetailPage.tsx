import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, PlayCircle, CheckCircle2, Clock, PlaySquare, ChevronRight, ChevronDown, Lock,
    Layers, FileText, Link as LinkIcon, FileVideo, ShieldCheck, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { courses, watchProgress } from '@/student/services/studentService'
import { purchaseService } from '@/student/services/purchaseService'
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

const getThumbnailUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
    return `${baseUrl}${path}`
}

function LectureRow({
    lecture,
    index,
    progress,
    completed,
    courseId,
    isEnrolled,
}: {
    lecture: LectureItem
    index: number
    progress?: number
    completed?: boolean
    courseId: string
    isEnrolled?: boolean
}) {
    const navigate = useNavigate()
    const isLocked = !isEnrolled
    const videoData = typeof lecture.videoId === 'object' && lecture.videoId ? lecture.videoId as Video : null
    const videoId = videoData?.id || (typeof lecture.videoId === 'string' ? lecture.videoId : null)

    const handleClick = () => {
        if (isLocked) {
            toast.error('Access Restricted: Complete enrollment to unlock this segment.')
            return
        }
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
                'group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300',
                'bg-card border border-border hover:bg-muted/80 shadow-sm hover:shadow-md h-20',
                isLocked && 'opacity-60 grayscale-[0.5] border-dashed bg-slate-900/10'
            )}
        >
            {/* Index / status */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-mono">
                {isLocked ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                ) : completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                    <span className="text-gray-500 group-hover:hidden">{index + 1}</span>
                )}
                {!completed && !isLocked && (
                    <PlayCircle className="w-6 h-6 text-violet-400 hidden group-hover:block" />
                )}
            </div>

            {/* Icon */}
            <div className={cn(
                "relative flex-shrink-0 w-12 h-12 rounded-xl bg-gray-800/50 overflow-hidden flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-105",
                isLocked && "blur-[1px]"
            )}>
                {lecture.type === 'video' && videoData?.thumbnail ? (
                    <img
                        src={getThumbnailUrl(videoData.thumbnail)!}
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
            <div className={cn("flex-1 min-w-0 transition-all", isLocked && 'blur-[0.5px]')}>
                <h4 className={cn(
                    'text-sm font-black leading-snug line-clamp-1 transition-colors tracking-tight',
                    completed ? 'text-muted-foreground/60 line-through' : 'text-foreground group-hover:text-primary',
                    isLocked && 'text-slate-500'
                )}>
                    {lecture.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border-white/5",
                        isLocked ? 'bg-slate-800/40 text-slate-600' : 'bg-muted text-muted-foreground'
                    )}>
                        {lecture.type}
                    </Badge>
                </div>
            </div>



            {!isLocked && <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />}
        </div>
    )
}

export default function CourseDetailPage() {
    const qc = useQueryClient()
    const { id } = useParams<{ id: string }>()
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

    const { data: course, isLoading: loadingCourse } = useQuery({
        queryKey: ['student-course', id],
        queryFn: () => courses.getById(id!),
        enabled: !!id,
    })

    const enrollMutation = useMutation({
        mutationFn: () => courses.enroll(id!),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['student-course', id] })
            qc.invalidateQueries({ queryKey: ['student-courses'] })
            toast.success('Enrollment Established: Content nodes unlocked.')
        },
        onError: (err: any) => {
             const msg = err.response?.data?.message || 'Enrollment Failed: Security protocol rejection.'
             toast.error(msg)
        }
    })

    const buyMutation = useMutation({
        mutationFn: () => purchaseService.buyCourse(id!),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['student-course', id] })
            toast.success(data.message || 'Transaction Authorized: Course asset linked to your account.')
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Transaction Terminated: Connection to vault failed.'
            toast.error(msg)
        }
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
            <Link
                to="/student/courses"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to courses
            </Link>

            <div className={cn('relative rounded-3xl overflow-hidden shadow-2xl mb-10 group', gradientClass)}>
                {course.thumbnail && (
                    <div className="absolute inset-0">
                        <img
                            src={getThumbnailUrl(course.thumbnail)!}
                            alt=""
                            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/10 backdrop-blur-[2px]" />
                <div className="relative z-10 p-8 lg:p-12">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md">Course</span>
                    <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">{course.title}</h1>
                    {course.description && (
                        <p className="text-white/80 mt-4 text-sm lg:text-lg max-w-2xl leading-relaxed">{course.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <Layers className="w-4 h-4 text-white/70" />
                            <span>{courseModules.length} module{courseModules.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <PlayCircle className="w-4 h-4 text-white/70" />
                            <span>{totalLectures} lecture{totalLectures !== 1 ? 's' : ''}</span>
                        </div>
                        {course.isEnrolled && (
                            <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4 text-white/70" />
                                <span>{completedCount} completed</span>
                            </div>
                        )}
                        {(course.price || 0) > 0 && (
                            <div className="flex items-center gap-2 text-white/90 text-sm font-black tracking-widest bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                <span>₹{course.price}</span>
                            </div>
                        )}
                        {course.isPurchased && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-black tracking-widest uppercase text-[10px] px-3 py-1 rounded-xl">
                                Purchased
                            </Badge>
                        )}
                    </div>

                    {course.isEnrolled && allVideoLectures.length > 0 && (
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

                    {course.isEnrolled ? (
                        firstVideoLecture ? (
                            <Link
                                to={`/student/watch/${firstVideoLecture.videoId}?course=${id}`}
                            >
                                <Button className="mt-10 h-14 px-10 bg-white text-black hover:bg-white/90 hover:scale-105 transition-all rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/40 border border-white/20">
                                    <PlayCircle className="w-5 h-5 mr-3 fill-black/10" />
                                    {progressPercent > 0 ? 'Resynchronize Learning' : 'Initialize Terminal'}
                                </Button>
                            </Link>
                        ) : null
                    ) : course.isPending ? (
                        <div className="mt-10">
                            <Button
                                disabled
                                className="h-14 px-10 bg-amber-500/20 text-amber-500 cursor-not-allowed rounded-2xl font-black text-sm uppercase tracking-[0.15em] border border-amber-500/30"
                            >
                                Pending Approval
                                <Clock className="w-4 h-4 ml-3 animate-pulse" />
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            {/* Purchase / Enrollment logic */}
                            {(course.price > 0 && !course.isPurchased) ? (
                                <Button
                                    onClick={() => buyMutation.mutate()}
                                    disabled={buyMutation.isPending}
                                    className="h-14 px-10 bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 transition-all rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-emerald-500/30 border border-emerald-400/30"
                                >
                                    {buyMutation.isPending ? 'Processing Payment...' : `Buy Course (₹${course.price})`}
                                    <Zap className="w-4 h-4 ml-3 fill-white/20" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => enrollMutation.mutate()}
                                    disabled={enrollMutation.isPending}
                                    className="h-14 px-10 bg-indigo-500 text-white hover:bg-indigo-400 hover:scale-105 transition-all rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-indigo-500/30 border border-indigo-400/30"
                                >
                                    {enrollMutation.isPending ? 'Syncing...' : 'Enroll in Course'}
                                    <Zap className="w-4 h-4 ml-3 fill-white/20" />
                                </Button>
                            )}
                            <Button variant="outline" className="h-14 px-8 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 rounded-2xl font-black text-sm uppercase tracking-widest">
                                Watch Trailer
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer />

            {/* Purchase / Enrollment info message */}
            {!course.isEnrolled && (
                <div className={cn(
                    "rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse border shadow-lg",
                    course.isPending ? "bg-amber-500/5 border-amber-500/20 shadow-amber-500/5" : 
                    (course.price > 0 && !course.isPurchased) ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5" :
                    "bg-indigo-500/5 border-indigo-500/20 shadow-indigo-500/5"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                            course.isPending ? "bg-amber-500/20 shadow-amber-500/20" : 
                            (course.price > 0 && !course.isPurchased) ? "bg-emerald-500/20 shadow-emerald-500/20" :
                            "bg-indigo-500/20 shadow-indigo-500/20"
                        )}>
                            {course.isPending ? <Clock className="w-6 h-6 text-amber-400" /> : 
                             (course.price > 0 && !course.isPurchased) ? <Zap className="w-6 h-6 text-emerald-400" /> :
                             <Lock className="w-6 h-6 text-indigo-400" />}
                        </div>
                        <div>
                            <h4 className={cn("font-black tracking-tight uppercase text-xs mb-0.5", 
                                course.isPending ? "text-amber-400" : 
                                (course.price > 0 && !course.isPurchased) ? "text-emerald-400" :
                                "text-white"
                            )}>
                                {course.isPending ? 'Enrollment Pending' : 
                                 (course.price > 0 && !course.isPurchased) ? 'Course Locked: Purchase Required' :
                                 'Course Encrypted: Enrollment Required'}
                            </h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {course.isPending
                                    ? 'Request transmitted. Instructor authorization is currently in progress.'
                                    : (course.price > 0 && !course.isPurchased)
                                    ? `This is a premium course (₹${course.price}). Unlock it now to initialize decryption protocols.`
                                    : 'Course binaries are locked. Enroll to initialize decryption protocols and unlock content nodes.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            <div className={cn("transition-all duration-700", !course.isEnrolled && "blur-[2px] pointer-events-none select-none grayscale-[0.3]")}>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    Course Content
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                        {courseModules.length} Modules · {totalLectures} Lectures
                    </span>
                </h2>

                {courseModules.length === 0 ? (
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
                                                {course.isEnrolled && moduleVideoLds.length > 0 && (
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{moduleCompleted}/{moduleVideoLds.length} Done</span>
                                                )}
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                                        </div>
                                    </button>

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
                                                            isEnrolled={course.isEnrolled}
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
