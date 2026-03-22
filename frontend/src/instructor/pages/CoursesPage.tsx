import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService, moduleService, lectureService, videoService, categoryService, noteService } from '@/admin/services'
import { PageHeader, Badge, Spinner, Button as AdminButton, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Toast'
import {
    Plus, Pencil, Trash2, BookOpen, ChevronDown, ChevronRight, Layers,
    FileVideo, FileText, Link as LinkIcon, GraduationCap, Layout, Boxes,
    Trash, Edit, PlusCircle, MonitorPlay, Zap, ShieldAlert,
    LayoutDashboard, Search, PenSquare, Trash2 as TrashIcon, Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LectureItem { id: string; title: string; description: string; type: string; videoId: any; resourceUrl: string | null; resourceName: string | null; order: number }
interface ModuleItem { id: string; title: string; description: string; order: number; lectures: LectureItem[] }
interface Course { id: string; title: string; description: string; thumbnail: string | null; categoryId: string; category?: string; moduleCount: number; lectureCount: number; modules?: ModuleItem[] }
interface VideoItem { id: string; title: string }

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
    if (!path) return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
    if (path.startsWith('http')) return path
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
    return `${baseUrl}${path}`
}

export default function InstructorCoursesPage() {
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
    const { data: allNotes = [] } = useQuery<any[]>({ queryKey: ['instructor-notes'], queryFn: noteService.getAll })

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
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono text-white">Loading Courses...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <ToastContainer />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">Create, edit and manage your teaching content here.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={openNewCourse}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all h-10 px-6 font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        New Course
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {courses.map((course) => (
                    <Card key={course.id} className={cn(
                        "group overflow-hidden border-border bg-card/40 backdrop-blur-sm transition-all duration-500 rounded-[2.5rem]",
                        expandedCourses.has(course.id) ? "shadow-2xl ring-1 ring-indigo-500/20" : "shadow-lg hover:border-indigo-500/50"
                    )}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 cursor-pointer relative" onClick={() => toggleCourse(course.id)}>
                            <div className="w-24 h-24 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-xl overflow-hidden border border-border bg-muted">
                                <img
                                    src={getThumbnailUrl(course.thumbnail)}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-foreground tracking-tight">{course.title}</h3>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/5 text-indigo-400 border-indigo-500/20 px-2">
                                        {course.category || 'Uncategorized'}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground line-clamp-2 pr-12">{course.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
                                <div className="flex flex-col items-center px-4 py-2 bg-background/40 rounded-2xl border border-border/50">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Modules</span>
                                    <span className="text-sm font-bold text-foreground">{course.moduleCount || 0}</span>
                                </div>
                                <div className="flex flex-col items-center px-4 py-2 bg-background/40 rounded-2xl border border-border/50">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lectures</span>
                                    <span className="text-sm font-bold text-foreground">{course.lectureCount || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditCourse(course) }} className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400">
                                    <PenSquare className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteCourseId(course.id) }} className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-muted">
                                    <ChevronDown className={cn("w-5 h-5 transition-transform", expandedCourses.has(course.id) && "rotate-180")} />
                                </Button>
                            </div>
                        </div>

                        {expandedCourses.has(course.id) && (
                            <div className="animate-in slide-in-from-top-4 duration-500 border-t border-border">
                                <div className="p-4 px-8 bg-background/20 flex items-center justify-between border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Boxes className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Modules</span>
                                    </div>
                                    <Button onClick={() => openNewModule(course.id)} variant="outline" className="h-8 text-[10px] font-bold uppercase px-4 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl">
                                        <Plus className="w-3.5 h-3.5 mr-2" />
                                        Add Module
                                    </Button>
                                </div>

                                {(course.modules || []).length === 0 ? (
                                    <div className="py-12 text-center opacity-40">
                                        <Layers className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">No Modules Yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {(course.modules || []).map((mod, idx) => (
                                            <div key={mod.id} className="bg-background/10">
                                                <div className="flex items-center gap-5 p-6 pl-10 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleModule(mod.id)}>
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 font-bold text-xs">
                                                        {(idx + 1).toString().padStart(2, '0')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-md font-bold text-foreground">{mod.title}</span>
                                                        {mod.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mod.description}</p>}
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Badge className="bg-muted text-muted-foreground border-none px-3">
                                                            {(mod.lectures || []).length} LECTURES
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModule(mod, course.id) }} className="h-8 w-8 hover:bg-indigo-500/10 hover:text-indigo-400">
                                                                <PenSquare className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteModuleId(mod.id) }} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                        <ChevronRight className={cn("w-5 h-5 transition-all text-slate-600", expandedModules.has(mod.id) && "rotate-90 text-indigo-400")} />
                                                    </div>
                                                </div>

                                                {expandedModules.has(mod.id) && (
                                                    <div className="bg-background/30 pb-4 animate-in fade-in slide-in-from-left-2 duration-300 border-t border-border/50">
                                                        <div className="px-10 pl-24 py-3 flex items-center justify-between">
                                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Lectures</span>
                                                            <Button onClick={() => openNewLecture(mod.id)} variant="ghost" className="text-[10px] font-bold h-7 px-3 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg">
                                                                <Plus className="w-3 h-3 mr-1.5" /> New Lecture
                                                            </Button>
                                                        </div>
                                                        {(mod.lectures || []).length === 0 ? (
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-6">Empty Buffer</p>
                                                        ) : (
                                                            <div className="space-y-2 px-10 pl-24 pr-16">
                                                                {(mod.lectures || []).map((lec) => (
                                                                    <div key={lec.id} className="flex items-center gap-4 p-4 bg-background/40 rounded-2xl border border-border hover:border-indigo-500/30 hover:bg-muted/60 transition-all group/lec shadow-sm">
                                                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover/lec:bg-indigo-500/10 transition-colors">
                                                                            {lectureTypeIcon(lec.type)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-bold text-foreground/80 group-hover/lec:text-foreground block truncate">{lec.title}</span>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{lec.type}</span>
                                                                                {lec.videoId?.title && (
                                                                                    <>
                                                                                        <span className="text-border">|</span>
                                                                                        <span className="text-[9px] font-bold text-indigo-400/70 uppercase tracking-widest truncate max-w-[150px]">
                                                                                            <MonitorPlay className="w-2.5 h-2.5 inline mr-1" />
                                                                                            {lec.videoId.title}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button variant="ghost" size="icon" onClick={() => openEditLecture(lec, mod.id)} className="h-8 w-8 hover:bg-indigo-500/10 hover:text-indigo-400">
                                                                                <PenSquare className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteLectureId(lec.id)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400">
                                                                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* Modals */}
            <Modal isOpen={courseModalOpen} title={editCourse ? 'Edit Course' : 'Create Course'} onClose={() => setCourseModalOpen(false)} size="lg">
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Course Title" value={courseForm.title} onChange={(e) => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter title..." />
                        <Select label="Category" value={courseForm.categoryId} onChange={(val) => setCourseForm(f => ({ ...f, categoryId: val }))}
                            options={categories.map(c => ({ value: c.id, label: c.name }))} placeholder="Select category..." />
                    </div>
                    <Textarea label="Description" value={courseForm.description} onChange={(e) => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter description..." />

                    <div className="space-y-4">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground" htmlFor="course-thumb">Thumbnail</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/40 relative">
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl shadow-lg" />
                                ) : (
                                    <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                                )}
                                <input type="file" accept="image/*" className="sr-only" id="course-thumb" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setThumbnailFile(file)
                                        setThumbnailPreview(URL.createObjectURL(file))
                                        setCourseForm(f => ({ ...f, thumbnail: '' }))
                                    }
                                }} />
                                <label htmlFor="course-thumb" className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-80 transition-all shadow-lg active:scale-95">Upload Image</label>
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">OR PASTE URL</p>
                                <Input
                                    label="Thumbnail URL"
                                    value={courseForm.thumbnail}
                                    onChange={(e) => {
                                        setCourseForm(f => ({ ...f, thumbnail: e.target.value }))
                                        setThumbnailFile(null)
                                        setThumbnailPreview(e.target.value)
                                    }}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                        <AdminButton variant="ghost" onClick={() => setCourseModalOpen(false)}>Cancel</AdminButton>
                        <AdminButton loading={saveCourseMutation.isPending} onClick={() => saveCourseMutation.mutate()}>{editCourse ? 'Update' : 'Create'}</AdminButton>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={moduleModalOpen} title={editModule ? 'Edit Module' : 'Add Module'} onClose={() => setModuleModalOpen(false)}>
                <div className="space-y-6 pt-4">
                    <Input label="Module Title" value={moduleForm.title} onChange={(e) => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter title..." />
                    <Textarea label="Description" value={moduleForm.description} onChange={(e) => setModuleForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter description..." />
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                        <AdminButton variant="ghost" onClick={() => setModuleModalOpen(false)}>Discard</AdminButton>
                        <AdminButton loading={saveModuleMutation.isPending} onClick={() => saveModuleMutation.mutate()}>{editModule ? 'Update' : 'Add'}</AdminButton>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={lectureModalOpen} title={editLecture ? 'Edit Lecture' : 'Add Lecture'} onClose={() => setLectureModalOpen(false)}>
                <div className="space-y-6 pt-4">
                    <Input label="Lecture Title" value={lectureForm.title} onChange={(e) => setLectureForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter title..." />
                    <Textarea label="Description" value={lectureForm.description} onChange={(e) => setLectureForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter description..." />
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            value={lectureForm.type}
                            onChange={(val) => setLectureForm(f => ({ ...f, type: val }))}
                            options={[
                                { value: 'video', label: 'Video' },
                                { value: 'resource', label: 'Resource Link' },
                                { value: 'material', label: 'Material' },
                            ]}
                        />
                        {lectureForm.type === 'video' ? (
                            <Select
                                label="Video"
                                value={lectureForm.videoId || ''}
                                onChange={(val) => setLectureForm(f => ({ ...f, videoId: val }))}
                                options={(allVideos || []).map(v => ({ value: (v as any)._id || v.id || '', label: v.title }))}
                                placeholder="Select video..."
                            />
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Select
                                    label="Select from Notes"
                                    value={''}
                                    onChange={(val) => {
                                        const selectedNote = allNotes.find(n => (n._id || n.id) === val);
                                        if (selectedNote) {
                                            setLectureForm(f => ({
                                                ...f,
                                                resourceUrl: selectedNote.fileUrl,
                                                resourceName: selectedNote.title
                                            }))
                                        }
                                    }}
                                    options={(allNotes || []).map(n => ({ value: (n._id || n.id) || '', label: n.title }))}
                                    placeholder="Pick from repository..."
                                />
                                <Input label="Resource Name" value={lectureForm.resourceName} onChange={(e) => setLectureForm(f => ({ ...f, resourceName: e.target.value }))} placeholder="e.g. PDF" />
                            </div>
                        )}
                    </div>
                    {lectureForm.type !== 'video' && (
                        <div className="space-y-4">
                            <Input label="Resource URL (or S3 Key)" value={lectureForm.resourceUrl} onChange={(e) => setLectureForm(f => ({ ...f, resourceUrl: e.target.value }))} placeholder="https://..." />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1">Tip: You can upload files in the Notes section and pick them above.</p>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/50">
                        <AdminButton variant="ghost" onClick={() => setLectureModalOpen(false)}>Cancel</AdminButton>
                        <AdminButton loading={saveLectureMutation.isPending} onClick={() => saveLectureMutation.mutate()}>{editLecture ? 'Update' : 'Add'}</AdminButton>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteCourseId}
                title="Delete Course"
                message="Are you sure you want to delete this course? All modules and lectures will be lost."
                confirmLabel="Delete"
                variant="danger"
                loading={deleteCourseMutation.isPending}
                onConfirm={() => deleteCourseMutation.mutate(deleteCourseId!)}
                onCancel={() => setDeleteCourseId(null)}
            />

            <ConfirmModal
                isOpen={!!deleteModuleId}
                title="Delete Module"
                message="Delete this module and its lectures?"
                confirmLabel="Delete"
                variant="danger"
                loading={deleteModuleMutation.isPending}
                onConfirm={() => deleteModuleMutation.mutate(deleteModuleId!)}
                onCancel={() => setDeleteModuleId(null)}
            />

            <ConfirmModal
                isOpen={!!deleteLectureId}
                title="Delete Lecture"
                message="Are you sure?"
                confirmLabel="Delete"
                variant="danger"
                loading={deleteLectureMutation.isPending}
                onConfirm={() => deleteLectureMutation.mutate(deleteLectureId!)}
                onCancel={() => setDeleteLectureId(null)}
            />
        </div>
    )
}
