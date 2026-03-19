import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { blogService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Badge, Spinner, Card, CardContent, Button, Input, Textarea, Select } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate, generateSlug } from '@/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Blog { id: string; title: string; slug: string; thumbnail: null; content: string; publishDate: string; status: string }

const emptyForm = { title: '', slug: '', content: '', publishDate: '', status: 'draft' }

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-40 max-h-64 overflow-y-auto px-3 py-2 text-sm text-gray-900 dark:text-white outline-none prose dark:prose-invert max-w-none'
      }
    }
  })

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-wrap">
        {[
          { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
          { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
          { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
          { label: 'UL', action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
          { label: 'OL', action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
          { label: '< >', action: () => editor?.chain().focus().toggleCode().run(), active: editor?.isActive('code') },
        ].map(({ label, action, active }) => (
          <button key={label} type="button" onClick={action}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
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

  const { data: blogs = [], isLoading } = useQuery<Blog[]>({ queryKey: ['blogs'], queryFn: blogService.getAll })

  const openNew = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (b: Blog) => { setEditItem(b); setForm({ title: b.title, slug: b.slug, content: b.content, publishDate: b.publishDate, status: b.status }); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: () => editItem ? blogService.update(editItem.id, form) : blogService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); toast.success(editItem ? 'Blog updated!' : 'Blog created!'); setModalOpen(false) },
    onError: () => toast.error('Failed to save blog.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Blog deleted.'); setDeleteId(null) },
  })

  const columns = useMemo<ColumnDef<Blog, unknown>[]>(() => [
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">{row.original.title}</span> },
    { accessorKey: 'slug', header: 'Slug', cell: ({ row }) => <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{row.original.slug}</code> },
    { accessorKey: 'publishDate', header: 'Publish Date', cell: ({ row }) => formatDate(row.original.publishDate) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'published' ? 'success' : 'warning'}>{row.original.status}</Badge> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row.original)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ], [])

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div>
      <ToastContainer />
      <PageHeader title="Blogs" subtitle={`${blogs.length} posts`} action={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Blog</Button>} />
      <Card>
        <CardContent className="pt-4">
          <DataTable data={blogs} columns={columns} searchPlaceholder="Search blogs..." searchKey="title" />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} title={editItem ? 'Edit Blog' : 'New Blog'} onClose={() => setModalOpen(false)} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value, slug: editItem ? f.slug : generateSlug(e.target.value) }))}
            placeholder="Blog title" />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated-slug" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
            <input type="file" accept="image/*" className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
            <RichEditor value={form.content} onChange={(v) => setForm(f => ({ ...f, content: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Publish Date" type="date" value={form.publishDate} onChange={(e) => setForm(f => ({ ...f, publishDate: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={(val) => setForm(f => ({ ...f, status: val }))}
              options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editItem ? 'Update' : 'Publish'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Blog" message="This will permanently delete the blog post."
        loading={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(deleteId!)} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

