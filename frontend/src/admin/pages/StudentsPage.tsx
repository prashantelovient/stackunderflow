import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Trash2, Ban, CheckCircle } from 'lucide-react'
import { studentService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Badge, Spinner, Card, CardContent } from '@/admin/components/ui'
import { ConfirmModal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate } from '@/utils'

interface Student {
  id: string; name: string; email: string; enrolledPlaylist: string; joinDate: string; status: string
}

export default function StudentsPage() {
  const qc = useQueryClient()
  const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'suspend' | 'activate'; id: string } | null>(null)

  const { data: students = [], isLoading } = useQuery<Student[]>({ queryKey: ['students'], queryFn: studentService.getAll })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deleted.'); setConfirmModal(null) },
    onError: () => toast.error('Failed to delete student.'),
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => studentService.suspend(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student suspended.'); setConfirmModal(null) },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => studentService.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student activated.'); setConfirmModal(null) },
  })

  const columns = useMemo<ColumnDef<Student, unknown>[]>(() => [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className="font-medium text-gray-900 dark:text-white">{row.original.name}</div> },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <span className="text-gray-600 dark:text-gray-400">{row.original.email}</span> },
    { accessorKey: 'enrolledPlaylist', header: 'Enrolled Playlist' },
    { accessorKey: 'joinDate', header: 'Join Date', cell: ({ row }) => formatDate(row.original.joinDate) },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'success' : 'warning'}>{row.original.status}</Badge>
    },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === 'active' ? (
            <button onClick={() => setConfirmModal({ type: 'suspend', id: row.original.id })}
              className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors" title="Suspend">
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setConfirmModal({ type: 'activate', id: row.original.id })}
              className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Activate">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setConfirmModal({ type: 'delete', id: row.original.id })}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ], [])

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const handleConfirm = () => {
    if (!confirmModal) return
    if (confirmModal.type === 'delete') deleteMutation.mutate(confirmModal.id)
    else if (confirmModal.type === 'suspend') suspendMutation.mutate(confirmModal.id)
    else activateMutation.mutate(confirmModal.id)
  }

  return (
    <div>
      <ToastContainer />
      <PageHeader title="Students" subtitle={`${students.length} total students`} />
      <Card>
        <CardContent className="pt-4">
          <DataTable data={students} columns={columns} searchPlaceholder="Search students..." searchKey="name" />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.type === 'delete' ? 'Delete Student' : confirmModal?.type === 'suspend' ? 'Suspend Student' : 'Activate Student'}
        message={confirmModal?.type === 'delete' ? 'This will permanently delete the student account.' : confirmModal?.type === 'suspend' ? 'This will suspend the student\'s access.' : 'This will restore the student\'s access.'}
        confirmLabel={confirmModal?.type === 'delete' ? 'Delete' : confirmModal?.type === 'suspend' ? 'Suspend' : 'Activate'}
        variant={confirmModal?.type === 'delete' || confirmModal?.type === 'suspend' ? 'danger' : 'primary'}
        loading={deleteMutation.isPending || suspendMutation.isPending || activateMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  )
}

