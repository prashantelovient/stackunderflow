import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    User,
    BookOpen,
    Filter,
    ShieldCheck,
    AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { instructorService } from '@/instructor/services/instructorService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast, ToastContainer } from '@/admin/components/Toast'
import { cn } from '@/utils'
import { format } from 'date-fns'

interface Enrollment {
    _id: string
    studentId: {
        _id: string
        name: string
        email: string
    }
    courseId: {
        _id: string
        title: string
        thumbnail: string | null
    }
    status: 'pending' | 'approved' | 'rejected'
    requestDate: string
    createdAt: string
}

export default function InstructorEnrollmentsPage() {
    const qc = useQueryClient()
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

    const { data: enrollments = [], isLoading } = useQuery<Enrollment[]>({
        queryKey: ['instructor-enrollments'],
        queryFn: instructorService.getEnrollments
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
            instructorService.updateEnrollmentStatus(id, status),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['instructor-enrollments'] })
            qc.invalidateQueries({ queryKey: ['instructor-students'] })
            toast.success(`Enrollment ${variables.status === 'approved' ? 'Approved' : 'Rejected'} successfully.`)
        },
        onError: () => toast.error('Failed to update enrollment status.')
    })

    const filtered = enrollments.filter(e => {
        const studentName = e.studentId?.name || 'Unknown Student'
        const courseTitle = e.courseId?.title || 'Unknown Course'
        const matchesSearch =
            studentName.toLowerCase().includes(search.toLowerCase()) ||
            courseTitle.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const stats = {
        pending: enrollments.filter(e => e.status === 'pending').length,
        approved: enrollments.filter(e => e.status === 'approved').length,
        total: enrollments.length
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                        Enrollment Requests
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage student access to your dynamic course material.</p>
                </div>

                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl border border-border/50 backdrop-blur-md">
                    <div className="px-4 py-2 text-center border-r border-border">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</p>
                        <p className="text-xl font-black text-amber-500">{stats.pending}</p>
                    </div>
                    <div className="px-4 py-2 text-center min-w-[100px]">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lifetime Approvals</p>
                        <p className="text-xl font-black text-indigo-500">{stats.approved}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filter by student name or course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-muted/50 border-border text-foreground h-11 rounded-xl focus:ring-indigo-500/20"
                    />
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                        <Button
                            key={s}
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilterStatus(s)}
                            className={cn(
                                "capitalize rounded-lg px-4 font-bold text-xs tracking-wider",
                                filterStatus === s ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="border border-border/50 rounded-2xl bg-card/30 overflow-hidden backdrop-blur-xl shadow-2xl">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4">Student</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4">Requested Course</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4">Date Requested</TableHead>
                            <TableHead className="text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-slate-800/50">
                                    <TableCell colSpan={5} className="h-20 bg-slate-800/10"></TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <ShieldCheck className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-500 font-bold">No enrollment requests found matching your filters.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((e) => (
                                <TableRow key={e._id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-9 h-9 border border-border">
                                                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                                    {e.studentId?.name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-black text-foreground group-hover:text-indigo-400 transition-colors">
                                                    {e.studentId?.name || 'Deleted student'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-mono">
                                                    {e.studentId?.email || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <BookOpen className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <p className="text-sm font-bold text-foreground line-clamp-1">
                                                {e.courseId?.title || 'Deleted Course'}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold font-mono">
                                                {format(new Date(e.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={e.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {e.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    onClick={() => statusMutation.mutate({ id: e._id, status: 'approved' })}
                                                    disabled={statusMutation.isPending}
                                                    size="sm"
                                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/20"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => statusMutation.mutate({ id: e._id, status: 'rejected' })}
                                                    disabled={statusMutation.isPending}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                                                >
                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                                                Action Completed
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ToastContainer />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'pending':
            return (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[10px] uppercase tracking-[0.1em] px-2.5 py-1">
                    <Clock className="w-3 h-3 mr-1.5 animate-pulse" />
                    Pending
                </Badge>
            )
        case 'approved':
            return (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[10px] uppercase tracking-[0.1em] px-2.5 py-1">
                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    Approved
                </Badge>
            )
        case 'rejected':
            return (
                <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-black text-[10px] uppercase tracking-[0.1em] px-2.5 py-1">
                    <XCircle className="w-3 h-3 mr-1.5" />
                    Rejected
                </Badge>
            )
        default:
            return null
    }
}
