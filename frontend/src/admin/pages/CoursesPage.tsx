import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, BookOpen, ChevronDown, ChevronRight, Layers, FileVideo, FileText, Link as LinkIcon, GraduationCap, Layout, Boxes, Trash, Edit, PlusCircle, MonitorPlay, Zap, ShieldAlert } from 'lucide-react'
import { courseService, moduleService, lectureService, videoService, categoryService } from '@/admin/services'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { cn } from '@/utils'

interface LectureItem { id: string; title: string; description: string; type: string; videoId: any; resourceUrl: string | null; resourceName: string | null; order: number }
interface ModuleItem { id: string; title: string; description: string; order: number; lectures: LectureItem[] }
interface Course { id: string; title: string; description: string; thumbnail: string | null; categoryId: string; category?: string; moduleCount: number; lectureCount: number; modules?: ModuleItem[] }
interface VideoItem { id: string; title: string; duration: string }

const emptyCourseForm = { title: '', description: '', categoryId: '', thumbnail: '' }
const emptyModuleForm = { title: '', description: '' }
const emptyLectureForm = { title: '', description: '', type: 'video', videoId: '', resourceUrl: '', resourceName: '' }

const lectureTypeIcon = (type: string) => {
    switch (type) {
        case 'video': return <FileVideo className="w-4 h-4 text-primary" />
        case 'resource': return <LinkIcon className="w-4 h-4 text-emerald-500" />
        case 'material': return <FileText className="w-4 h-4 text-amber-500" />
        default: return <FileVideo className="w-4 h-4 text-muted-foreground" />
    }
}

const getThumbnailUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
    return `${baseUrl}${path}`
}

