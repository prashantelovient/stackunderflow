import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    Plus, Pencil, Trash2, Video, Play, Clock, Calendar,
    Layout, Trash, Edit, Eye, UploadCloud, Film,
    MoreVertical, Search, FileVideo
} from 'lucide-react'
import { videoService, courseService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import VideoPlayer from '@/admin/components/VideoPlayer'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { formatDate, cn } from '@/utils'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/admin/components/dropdown-menu"

interface VideoItem { id: string; title: string; description: string; thumbnail: string | null; courseId: string; courseTitle: string; duration: string; uploadDate: string }
interface CourseItem { id: string; title: string }

const emptyForm = { title: '', description: '', duration: '', courseId: '' }

const getThumbnailUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
    return `${baseUrl}${path}`
}

export default function InstructorVideosPage() {
    const qc = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [editItem, setEditItem] = useState<VideoItem | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [viewVideo, setViewVideo] = useState<VideoItem | null>(null)

    const { data: videos = [], isLoading } = useQuery<VideoItem[]>({
        queryKey: ['instructor-videos'],
        queryFn: videoService.getAll
    })
    const { data: courses = [] } = useQuery<CourseItem[]>({
        queryKey: ['instructor-courses-list'],
        queryFn: courseService.getAll
    })

    const openNew = () => {
        setEditItem(null);
        setForm(emptyForm);
        setThumbnailFile(null);
        setVideoFile(null);
        setThumbnailPreview(null);
        setModalOpen(true);
    }
    const openEdit = (v: VideoItem) => {
        setEditItem(v);
        setForm({ title: v.title, description: v.description, duration: v.duration, courseId: v.courseId, thumbnail: v.thumbnail || '' } as any);
        setThumbnailFile(null);
        setVideoFile(null);
        setThumbnailPreview(getThumbnailUrl(v.thumbnail));
        setModalOpen(true);
    }

    const saveMutation = useMutation({
        mutationFn: async () => {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            if (thumbnailFile) {
                fd.append('thumbnail', thumbnailFile)
            } else if ((form as any).thumbnail) {
                fd.append('thumbnail', (form as any).thumbnail)
            }
            if (videoFile) fd.append('video', videoFile)
            return editItem ? videoService.update(editItem.id, fd) : videoService.create(fd)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['instructor-videos'] });
            toast.success(editItem ? 'HLS Asset reconfigured.' : 'Broadcast segment initialized.');
            setModalOpen(false)
        },
        onError: () => toast.error('Security Protocol Failure: Asset sync rejected.'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => videoService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['instructor-videos'] });
            toast.success('Asset purged from archive.');
            setDeleteId(null)
        },
    })

    const columns = useMemo<ColumnDef<VideoItem, unknown>[]>(() => [
        {
            id: 'preview', header: 'Visual Preview',
            cell: ({ row }) => {
                const thumb = row.original.thumbnail;
                return (
                    <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-muted/50 border border-border/50 group/thumb">
                        {thumb ? (
                            <img src={getThumbnailUrl(thumb)!} alt="" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-5 h-5 text-slate-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'title',
            header: 'Asset Identifier',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm tracking-tight">{row.original.title}</span>
                    <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-widest pt-0.5 line-clamp-1 max-w-[200px]">{row.original.description}</span>
                </div>
            )
        },
        {
            accessorKey: 'courseTitle',
            header: 'Linked Course',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-[10px] font-extrabold bg-indigo-500/5 border-indigo-500/20 text-indigo-400">
                    <Layout className="w-3 h-3 mr-1.5" />
                    {row.original.courseTitle || 'Unlinked'}
                </Badge>
            )
        },
        {
            accessorKey: 'duration',
            header: 'Duration',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-xs font-black font-mono text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {row.original.duration}
                </div>
            )
        },
        {
            accessorKey: 'uploadDate',
            header: 'Registry Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(row.original.uploadDate)}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Management',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="h-9 w-9 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground flex items-center justify-center outline-none"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl border-border bg-card text-foreground shadow-2xl z-50"
                    >
                        <DropdownMenuItem
                            onClick={() => setViewVideo(row.original)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => openEdit(row.original)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setDeleteId(row.original.id)}
                            className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash className="w-4 h-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [courses])

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Spinner />
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Syncing HLS Content Nodes...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <ToastContainer />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Video Archives</h1>
                    <p className="text-muted-foreground mt-1">Manage your course video assets and HLS broadcast nodes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={openNew}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all h-12 px-6 font-bold"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Initialize Uplink
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-border/80 shadow-xl bg-card/40 backdrop-blur-sm">
                <CardContent className="p-0">
                    <DataTable
                        data={videos}
                        columns={columns}
                        searchPlaceholder="Search archive by identifier..."
                        searchKey="title"
                    />
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} title={editItem ? 'Configuration: Update Asset' : 'Registry: New Content Uplink'} onClose={() => setModalOpen(false)} size="md">
                <div className="space-y-6 pt-4">
                    <Input label="Video Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter content identifier..." />
                    <Textarea label="Video Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of segments..." />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Duration (Optional)" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45:30" />
                        <Select label="Assign to Course" value={form.courseId} onChange={(val) => setForm(f => ({ ...f, courseId: val }))}
                            options={courses.map((c) => ({ value: c.id, label: c.title }))} placeholder="Assign course node..." />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="video-thumb">Visualization (Thumbnail)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/40 relative">
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="w-full aspect-video object-cover rounded-xl shadow-lg" />
                                ) : (
                                    <Film className="w-8 h-8 text-muted-foreground/40" />
                                )}
                                <input type="file" accept="image/*" className="sr-only" id="video-thumb" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setThumbnailFile(file)
                                        setThumbnailPreview(URL.createObjectURL(file))
                                        setForm(f => ({ ...f, thumbnail: '' }))
                                    }
                                }} />
                                <label htmlFor="video-thumb" className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-80 transition-all shadow-lg active:scale-95">Upload Image</label>
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">OR PASTE URL</p>
                                <Input
                                    label="Thumbnail URL"
                                    value={(form as any).thumbnail}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, thumbnail: e.target.value }))
                                        setThumbnailFile(null)
                                        setThumbnailPreview(e.target.value)
                                    }}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Segment Binary (Video)</label>
                        <div className="p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                            <UploadCloud className="w-10 h-10 text-muted-foreground/40" />
                            <label className="cursor-pointer">
                                <input type="file" accept="video/*" onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) setVideoFile(file)
                                }} className="hidden" />
                                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">Choose HLS Source</span>
                            </label>
                            {videoFile ? (
                                <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase mt-2">Ready: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                            ) : (
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">No source segment linked.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl px-6 font-bold text-xs text-muted-foreground hover:text-foreground">DISCARD</Button>
                        <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-8 shadow-lg shadow-indigo-600/20 font-bold text-xs uppercase tracking-widest h-11">
                            {editItem ? 'UPDATE CONFIG' : 'INITIALIZE ASSET'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="DANGER: DESTRUCTIVE PURGE"
                message="This operation will permanently erase the video binary and all related telemetry. Recovery is not possible within current protocols."
                confirmLabel="EXECUTE PURGE"
                variant="danger"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteMutation.mutate(deleteId!)}
                onCancel={() => setDeleteId(null)}
            />

            {/* View Video Modal */}
            <Modal isOpen={!!viewVideo} title={viewVideo?.title || 'Signal Monitor'} onClose={() => setViewVideo(null)} size="lg">
                <div className="space-y-6 pt-2">
                    <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/5 group ring-1 ring-white/10">
                        {viewVideo ? (
                            <VideoPlayer
                                options={{
                                    autoplay: true,
                                    controls: true,
                                    sources: [{
                                        src: `${import.meta.env.VITE_API_URL || (window.location.protocol + '//' + window.location.hostname + ':5000/api')}/stream/${viewVideo.id}?token=${localStorage.getItem('token')}`,
                                        type: 'application/x-mpegURL'
                                    }]
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <Spinner className="w-10 h-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Signal...</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 px-2 pb-2">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black tracking-tight text-foreground">{viewVideo?.title}</h3>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[9px] font-extrabold bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest">
                                        {viewVideo?.courseTitle}
                                    </Badge>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" />
                                        {viewVideo?.duration}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed p-6 bg-muted/40 rounded-3xl border border-border/50 italic">
                            {viewVideo?.description}
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
