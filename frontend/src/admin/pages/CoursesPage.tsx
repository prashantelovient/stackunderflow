import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, BookOpen, ChevronDown, ChevronRight, Layers, FileVideo, FileText, Link as LinkIcon } from 'lucide-react'
import { courseService, moduleService, lectureService, videoService } from '@/admin/services'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'

interface LectureItem { id: string; title: string; description: string; type: string; videoId: any; resourceUrl: string | null; resourceName: string | null; order: number }
interface ModuleItem { id: string; title: string; description: string; order: number; lectures: LectureItem[] }
interface Course { id: string; title: string; description: string; thumbnail: null; category: string; moduleCount: number; lectureCount: number; modules?: ModuleItem[] }
interface VideoItem { id: string; title: string; duration: string }

const emptyCourseForm = { title: '', description: '', category: '' }
const emptyModuleForm = { title: '', description: '' }
const emptyLectureForm = { title: '', description: '', type: 'video', videoId: '', resourceUrl: '', resourceName: '' }

const lectureTypeIcon = (type: string) => {
    switch (type) {
        case 'video': return <FileVideo className="w-4 h-4 text-violet-400" />
        case 'resource': return <LinkIcon className="w-4 h-4 text-blue-400" />
        case 'material': return <FileText className="w-4 h-4 text-amber-400" />
        default: return <FileVideo className="w-4 h-4 text-gray-400" />
    }
}

