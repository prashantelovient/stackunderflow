import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Video, Play, Clock, Calendar, Layout, Trash, Edit, Eye, UploadCloud, Film } from 'lucide-react'
import { videoService, courseService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import VideoPlayer from '@/admin/components/VideoPlayer'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate, cn } from '@/utils'

interface VideoItem { id: string; title: string; description: string; thumbnail: string | null; courseId: string; courseTitle: string; duration: string; uploadDate: string }
interface CourseItem { id: string; title: string }

const emptyForm = { title: '', description: '', duration: '', courseId: '' }

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
  return `${baseUrl}${path}`
}

export default function VideosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<VideoItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [viewVideo, setViewVideo] = useState<VideoItem | null>(null)

  const { data: videos = [], isLoading } = useQuery<VideoItem[]>({ queryKey: ['videos'], queryFn: videoService.getAll })
  const { data: courses = [] } = useQuery<CourseItem[]>({ queryKey: ['courses'], queryFn: courseService.getAll })

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
      qc.invalidateQueries({ queryKey: ['videos'] });
      toast.success(editItem ? 'HLS Asset reconfigured.' : 'Broadcast segment initialized.');
      setModalOpen(false)
    },
    onError: () => toast.error('Security Protocol Failure: Asset sync rejected.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videoService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Asset purged from archive.');
      setDeleteId(null)
    },
  })

  const columns = useMemo<ColumnDef<VideoItem, unknown>[]>(() => [
    {
      id: 'preview', header: 'HLS Segment',
      cell: ({ row }) => {
        const thumb = row.original.thumbnail;
        return (
          <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-muted/50 border border-border/50 group/thumb">
            {thumb ? (
              <img src={getThumbnailUrl(thumb)!} alt="" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-5 h-5 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
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
      header: 'Linked Curriculum',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-extrabold bg-primary/5 border-primary/20 text-primary">
          <Layout className="w-3 h-3 mr-1.5" />
          {row.original.courseTitle}
        </Badge>
      )
    },
    {
      accessorKey: 'duration',
      header: 'Temporal Length',
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
      id: 'actions', header: 'Management',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewVideo(row.original)} className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group" title="INITIATE PREVIEW">
            <Eye className="w-4 h-4 group-hover:scale-110" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group" title="EDIT SYSTEM">
            <Edit className="w-4 h-4 group-hover:rotate-12" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all group" title="PURGE DATA">
            <Trash className="w-4 h-4 group-hover:-translate-y-0.5" />
          </Button>
        </div>
      )
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
      <PageHeader
        title="Asset Archive"
        subtitle={`System managing ${videos.length} broadcast-ready HLS streams.`}
        action={
          <Button onClick={openNew} className="rounded-xl shadow-lg shadow-primary/20 font-bold text-xs px-6 py-6 border-none bg-primary hover:scale-[1.02] transition-transform">
            <UploadCloud className="w-5 h-5 mr-3" />
            Initialize Uplink
          </Button>
        }
      />

      <Card className="rounded-[2rem] overflow-hidden border-border/40 shadow-xl bg-card/60">
        <CardContent className="p-0">
          <DataTable data={videos} columns={columns} searchPlaceholder="Search archive by identifier..." searchKey="title" />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} title={editItem ? 'Configuration: Update Asset' : 'Registry: New Content Uplink'} onClose={() => setModalOpen(false)} size="md">
        <div className="space-y-6 pt-4">
          <Input label="Strategic Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter content identifier..." />
          <Textarea label="Executive Summary" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of segments..." />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Registry Duration" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45:30" />
            <Select label="Curriculum Parent" value={form.courseId} onChange={(val) => setForm(f => ({ ...f, courseId: val }))}
              options={courses.map((c) => ({ value: c.id, label: c.title }))} placeholder="Assign node..." />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="video-thumb">Visualization (Thumbnail)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 border border-dashed border-border rounded-2xl group hover:border-primary/50 transition-colors relative">
                <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-background shadow-inner border border-border/50">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <Video className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" id="video-thumb" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setThumbnailFile(file)
                      setThumbnailPreview(URL.createObjectURL(file))
                      setForm(f => ({ ...f, thumbnail: '' }))
                    }
                  }} className="sr-only" />
                  <label htmlFor="video-thumb" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer">Select File</label>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Input label="Or External Image URL" value={(form as any).thumbnail} onChange={(e) => {
                  setForm(f => ({ ...f, thumbnail: e.target.value }))
                  setThumbnailFile(null)
                  setThumbnailPreview(e.target.value)
                }} placeholder="https://..." className="h-10" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground ml-1">Segment Binary (Video)</label>
            <div className="p-6 bg-muted/30 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-8 h-8 text-muted-foreground/30" />
              <label className="cursor-pointer">
                <input type="file" accept="video/*" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setVideoFile(file)
                }} className="hidden" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-4 py-2 rounded-xl hover:opacity-80 transition-all">Choose HLS Source</span>
              </label>
              {videoFile ? (
                <p className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Ready: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
              ) : (
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">No source segment linked.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl px-6 font-bold text-xs">DISCARD</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest">
              {editItem ? 'UPDATE CONFIG' : 'INITIALIZE ASSET'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="DANGER: DESTRUCTIVE PURGE"
        message="This operation will permanently erase the video binary and all related telemetry from the platform ecosystem. Recovery is not possible within current protocols."
        confirmLabel="EXECUTE PURGE"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />

      {/* View Video Modal */}
      <Modal isOpen={!!viewVideo} title={viewVideo?.title || 'Signal Monitor'} onClose={() => setViewVideo(null)} size="lg">
        <div className="space-y-6 pt-2">
          <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/5 group">
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
                  <Badge variant="outline" className="text-[9px] font-extrabold bg-primary/5 border-primary/20 text-primary uppercase tracking-widest">
                    {viewVideo?.courseTitle}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {viewVideo?.duration}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] tracking-widest uppercase h-9">
                <Layout className="w-3.5 h-3.5 mr-2" />
                Course Node
              </Button>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed p-4 bg-muted/30 rounded-2xl border border-border/50">
              {viewVideo?.description}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
