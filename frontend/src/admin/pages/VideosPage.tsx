import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Video, Play } from 'lucide-react'
import { videoService, playlistService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import VideoPlayer from '@/admin/components/VideoPlayer'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate } from '@/utils'

interface VideoItem { id: string; title: string; description: string; thumbnail: null; playlistId: string; playlistTitle: string; duration: string; uploadDate: string }
interface Playlist { id: string; title: string }

const emptyForm = { title: '', description: '', duration: '', playlistId: '' }

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
  const { data: playlists = [] } = useQuery<Playlist[]>({ queryKey: ['playlists'], queryFn: playlistService.getAll })

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
    setForm({ title: v.title, description: v.description, duration: v.duration, playlistId: v.playlistId }); 
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbnailPreview(null);
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile)
      if (videoFile) fd.append('video', videoFile)
      return editItem ? videoService.update(editItem.id, fd) : videoService.create(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['videos'] }); toast.success(editItem ? 'Video updated!' : 'Video added!'); setModalOpen(false) },
    onError: () => toast.error('Failed to save video.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => videoService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['videos'] }); toast.success('Video deleted.'); setDeleteId(null) },
  })

  const columns = useMemo<ColumnDef<VideoItem, unknown>[]>(() => [
    {
      id: 'thumb', header: 'Thumbnail',
      cell: () => (
        <div className="w-16 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-md flex items-center justify-center">
          <Video className="w-4 h-4 text-gray-400" />
        </div>
      )
    },
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">{row.original.title}</span> },
    { accessorKey: 'playlistTitle', header: 'Playlist', cell: ({ row }) => <Badge variant="info">{row.original.playlistTitle}</Badge> },
    { accessorKey: 'duration', header: 'Duration', cell: ({ row }) => <span className="font-mono text-sm">{row.original.duration}</span> },
    { accessorKey: 'uploadDate', header: 'Upload Date', cell: ({ row }) => formatDate(row.original.uploadDate) },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewVideo(row.original)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="View"><Play className="w-4 h-4" /></button>
          <button onClick={() => openEdit(row.original)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ], [playlists])

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div>
      <ToastContainer />
      <PageHeader title="Videos" subtitle={`${videos.length} videos`} action={<Button onClick={openNew}><Plus className="w-4 h-4" /> Add Video</Button>} />
      <Card>
        <CardContent className="pt-4">
          <DataTable data={videos} columns={columns} searchPlaceholder="Search videos..." searchKey="title" />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} title={editItem ? 'Edit Video' : 'Add Video'} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Video title" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Video description" />
          <Input label="Duration" value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45:30" />
          <Select label="Assign to Playlist" value={form.playlistId} onChange={(e) => setForm(f => ({ ...f, playlistId: e.target.value }))}
            options={playlists.map((p) => ({ value: p.id, label: p.title }))} placeholder="Select playlist" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
            <div className="flex items-center gap-4">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-16 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
              ) : (
                <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <Video className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setThumbnailFile(file)
                  setThumbnailPreview(URL.createObjectURL(file))
                }
              }} className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Video File</label>
            <input type="file" accept="video/*" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setVideoFile(file)
              }
            }} className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer" />
            {videoFile && <p className="text-xs text-green-600 dark:text-green-400">{videoFile.name} ({(videoFile.size / (1024*1024)).toFixed(2)} MB)</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editItem ? 'Update' : 'Add Video'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Video" message="This will permanently delete the video and all associated data."
        loading={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(deleteId!)} onCancel={() => setDeleteId(null)} />

      {/* View Video Modal */}
      <Modal isOpen={!!viewVideo} title={viewVideo?.title || 'View Video'} onClose={() => setViewVideo(null)} size="lg">
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden">
             {viewVideo ? (
               <VideoPlayer 
                 options={{
                   autoplay: true,
                   controls: true,
                   sources: [{
                     src: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stream/${viewVideo.id}?token=${localStorage.getItem('token')}`,
                     type: 'application/x-mpegURL'
                   }]
                 }} 
               />
             ) : (
               <div className="text-white">Loading...</div>
             )}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{viewVideo?.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{viewVideo?.description}</p>
          </div>
          <div className="flex gap-2 text-sm text-gray-500 mt-2">
             <Badge variant="info">{viewVideo?.playlistTitle}</Badge>
             <span className="flex items-center gap-1 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"><Video className="w-3 h-3"/> {viewVideo?.duration}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