export default function CoursesPage() {
    const qc = useQueryClient()

    // Course state
    const [courseModalOpen, setCourseModalOpen] = useState(false)
    const [editCourse, setEditCourse] = useState<Course | null>(null)
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
    const [courseForm, setCourseForm] = useState(emptyCourseForm)

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
    const openNewCourse = () => { setEditCourse(null); setCourseForm(emptyCourseForm); setCourseModalOpen(true) }
    const openEditCourse = (c: Course) => { setEditCourse(c); setCourseForm({ title: c.title, description: c.description, category: c.category }); setCourseModalOpen(true) }

    const saveCourseMutation = useMutation({
        mutationFn: () => editCourse ? courseService.update(editCourse.id, courseForm) : courseService.create(courseForm),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editCourse ? 'Course updated!' : 'Course created!'); setCourseModalOpen(false) },
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
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editModule ? 'Module updated!' : 'Module created!'); setModuleModalOpen(false) },
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
            videoId: l.videoId?.id || l.videoId?._id || l.videoId || '',
            resourceUrl: l.resourceUrl || '',
            resourceName: l.resourceName || '',
        });
        setLectureModalOpen(true)
    }

    const saveLectureMutation = useMutation({
        mutationFn: () => editLecture
            ? lectureService.update(editLecture.id, lectureForm)
            : lectureService.create({ ...lectureForm, moduleId: lectureParentModuleId }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success(editLecture ? 'Lecture updated!' : 'Lecture created!'); setLectureModalOpen(false) },
        onError: () => toast.error('Failed to save lecture.'),
    })

    const deleteLectureMutation = useMutation({
        mutationFn: (id: string) => lectureService.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Lecture deleted.'); setDeleteLectureId(null) },
    })

    if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

    return (
        <div>
            <ToastContainer />
            <PageHeader title="Courses" subtitle={`${courses.length} courses`} action={<Button onClick={openNewCourse}><Plus className="w-4 h-4" /> New Course</Button>} />

            <div className="space-y-4">
                {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                        {/* Course Header */}
                        <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => toggleCourse(course.id)}>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="info">{course.moduleCount || 0} modules</Badge>
                                <Badge variant="default">{course.lectureCount || 0} lectures</Badge>
                                <Badge variant="default">{course.category}</Badge>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); openEditCourse(course) }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteCourseId(course.id) }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                                {expandedCourses.has(course.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                            </div>
                        </div>

                        {/* Modules (expanded) */}
                        {expandedCourses.has(course.id) && (
                            <div className="border-t border-gray-100 dark:border-gray-800">
                                <div className="p-3 pl-8 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Modules</span>
                                    <Button size="sm" variant="outline" onClick={() => openNewModule(course.id)}><Plus className="w-3 h-3" /> Add Module</Button>
                                </div>

                                {(course.modules || []).length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-6">No modules yet. Add your first module.</p>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {(course.modules || []).map((mod) => (
                                            <div key={mod.id}>
                                                {/* Module Header */}
                                                <div className="flex items-center gap-3 px-4 pl-10 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" onClick={() => toggleModule(mod.id)}>
                                                    <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{mod.title}</span>
                                                        {mod.description && <p className="text-xs text-gray-500 line-clamp-1">{mod.description}</p>}
                                                    </div>
                                                    <Badge variant="default" className="text-[10px]">{(mod.lectures || []).length} lectures</Badge>
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModule(mod, course.id) }} className="p-1 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setDeleteModuleId(mod.id) }} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                </div>

                                                {/* Lectures (expanded) */}
                                                {expandedModules.has(mod.id) && (
                                                    <div className="bg-gray-50/50 dark:bg-gray-900/20">
                                                        <div className="px-4 pl-16 py-2 flex items-center justify-between">
                                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Lectures</span>
                                                            <Button size="sm" variant="outline" onClick={() => openNewLecture(mod.id)} className="text-xs py-0.5 px-2"><Plus className="w-3 h-3" /> Add Lecture</Button>
                                                        </div>
                                                        {(mod.lectures || []).length === 0 ? (
                                                            <p className="text-xs text-gray-400 text-center py-4">No lectures yet.</p>
                                                        ) : (
                                                            <div className="space-y-1 px-4 pl-16 pb-3">
                                                                {(mod.lectures || []).map((lec) => (
                                                                    <div key={lec.id} className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                        {lectureTypeIcon(lec.type)}
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block truncate">{lec.title}</span>
                                                                            <span className="text-[10px] text-gray-400 capitalize">{lec.type}{lec.videoId?.title ? ` · ${lec.videoId.title}` : ''}</span>
                                                                        </div>
                                                                        <button onClick={() => openEditLecture(lec, mod.id)} className="p-1 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                                                                        <button onClick={() => setDeleteLectureId(lec.id)} className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <Modal isOpen={courseModalOpen} title={editCourse ? 'Edit Course' : 'New Course'} onClose={() => setCourseModalOpen(false)}>
                <div className="space-y-4">
                    <Input label="Course Title" value={courseForm.title} onChange={(e) => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React Mastery" />
                    <Textarea label="Description" value={courseForm.description} onChange={(e) => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the course..." />
                    <Input label="Category" value={courseForm.category} onChange={(e) => setCourseForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Web Development" />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
                        <input type="file" accept="image/*" className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setCourseModalOpen(false)}>Cancel</Button>
                        <Button loading={saveCourseMutation.isPending} onClick={() => saveCourseMutation.mutate()}>{editCourse ? 'Update' : 'Create'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Module Modal */}
            <Modal isOpen={moduleModalOpen} title={editModule ? 'Edit Module' : 'New Module'} onClose={() => setModuleModalOpen(false)}>
                <div className="space-y-4">
                    <Input label="Module Title" value={moduleForm.title} onChange={(e) => setModuleForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Getting Started" />
                    <Textarea label="Description" value={moduleForm.description} onChange={(e) => setModuleForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this module..." />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setModuleModalOpen(false)}>Cancel</Button>
                        <Button loading={saveModuleMutation.isPending} onClick={() => saveModuleMutation.mutate()}>{editModule ? 'Update' : 'Create'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Lecture Modal */}
            <Modal isOpen={lectureModalOpen} title={editLecture ? 'Edit Lecture' : 'New Lecture'} onClose={() => setLectureModalOpen(false)}>
                <div className="space-y-4">
                    <Input label="Lecture Title" value={lectureForm.title} onChange={(e) => setLectureForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction" />
                    <Textarea label="Description" value={lectureForm.description} onChange={(e) => setLectureForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe this lecture..." />
                    <Select
                        label="Lecture Type"
                        value={lectureForm.type}
                        onChange={(e) => setLectureForm(f => ({ ...f, type: e.target.value }))}
                        options={[
                            { value: 'video', label: 'Video' },
                            { value: 'resource', label: 'Resource (Link)' },
                            { value: 'material', label: 'Material (Document)' },
                        ]}
                    />
                    {lectureForm.type === 'video' && (
                        <Select
                            label="Select Video"
                            value={lectureForm.videoId}
                            onChange={(e) => setLectureForm(f => ({ ...f, videoId: e.target.value }))}
                            options={allVideos.map(v => ({ value: v.id, label: `${v.title} (${v.duration})` }))}
                            placeholder="Select a video"
                        />
                    )}
                    {(lectureForm.type === 'resource' || lectureForm.type === 'material') && (
                        <>
                            <Input label="Resource URL" value={lectureForm.resourceUrl} onChange={(e) => setLectureForm(f => ({ ...f, resourceUrl: e.target.value }))} placeholder="https://..." />
                            <Input label="Resource Name" value={lectureForm.resourceName} onChange={(e) => setLectureForm(f => ({ ...f, resourceName: e.target.value }))} placeholder="e.g. Cheat Sheet PDF" />
                        </>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setLectureModalOpen(false)}>Cancel</Button>
                        <Button loading={saveLectureMutation.isPending} onClick={() => saveLectureMutation.mutate()}>{editLecture ? 'Update' : 'Create'}</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmations */}
            <ConfirmModal isOpen={!!deleteCourseId} title="Delete Course" message="This will permanently delete the course, all its modules, and all lectures."
                loading={deleteCourseMutation.isPending} onConfirm={() => deleteCourseMutation.mutate(deleteCourseId!)} onCancel={() => setDeleteCourseId(null)} />
            <ConfirmModal isOpen={!!deleteModuleId} title="Delete Module" message="This will permanently delete the module and all its lectures."
                loading={deleteModuleMutation.isPending} onConfirm={() => deleteModuleMutation.mutate(deleteModuleId!)} onCancel={() => setDeleteModuleId(null)} />
            <ConfirmModal isOpen={!!deleteLectureId} title="Delete Lecture" message="This will permanently delete this lecture."
                loading={deleteLectureMutation.isPending} onConfirm={() => deleteLectureMutation.mutate(deleteLectureId!)} onCancel={() => setDeleteLectureId(null)} />
        </div>
    )
}
