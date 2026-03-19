import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { categoryService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Spinner, Card, CardContent, Button, Input } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { generateSlug } from '@/utils'

interface Category { id: string; name: string; slug: string; videoCount: number }

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')

  const { data: categories = [], isLoading } = useQuery<Category[]>({ queryKey: ['categories'], queryFn: categoryService.getAll })

  const openNew = () => { setEditItem(null); setFormName(''); setFormSlug(''); setModalOpen(true) }
  const openEdit = (c: Category) => { setEditItem(c); setFormName(c.name); setFormSlug(c.slug); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { name: formName, slug: formSlug }
      return editItem ? categoryService.update(editItem.id, data) : categoryService.create(data)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(editItem ? 'Category updated!' : 'Category created!'); setModalOpen(false) },
    onError: () => toast.error('Failed to save category.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted.'); setDeleteId(null) },
  })

  const columns = useMemo<ColumnDef<Category, unknown>[]>(() => [
    {
      accessorKey: 'name', header: 'Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{row.original.name}</span>
        </div>
      )
    },
    { accessorKey: 'slug', header: 'Slug', cell: ({ row }) => <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{row.original.slug}</code> },
    { accessorKey: 'videoCount', header: 'Videos', cell: ({ row }) => <span className="font-medium">{row.original.videoCount}</span> },
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
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} action={<Button onClick={openNew}><Plus className="w-4 h-4" /> New Category</Button>} />
      <Card>
        <CardContent className="pt-4">
          <DataTable data={categories} columns={columns} searchPlaceholder="Search categories..." searchKey="name" />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} title={editItem ? 'Edit Category' : 'New Category'} onClose={() => setModalOpen(false)} size="sm">
        <div className="space-y-4">
          <Input label="Category Name" value={formName}
            onChange={(e) => { setFormName(e.target.value); if (!editItem) setFormSlug(generateSlug(e.target.value)) }}
            placeholder="e.g. Web Development" />
          <Input label="Slug" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="web-development" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} title="Delete Category" message="This will permanently delete the category. Videos in this category won't be deleted."
        loading={deleteMutation.isPending} onConfirm={() => deleteMutation.mutate(deleteId!)} onCancel={() => setDeleteId(null)} />
    </div>
  )
}

