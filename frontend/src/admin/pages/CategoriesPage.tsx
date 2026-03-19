import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Tag, Edit, Trash, Boxes, Database } from 'lucide-react'
import { categoryService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Spinner, Card, CardContent, Button, Input, Badge } from '@/admin/components/ui'
import { ConfirmModal, Modal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { generateSlug, cn } from '@/utils'

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(editItem ? 'Sector node recalibrated.' : 'New sector initialized.'); setModalOpen(false) },
    onError: () => toast.error('Security Protocol Failure: Deployment rejected.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id) as any,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Sector record purged from registry.'); setDeleteId(null) },
  })

  const columns = useMemo<ColumnDef<Category, unknown>[]>(() => [
    {
      accessorKey: 'name', header: 'SECTOR NAME',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-foreground tracking-tight">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'slug',
      header: 'ACCESS IDENTIFIER',
      cell: ({ row }) => <code className="text-[10px] font-black bg-muted/80 text-primary px-2 py-1 rounded-md border border-border/30 tracking-tight">{row.original.slug}</code>
    },
    {
      accessorKey: 'videoCount',
      header: 'ASSET COUNT',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-black text-[10px] px-2 py-0.5 bg-muted border-none">
            {row.original.videoCount} ASSETS
          </Badge>
        </div>
      )
    },
    {
      id: 'actions', header: 'OPERATIONS',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all">
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    },
  ], [])

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Synchronizing Sector Registry...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ToastContainer />
      <PageHeader
        title="Sector Registry"
        subtitle={`${categories.length} curriculum sectors currently indexed in core database.`}
        action={
          <Button onClick={openNew} className="rounded-xl shadow-lg shadow-primary/20 font-bold text-xs px-6 py-6 border-none bg-primary hover:scale-[1.02] transition-transform">
            <Plus className="w-5 h-5 mr-3" /> Initialize Sector
          </Button>
        }
      />

      <Card className="rounded-[2.5rem] border-border/40 shadow-2xl bg-card/60 backdrop-blur-sm overflow-visible">
        <CardContent className="p-8">
          <DataTable data={categories} columns={columns} searchPlaceholder="Search sector records..." searchKey="name" />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} title={editItem ? 'Recalibrate Sector Node' : 'Register New Sector'} onClose={() => setModalOpen(false)} size="sm">
        <div className="space-y-6 pt-4">
          <Input label="Strategic Name" value={formName}
            onChange={(e) => { setFormName(e.target.value); if (!editItem) setFormSlug(generateSlug(e.target.value)) }}
            placeholder="e.g. CYBERNETIC ADVANCEMENT" />
          <Input label="Access Identifier (Slug)" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="cyber-advancement" />
          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest">ABORT</Button>
            <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest">
              {editItem ? 'UPDATE NODE' : 'DEPLOY NODE'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="DANGER: SECTOR PURGE"
        message="System confirm required: Are you certain you wish to permanently erase this sector node from the registry? Dependent assets will remain cached but unindexed."
        confirmLabel="EXECUTE PURGE"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

