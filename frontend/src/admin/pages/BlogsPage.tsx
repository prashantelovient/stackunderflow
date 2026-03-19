import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, FileText, Send, Save, X, Image as ImageIcon, Calendar, Info, Edit, Trash, Bold, Italic, Heading2, List, ListOrdered, Code, Terminal, Zap, ShieldAlert, Newspaper } from 'lucide-react'
import { blogService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate, generateSlug, cn } from '@/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Blog { id: string; title: string; slug: string; thumbnail: string | null; content: string; publishDate: string; status: string }

const emptyForm = { title: '', slug: '', content: '', publishDate: '', status: 'draft', thumbnail: '' }

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
  return `${baseUrl}${path}`
}

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[250px] max-h-[400px] overflow-y-auto px-4 py-4 text-sm text-foreground outline-none prose dark:prose-invert max-w-none'
      }
    }
  })

  const toolbarItems = [
    { label: <Bold className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
    { label: <Italic className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
    { label: <Heading2 className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
    { label: <List className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
    { label: <ListOrdered className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
    { label: <Code className="w-3.5 h-3.5" />, action: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive('code') },
  ]

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Content Editor</label>
      <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
        {/* Toolbar */}
        <div className="flex gap-1.5 p-3 border-b border-border/30 bg-muted/30 flex-wrap">
          {toolbarItems.map((item, idx) => (
            <button key={idx} type="button" onClick={item.action}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                item.active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
              )}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="bg-transparent">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default function BlogsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Blog | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const { data: blogs = [], isLoading } = useQuery<Blog[]>({ queryKey: ['blogs'], queryFn: blogService.getAll })

  const openNew = () => { setEditItem(null); setForm(emptyForm); setThumbnailFile(null); setThumbnailPreview(null); setModalOpen(true) }
  const openEdit = (b: Blog) => {
    setEditItem(b);
    setForm({ title: b.title, slug: b.slug, content: b.content, publishDate: b.publishDate, status: b.status, thumbnail: b.thumbnail || '' });
    setThumbnailFile(null);
    setThumbnailPreview(getThumbnailUrl(b.thumbnail));
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (thumbnailFile) {
        fd.append('thumbnail', thumbnailFile)
      } else if (form.thumbnail) {
        fd.append('thumbnail', form.thumbnail)
      }
      return editItem ? blogService.update(editItem.id, fd) : blogService.create(fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); toast.success(editItem ? 'Intel publication updated.' : 'New transmission broadcasted.'); setModalOpen(false) },
    onError: () => toast.error('Security Protocol: Publication rejected by core.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Data record purged from archive.'); setDeleteId(null) },
  })

  const columns = useMemo<ColumnDef<Blog, unknown>[]>(() => [
    {
      accessorKey: 'title',
      header: 'INTEL TITLE',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            <Newspaper className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-foreground tracking-tight">{row.original.title}</span>
        </div>
      )
    },
    {
      accessorKey: 'slug',
      header: 'ACCESS IDENTIFIER',
      cell: ({ row }) => <code className="text-[10px] font-black bg-muted/80 text-primary px-2 py-1 rounded-md border border-border/30 tracking-tight">{row.original.slug}</code>
    },
    {
      accessorKey: 'publishDate',
      header: 'BROADCAST TIMESTAMP',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs">
          <Calendar className="w-3 h-3" />
          {formatDate(row.original.publishDate)}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'PROTOCOL STATUS',
      cell: ({ row }) => {
        const isPublished = row.original.status === 'published'
        return (
          <Badge variant={isPublished ? 'success' : 'warning'} className="font-black text-[9px] px-2.5 py-1">
            {isPublished ? 'LIVE BROADCAST' : 'ENCRYPTED DRAFT'}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: 'OPERATIONS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all text-destructive/70">
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    },
  ], [])

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Synchronizing Data Streams...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ToastContainer />
      <PageHeader
        title="Intel Archive"
        subtitle={`${blogs.length} tactical publications indexed in core memory.`}
        action={
          <Button onClick={openNew} className="rounded-xl shadow-lg shadow-primary/20 font-bold text-xs px-6 py-6 border-none bg-primary hover:scale-[1.02] transition-transform">
            <Plus className="w-5 h-5 mr-3" /> New Publication
          </Button>
        }
      />

      <Card className="rounded-[2rem] border-border/40 shadow-2xl bg-card/60 backdrop-blur-sm overflow-visible">
        <CardContent className="p-8">
          <DataTable data={blogs} columns={columns} searchPlaceholder="Search intellectual records..." searchKey="title" />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} title={editItem ? 'Recalibrate Publication' : 'Initialize New Transmission'} onClose={() => setModalOpen(false)} size="lg">
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Strategic Title" value={form.title}
              onChange={(e) => setForm((f: typeof emptyForm) => ({ ...f, title: e.target.value, slug: editItem ? f.slug : generateSlug(e.target.value) }))}
              placeholder="Record title..." />
            <Input label="Access Slug (URL Identifier)" value={form.slug} onChange={(e) => setForm((f: typeof emptyForm) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated-id" />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="blog-thumb">Visualization (Cover Image)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-muted/20 border border-dashed border-border rounded-2xl group hover:border-primary/50 transition-colors relative">
                <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-background shadow-inner border border-border/50">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" id="blog-thumb" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setThumbnailFile(file)
                      setThumbnailPreview(URL.createObjectURL(file))
                      setForm(f => ({ ...f, thumbnail: '' }))
                    }
                  }} className="sr-only" />
                  <label htmlFor="blog-thumb" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer">Link digital asset</label>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Input label="Or External Image URL" value={form.thumbnail} onChange={(e) => {
                  setForm(f => ({ ...f, thumbnail: e.target.value }))
                  setThumbnailFile(null)
                  setThumbnailPreview(e.target.value)
                }} placeholder="https://..." className="h-10" />
              </div>
            </div>
          </div>

          <RichEditor value={form.content} onChange={(v) => setForm((f: typeof emptyForm) => ({ ...f, content: v }))} />

          <div className="grid grid-cols-2 gap-6">
            <Input label="Broadcast Timestamp" type="date" value={form.publishDate} onChange={(e) => setForm((f: typeof emptyForm) => ({ ...f, publishDate: e.target.value }))} />
            <Select label="Protocol Status" value={form.status} onChange={(val) => setForm((f: typeof emptyForm) => ({ ...f, status: val }))}
              options={[{ value: 'draft', label: 'ENCRYPTED DRAFT' }, { value: 'published', label: 'LIVE BROADCAST' }]} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest">ABORT</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest">
              {editItem ? 'AUTHORIZE UPDATE' : 'AUTHORIZE BROADCAST'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="DANGER: DATA PURGE"
        message="System confirm required: Are you certain you wish to permanently erase this tactical publication from the core archive? This operation is irreversible."
        confirmLabel="EXECUTE PURGE"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