export default function CoursesPage() {
    const qc = useQueryClient()

    // Course state
    const [courseModalOpen, setCourseModalOpen] = useState(false)
    const [editCourse, setEditCourse] = useState<Course | null>(null)
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
    const [courseForm, setCourseForm] = useState(emptyCourseForm)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

    // Module state
    const [moduleModalOpen, setModuleModalOpen] = useState(false)
    const [editModule, setEditModule] = useState<ModuleItem | null>(null)
    const [moduleParentCourseId, setModuleParentCourseId] = useState<string | null>(null)
    const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null)
    const [moduleForm, setModuleForm] = useState(emptyModuleForm)

    // Lecture state
    const [lectureModalOpen, setLectureModalOpen] = useState(false)
    const [editLecture, setEditLecture] = useState<LectureItem | null>(null)
    const [lectureParentModuleId, setLectureParentModuleId] = useState<string | null>(null)
    const [deleteLectureId, setDeleteLectureId] = useState<string | null>(null)
    const [lectureForm, setLectureForm] = useState(emptyLectureForm)

    // Expanded state for accordion
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

    const { data: courses = [], isLoading } = useQuery<Course[]>({ queryKey: ['courses'], queryFn: courseService.getAll })
    const { data: allVideos = [] } = useQuery<VideoItem[]>({ queryKey: ['videos'], queryFn: videoService.getAll })
    const { data: categories = [] } = useQuery<any[]>({ queryKey: ['categories'], queryFn: categoryService.getAll })

    const toggleCourse = (id: string) => {
        setExpandedCourses(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }
    const toggleModule = (id: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // Course CRUD
    const openNewCourse = () => { setEditCourse(null); setCourseForm(emptyCourseForm); setThumbnailFile(null); setThumbnailPreview(null); setCourseModalOpen(true) }
    const openEditCourse = (c: Course) => {
        setEditCourse(c);
        setCourseForm({
            title: c.title,
            description: c.description,
            categoryId: (c as any).categoryId || '',
            thumbnail: c.thumbnail || ''
        });
        setThumbnailFile(null);
        setThumbnailPreview(getThumbnailUrl(c.thumbnail));
        setCourseModalOpen(true)
    }

    const saveCourseMutation = useMutation({
        mutationFn: () => {
            const formData = new FormData()
            formData.append('title', courseForm.title)
            formData.append('description', courseForm.description)
            formData.append('categoryId', courseForm.categoryId)

            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile)
            } else if (courseForm.thumbnail) {
                formData.append('thumbnail', courseForm.thumbnail)
            }

            return editCourse
                ? courseService.update(editCourse.id, formData)
                : courseService.create(formData)
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editCourse ? 'Course updated.' : 'Course created.'); setCourseModalOpen(false) },
        onError: () => toast.error('Failed to save course.'),
    })

    const deleteCourseMutation = useMutation({
        mutationFn: (id: string) => courseService.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course deleted.'); setDeleteCourseId(null) },
    })

    // Module CRUD
    const openNewModule = (courseId: string) => { setEditModule(null); setModuleParentCourseId(courseId); setModuleForm(emptyModuleForm); setModuleModalOpen(true) }
    const openEditModule = (m: ModuleItem, courseId: string) => { setEditModule(m); setModuleParentCourseId(courseId); setModuleForm({ title: m.title, description: m.description }); setModuleModalOpen(true) }

    const saveModuleMutation = useMutation({
        mutationFn: () => editModule
            ? moduleService.update(editModule.id, moduleForm)
            : moduleService.create({ ...moduleForm, courseId: moduleParentCourseId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editModule ? 'Module updated.' : 'Module added.'); setModuleModalOpen(false) },
        onError: () => toast.error('Failed to save module.'),
    })

    const deleteModuleMutation = useMutation({
        mutationFn: (id: string) => moduleService.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Module deleted.'); setDeleteModuleId(null) },
    })

    // Lecture CRUD
    const openNewLecture = (moduleId: string) => { setEditLecture(null); setLectureParentModuleId(moduleId); setLectureForm(emptyLectureForm); setLectureModalOpen(true) }
    const openEditLecture = (l: LectureItem, moduleId: string) => {
        setEditLecture(l);
        setLectureParentModuleId(moduleId);
        setLectureForm({
            title: l.title,
            description: l.description,
            type: l.type,
            videoId: l.videoId?.id || l.videoId?._id || (typeof l.videoId === 'string' ? l.videoId : '') || '',
            resourceUrl: l.resourceUrl || '',
            resourceName: l.resourceName || '',
        });
        setLectureModalOpen(true)
    }

    const saveLectureMutation = useMutation({
        mutationFn: () => editLecture
            ? lectureService.update(editLecture.id, lectureForm)
            : lectureService.create({ ...lectureForm, moduleId: lectureParentModuleId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editLecture ? 'Lecture updated.' : 'Lecture added.'); setLectureModalOpen(false) },
        onError: () => toast.error('Failed to save lecture.'),
    })

    const deleteLectureMutation = useMutation({
        mutationFn: (id: string) => lectureService.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Content segment erased.'); setDeleteLectureId(null) },
    })

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Spinner />
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Loading Courses...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <ToastContainer />
            <PageHeader
                title="Course Management"
                subtitle={`${courses.length} courses available in the system.`}
                action={
                    <Button onClick={openNewCourse} className="rounded-xl shadow-lg shadow-primary/20 font-bold text-xs px-6 py-6 border-none bg-primary hover:scale-[1.02] transition-transform">
                        <PlusCircle className="w-5 h-5 mr-3" />
                        Init New Curriculum
                    </Button>
                }
            />

            <div className="space-y-6">
                {courses.map((course) => (
                    <Card key={course.id} className={cn(
                        "group overflow-hidden border-border/40 transition-all duration-500 rounded-[2.5rem]",
                        expandedCourses.has(course.id) ? "shadow-2xl ring-1 ring-primary/20 bg-card" : "shadow-lg bg-card/60 hover:bg-card hover:border-primary/20"
                    )}>
                        {/* Course Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 cursor-pointer relative" onClick={() => toggleCourse(course.id)}>
                            <div className={cn(
                                "w-20 h-20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-xl overflow-hidden border border-border/20",
                                !course.thumbnail && "bg-gradient-to-br from-primary via-primary/80 to-indigo-600"
                            )}>
                                {course.thumbnail ? (
                                    <img
                                        src={getThumbnailUrl(course.thumbnail)}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = ''; // Clear broken link
                                            (e.target as HTMLImageElement).className = 'hidden';
                                        }}
                                    />
                                ) : (
                                    <GraduationCap className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-black text-foreground tracking-tight">{course.title}</h3>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20 px-2">
                                        {course.category}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground line-clamp-2 pr-12">{course.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
                                <div className="flex flex-col items-center px-4 py-2 bg-muted/50 rounded-2xl border border-border/30">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Structures</span>
                                    <span className="text-sm font-black text-foreground">{course.moduleCount || 0}</span>
                                </div>
                                <div className="flex flex-col items-center px-4 py-2 bg-muted/50 rounded-2xl border border-border/30">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Segments</span>
                                    <span className="text-sm font-black text-foreground">{course.lectureCount || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 absolute top-6 right-8">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditCourse(course) }} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteCourseId(course.id) }} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                                    <Trash className="w-4 h-4" />
                                </Button>
                                <div className={cn(
                                    "h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center transition-transform duration-500 ml-2",
                                    expandedCourses.has(course.id) ? "rotate-180 bg-primary/10 text-primary" : ""
                                )}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Modules (expanded) */}
                        {expandedCourses.has(course.id) && (
                            <div className="animate-in slide-in-from-top-4 duration-500 border-t border-border/50">
                                <div className="p-4 px-8 bg-muted/30 flex items-center justify-between border-b border-border/30">
                                    <div className="flex items-center gap-3">
                                        <Boxes className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Architectural Modules</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="rounded-xl h-8 text-[10px] font-black uppercase px-4 border-primary/30 text-primary hover:bg-primary hover:text-white" onClick={() => openNewModule(course.id)}>
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Extend Structure
                                    </Button>
                                </div>

                                {(course.modules || []).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4 opacity-40">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <Layers className="w-8 h-8" />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-widest">No Active Modules Initialized</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/30">
                                        {(course.modules || []).map((mod, idx) => (
                                            <div key={mod.id} className="group/module shadow-inner bg-background/20">
                                                {/* Module Header */}
                                                <div className="flex items-center gap-5 p-6 pl-10 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => toggleModule(mod.id)}>
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 font-black text-xs">
                                                        {(idx + 1).toString().padStart(2, '0')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-md font-extrabold text-foreground/90 group-hover/module:text-foreground transition-colors">{mod.title}</span>
                                                        {mod.description && <p className="text-xs font-medium text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="secondary" className="text-[9px] font-extrabold px-3 py-1 bg-muted border-none">
                                                            {(mod.lectures || []).length} SEGMENTS
                                                        </Badge>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/module:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModule(mod, course.id) }} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteModuleId(mod.id) }} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                                                <Trash className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                        <ChevronRight className={cn(
                                                            "w-5 h-5 text-muted-foreground/50 transition-transform duration-500",
                                                            expandedModules.has(mod.id) ? "rotate-90 text-primary" : ""
                                                        )} />
                                                    </div>
                                                </div>

                                                {/* Lectures (expanded) */}
                                                {expandedModules.has(mod.id) && (
                                                    <div className="bg-muted/10 pb-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                                        <div className="px-10 pl-24 py-3 flex items-center justify-between border-t border-border/20">
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Lectures</span>
                                                            <Button size="sm" variant="ghost" onClick={() => openNewLecture(mod.id)} className="text-[10px] font-black uppercase h-7 px-3 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg">
                                                                <Plus className="w-3 h-3 mr-1.5" /> Attach Video
                                                            </Button>
                                                        </div>
                                                        {(mod.lectures || []).length === 0 ? (
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 text-center py-6">Empty Buffer</p>
                                                        ) : (
                                                            <div className="space-y-2 px-10 pl-24 pr-16">
                                                                {(mod.lectures || []).map((lec) => (
                                                                    <div key={lec.id} className="flex items-center gap-4 p-4 bg-card/40 rounded-2xl border border-border/30 hover:border-primary/30 hover:bg-card/80 transition-all group/lec shadow-sm">
                                                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover/lec:bg-primary/10 transition-colors">
                                                                            {lectureTypeIcon(lec.type)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-bold text-foreground/80 group-hover/lec:text-foreground block truncate">{lec.title}</span>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{lec.type}</span>
                                                                                {lec.videoId?.title && (
                                                                                    <>
                                                                                        <span className="text-muted-foreground/30">|</span>
                                                                                        <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest truncate max-w-[150px]">
                                                                                            <MonitorPlay className="w-2.5 h-2.5 inline mr-1" />
                                                                                            {lec.videoId.title}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover/lec:opacity-100 transition-opacity">
                                                                            <Button variant="ghost" size="icon" onClick={() => openEditLecture(lec, mod.id)} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                                                <Edit className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteLectureId(lec.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                                                                <Trash className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Course Modal */}
            <Modal isOpen={courseModalOpen} title={editCourse ? 'Recalibrate Curriculum Entry' : 'Register New Curriculum'} onClose={() => setCourseModalOpen(false)} size="lg">
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Tactical Title" value={courseForm.title} onChange={(e) => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Record course title..." />
                        <Select label="Sector Category" value={courseForm.categoryId} onChange={(val) => setCourseForm(f => ({ ...f, categoryId: val }))}
                            options={categories.map(c => ({ value: c.id, label: c.name }))} placeholder="Select Sector..." />
                    </div>
                    <Textarea label="Strategic Description" value={courseForm.description} onChange={(e) => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Explain the primary objective..." />

                    <div className="space-y-4">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="course-thumb">Visualization (Cover Image)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/20 group hover:border-primary/50 transition-colors relative">
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl shadow-lg border border-border" />
                                ) : (
                                    <BookOpen className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                )}
                                <input type="file" accept="image/*" className="sr-only" id="course-thumb" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setThumbnailFile(file)
                                        setThumbnailPreview(URL.createObjectURL(file))
                                        setCourseForm(f => ({ ...f, thumbnail: '' })) // Clear URL if file selected
                                    }
                                }} />
                                <label htmlFor="course-thumb" className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-80 transition-all shadow-lg active:scale-95">Link Digital Graphic</label>
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">OR PASTE RESOURCE LINK</p>
                                <Input
                                    label="External Graphic URL"
                                    value={courseForm.thumbnail}
                                    onChange={(e) => {
                                        setCourseForm(f => ({ ...f, thumbnail: e.target.value }))
                                        setThumbnailFile(null)
                                        setThumbnailPreview(e.target.value)
                                    }}
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <p className="text-[9px] font-medium text-muted-foreground italic leading-relaxed">Accepted formats: JPG, PNG, WEBP. External links must be public.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setCourseModalOpen(false)}>Cancel</Button>
                        <Button loading={saveCourseMutation.isPending} onClick={() => saveCourseMutation.mutate()}>{editCourse ? 'Update Course' : 'Create Course'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Module Modal */}
            <Modal isOpen={moduleModalOpen} title={editModule ? 'Edit Module' : 'Add Module'} onClose={() => setModuleModalOpen(false)}>
                <div className="space-y-6 pt-4">
                    <Input label="Module Identifier" value={moduleForm.title} onChange={(e) => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. PHASE 01: ORIGIN" />
                    <Textarea label="Segment Rationale" value={moduleForm.description} onChange={(e) => setModuleForm(f => ({ ...f, description: e.target.value }))} placeholder="Segment logic overview..." />
                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setModuleModalOpen(false)} className="rounded-xl px-6 font-bold text-xs">DISCARD</Button>
                        <Button loading={saveModuleMutation.isPending} onClick={() => saveModuleMutation.mutate()} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest">{editModule ? 'Update Module' : 'Add Module'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Lecture Modal */}
            <Modal isOpen={lectureModalOpen} title={editLecture ? 'Edit Lecture' : 'Add Lecture'} onClose={() => setLectureModalOpen(false)}>
                <div className="space-y-6 pt-4">
                    <Input label="Lecture Title" value={lectureForm.title} onChange={(e) => setLectureForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to React" />
                    <Textarea label="Lecture Description" value={lectureForm.description} onChange={(e) => setLectureForm(f => ({ ...f, description: e.target.value }))} placeholder="Lecture details..." />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Content Type"
                            value={lectureForm.type}
                            onChange={(val) => setLectureForm(f => ({ ...f, type: val }))}
                            options={[
                                { value: 'video', label: 'Video' },
                                { value: 'resource', label: 'Resource Link' },
                                { value: 'material', label: 'Reading Material' },
                            ]}
                        />
                        {lectureForm.type === 'video' ? (
                            <Select
                                label="Select Video"
                                value={lectureForm.videoId || ''}
                                onChange={(val) => setLectureForm(f => ({ ...f, videoId: val }))}
                                options={(allVideos || []).map(v => ({ value: (v as any)._id || v.id || '', label: v.title }))}
                                placeholder={allVideos.length > 0 ? "Select a video from archive..." : "Loading available videos..."}
                            />
                        ) : (
                            <Input label="Link Text" value={lectureForm.resourceName} onChange={(e) => setLectureForm(f => ({ ...f, resourceName: e.target.value }))} placeholder="e.g. TECHNICAL PDF" />
                        )}
                    </div>

                    {lectureForm.type !== 'video' && (
                        <Input label="Resource URL" value={lectureForm.resourceUrl} onChange={(e) => setLectureForm(f => ({ ...f, resourceUrl: e.target.value }))} placeholder="https://..." />
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setLectureModalOpen(false)} className="rounded-xl px-6 font-bold text-xs">Cancel</Button>
                        <Button loading={saveLectureMutation.isPending} onClick={() => saveLectureMutation.mutate()} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest">{editLecture ? 'Update Lecture' : 'Add Lecture'}</Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteCourseId}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action will remove all modules and lectures within it."
                confirmLabel="Delete"
                variant="danger"
                loading={deleteCourseMutation.isPending}
                onConfirm={() => deleteCourseMutation.mutate(deleteCourseId!)}
                onCancel={() => setDeleteCourseId(null)}
            />

            <ConfirmModal
                isOpen={!!deleteModuleId}
                title="Delete Module"
                message="Are you sure you want to delete this module and its lectures?"
                confirmLabel="Delete"
                variant="danger"
                loading={deleteModuleMutation.isPending}
                onConfirm={() => deleteModuleMutation.mutate(deleteModuleId!)}
                onCancel={() => setDeleteModuleId(null)}
            />

            <ConfirmModal
                isOpen={!!deleteLectureId}
                title="Delete Lecture"
                message="Are you sure you want to delete this lecture? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                loading={deleteLectureMutation.isPending}
                onConfirm={() => deleteLectureMutation.mutate(deleteLectureId!)}
                onCancel={() => setDeleteLectureId(null)}
            />
        </div>
    )
}
