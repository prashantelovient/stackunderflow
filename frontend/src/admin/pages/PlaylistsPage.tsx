import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, GripVertical, ListVideo } from 'lucide-react'
import { playlistService, videoService } from '@/admin/services'
import { PageHeader, Badge, Spinner, Card, CardContent, CardHeader, Button, Input, Textarea } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Playlist { id: string; title: string; description: string; thumbnail: null; category: string; videoCount: number }
interface VideoItem { id: string; title: string; playlistId: string; duration: string }

const emptyForm = { title: '', description: '', category: '' }

function SortableVideoItem({ video }: { video: VideoItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-8 h-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded flex items-center justify-center flex-shrink-0">
        <ListVideo className="w-3 h-3 text-gray-400" />
      </div>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{video.title}</span>
      <span className="text-xs font-mono text-gray-400">{video.duration}</span>
    </div>
  )
}

export default function PlaylistsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [videosModal, setVideosModal] = useState<Playlist | null>(null)
  const [editItem, setEditItem] = useState<Playlist | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [playlistVideos, setPlaylistVideos] = useState<VideoItem[]>([])

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({ queryKey: ['playlists'], queryFn: playlistService.getAll })
  const { data: allVideos = [] } = useQuery<VideoItem[]>({ queryKey: ['videos'], queryFn: videoService.getAll })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const openNew = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (p: Playlist) => { setEditItem(p); setForm({ title: p.title, description: p.description, category: p.category }); setModalOpen(true) }
  const openVideos = (p: Playlist) => {
    setVideosModal(p)
    setPlaylistVideos(allVideos.filter(v => v.playlistId === p.id))
  }

  const saveMutation = useMutation({
    mutationFn: () => editItem ? playlistService.update(editItem.id, form) : playlistService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlists'] }); toast.success(editItem ? 'Playlist updated!' : 'Playlist created!'); setModalOpen(false) },
    onError: () => toast.error('Failed to save playlist.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => playlistService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlists'] }); toast.success('Playlist deleted.'); setDeleteId(null) },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPlaylistVideos((items) => {
        const from = items.findIndex(i => i.id === active.id)
        const to = items.findIndex(i => i.id === over.id)
        return arrayMove(items, from, to)
      })
      toast.info('Video order updated.')
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div>
      <ToastContainer />
      <PageHeader title="Playlists" subtitle={`${playlists.length} playlists`} action={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Playlist</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {playlists.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <div className="h-36 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-t-xl flex items-center justify-center">
              <ListVideo className="w-10 h-10 text-white opacity-70" />
            </div>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                <Badge variant="info">{p.videoCount} videos</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 line-clamp-2">{p.description}</p>
              <Badge variant="default" className="mb-4">{p.category}</Badge>
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" onClick={() => openVideos(p)} className="flex-1">Manage Videos</Button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} title={editItem ? 'Edit Playlist' : 'New Playlist'} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <Input label="Playlist Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. React Mastery" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the playlist..." />
          <Input label="Category" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Web Development" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
            <input type="file" accept="image/*" className="text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* Videos Order Modal */}
      <Modal isOpen={!!videosModal} title={`Videos in "${videosModal?.title}"`} onClose={() => setVideosModal(null)} size="lg">
        <div className="space-y-2">
          {playlistVideos.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No videos in this playlist.</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Drag to reorder videos</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={playlistVideos.map(v => v.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {playlistVideos.map((v) => <SortableVideoItem key={v.id} video={v} />)}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="flex justify-end pt-4">
                <Button onClick={() => { toast.success('Order saved!'); setVideosModal(null) }}>Save Order</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Playlist" message="This will permanently delete the playlist and all its settings."
        loading={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(deleteId!)} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

