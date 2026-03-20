import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Trash2, Ban, CheckCircle, UserPlus,
  ShieldCheck, ShieldAlert, MoreHorizontal
} from 'lucide-react'

import { studentService } from '@/admin/services'
import { DataTable } from '@/admin/components/DataTable'
import {
  PageHeader, Badge, Spinner, Card,
  CardContent, Button
} from '@/admin/components/ui'
import { ConfirmModal } from '@/admin/components/Modals'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { formatDate } from '@/utils'

// ✅ FIXED IMPORT PATH
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Student {
  id: string
  name: string
  email: string
  enrolledCourse: string
  joinDate: string
  status: string
}

export default function StudentsPage() {
  const qc = useQueryClient()

  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'suspend' | 'activate'
    id: string
  } | null>(null)

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: studentService.getAll
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student deleted')
      setConfirmModal(null)
    },
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => studentService.suspend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student suspended')
      setConfirmModal(null)
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => studentService.activate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Student activated')
      setConfirmModal(null)
    },
  })

  const openConfirm = useCallback((type: 'delete' | 'suspend' | 'activate', id: string) => {
    // Small delay to ensure menu closes properly before modal opens
    setTimeout(() => {
      setConfirmModal({ type, id })
    }, 10)
  }, [])

  // ✅ FIXED useMemo deps
  const columns = useMemo<ColumnDef<Student>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {row.original.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.email}
        </span>
      )
    },
    {
      accessorKey: 'enrolledCourse',
      header: 'Course',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.enrolledCourse}
        </Badge>
      )
    },
    {
      accessorKey: 'joinDate',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.joinDate)}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'warning'}>
          {row.original.status === 'active' ? (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Suspended
            </span>
          )}
        </Badge>
      )
    },

    // ✅ FIXED ACTION COLUMN
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const student = row.original
        if (!student?.id) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {student.status === 'active' ? (
                  <DropdownMenuItem
                    onSelect={() => openConfirm('suspend', student.id)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => openConfirm('activate', student.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => openConfirm('delete', student.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ], [openConfirm])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    )
  }

  const handleConfirm = () => {
    if (!confirmModal) return

    if (confirmModal.type === 'delete') {
      deleteMutation.mutate(confirmModal.id)
    } else if (confirmModal.type === 'suspend') {
      suspendMutation.mutate(confirmModal.id)
    } else {
      activateMutation.mutate(confirmModal.id)
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      <PageHeader
        title="Students"
        subtitle={`${students.length} students`}
        action={
          <Button onClick={() => toast.info('Initialization Protocol: Pending implementation')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={students}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search students..."
          />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={!!confirmModal}
        title="Confirm Action"
        message="Are you sure?"
        confirmLabel="Yes"
        loading={
          deleteMutation.isPending ||
          suspendMutation.isPending ||
          activateMutation.isPending
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  )
}