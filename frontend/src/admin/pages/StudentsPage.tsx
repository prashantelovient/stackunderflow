import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { Trash2, Ban, CheckCircle, UserPlus, ShieldCheck, ShieldAlert, MoreHorizontal } from 'lucide-react'
import { studentService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import { PageHeader, Badge, Spinner, Card, CardContent, Button } from '@/admin/components/ui'
import { ConfirmModal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Modals'
import { formatDate } from '@/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Student {
  id: string; name: string; email: string; enrolledCourse: string; joinDate: string; status: string
}

export default function StudentsPage() {
  const qc = useQueryClient()
  const [confirmModal, setConfirmModal] = useState<{ type: 'delete' | 'suspend' | 'activate'; id: string } | null>(null)

  const { data: students = [], isLoading } = useQuery<Student[]>({ queryKey: ['students'], queryFn: studentService.getAll })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student record purged.'); setConfirmModal(null) },
    onError: () => toast.error('Standard protocol failed: Unauthorized deletion.'),
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => studentService.suspend(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Access credentials suspended.'); setConfirmModal(null) },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => studentService.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Access credentials restored.'); setConfirmModal(null) },
  })

  const columns = useMemo<ColumnDef<Student, unknown>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Student Identity',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div className="font-bold text-foreground tracking-tight">{row.original.name}</div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Telemetry Endpoint',
      cell: ({ row }) => <span className="text-muted-foreground font-medium text-xs">{row.original.email}</span>
    },
    {
      accessorKey: 'enrolledCourse',
      header: 'Active Curriculum',
      cell: ({ row }) => <Badge variant="outline" className="text-[9px] font-extrabold border-primary/20 bg-primary/5 text-primary">{row.original.enrolledCourse}</Badge>
    },
    {
      accessorKey: 'joinDate',
      header: 'Initialization Date',
      cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground">{formatDate(row.original.joinDate)}</span>
    },
    {
      accessorKey: 'status',
      header: 'System Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'warning'}>
          {row.original.status === 'active' ? (
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> ACTIVE</span>
          ) : (
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> SUSPENDED</span>
          )}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Operations',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-muted">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border bg-card/95 backdrop-blur-md shadow-2xl">
            <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground px-3 py-2">Account Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {row.original.status === 'active' ? (
              <DropdownMenuItem
                onClick={() => setConfirmModal({ type: 'suspend', id: row.original.id })}
                className="text-amber-500 font-bold text-xs py-2.5 cursor-pointer focus:bg-amber-500/10 focus:text-amber-500"
              >
                <Ban className="w-4 h-4 mr-2" /> Suspend Access
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => setConfirmModal({ type: 'activate', id: row.original.id })}
                className="text-emerald-500 font-bold text-xs py-2.5 cursor-pointer focus:bg-emerald-500/10 focus:text-emerald-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Restore Access
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={() => setConfirmModal({ type: 'delete', id: row.original.id })}
              className="text-destructive font-bold text-xs py-2.5 cursor-pointer focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Purge Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ], [])

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner />
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Syncing Student Database...</p>
    </div>
  )

  const handleConfirm = () => {
    if (!confirmModal) return
    if (confirmModal.type === 'delete') deleteMutation.mutate(confirmModal.id)
    else if (confirmModal.type === 'suspend') suspendMutation.mutate(confirmModal.id)
    else activateMutation.mutate(confirmModal.id)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ToastContainer />
      <PageHeader
        title="Student Registry"
        subtitle={`System managing ${students.length} unified identities across platform nodes.`}
        action={
          <Button className="rounded-xl shadow-lg shadow-primary/20 font-bold text-xs px-6">
            <UserPlus className="w-4 h-4 mr-2" />
            Initialize Student
          </Button>
        }
      />
      <Card className="rounded-[2rem] overflow-hidden border-border/40 shadow-xl bg-card/60">
        <CardContent className="p-0">
          <DataTable data={students} columns={columns} searchPlaceholder="Locate student by handle..." searchKey="name" />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!confirmModal}
        title={confirmModal?.type === 'delete' ? 'DANGER: PURGE ASSET' : confirmModal?.type === 'suspend' ? 'SUSPEND CREDENTIALS' : 'RESTORE CREDENTIALS'}
        message={confirmModal?.type === 'delete' ? 'Are you absolutely sure? This will permanently erase the student identity and all related telemetry.' : confirmModal?.type === 'suspend' ? 'This will restrict all access to platform resources for this identity.' : 'This will restore standard operating permissions for this identity.'}
        confirmLabel={confirmModal?.type === 'delete' ? 'PROCEED TO PURGE' : confirmModal?.type === 'suspend' ? 'EXECUTE SUSPENSION' : 'REFASHION ACCESS'}
        variant={confirmModal?.type === 'delete' || confirmModal?.type === 'suspend' ? 'danger' : 'primary'}
        loading={deleteMutation.isPending || suspendMutation.isPending || activateMutation.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  )
}

