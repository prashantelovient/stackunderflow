import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    Users, Mail, BookOpen, Calendar,
    ShieldCheck, ShieldAlert, Search,
    ExternalLink, GraduationCap
} from 'lucide-react'

import { instructorService } from '../services/instructorService'
import { DataTable } from '@/admin/components/DataTable'
import {
    PageHeader, Badge, Spinner, Card,
    CardContent, Button
} from '@/admin/components/ui'
import { formatDate } from '@/utils'

interface Student {
    id: string
    name: string
    email: string
    instructorCourses: string[]
    enrollmentCount: number
    status: string
    createdAt: string
}

export default function InstructorStudentsPage() {
    const { data: students = [], isLoading } = useQuery<Student[]>({
        queryKey: ['instructor-students'],
        queryFn: instructorService.getStudents
    })

    const columns = useMemo<ColumnDef<Student>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Student Profile',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 shadow-inner">
                        {row.original.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm tracking-tight">{row.original.name}</span>
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {row.original.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'instructorCourses',
            header: 'Enrolled My Courses',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                    {row.original.instructorCourses.map((course, idx) => (
                        <Badge key={idx} variant="outline" className="text-[9px] font-extrabold bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest">
                            {course}
                        </Badge>
                    ))}
                    {row.original.instructorCourses.length === 0 && (
                        <span className="text-slate-600 text-[10px] font-bold uppercase italic">No Active Enrollments</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'enrollmentCount',
            header: 'Enrollments',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-black font-mono text-indigo-400">
                        {row.original.enrollmentCount}
                    </div>
                    <GraduationCap className="w-4 h-4 text-slate-600" />
                </div>
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Registration Date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(row.original.createdAt)}
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Account Status',
            cell: ({ row }) => (
                <Badge className={row.original.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                    {row.original.status === 'active' ? (
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                        </span>
                    )}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
                    <ExternalLink className="w-4 h-4" />
                </Button>
            )
        }
    ], [])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spinner />
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] animate-pulse font-mono">Retrieving Student Registry...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Community</h1>
                    <p className="text-muted-foreground mt-1">Registry of learners currently enrolled in your curriculum.</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-2xl border border-border/50">
                    <Button variant="ghost" className="rounded-xl px-4 font-bold text-xs text-indigo-400 bg-indigo-400/10">ALL STUDENTS</Button>
                    <Button variant="ghost" className="rounded-xl px-4 font-bold text-xs text-muted-foreground">ENROLLED</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-border/80 rounded-[2rem]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Learners</p>
                            <p className="text-2xl font-black text-foreground">{students.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-border/80 rounded-[2rem]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Enrollments</p>
                            <p className="text-2xl font-black text-foreground">
                                {students.length > 0
                                    ? (students.reduce((acc, s) => acc + s.enrollmentCount, 0) / students.length).toFixed(1)
                                    : '0.0'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-border/80 rounded-[2rem]">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Course Reach</p>
                            <p className="text-2xl font-black text-foreground">
                                {new Set(students.flatMap(s => s.instructorCourses)).size}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[2.5rem] overflow-hidden border-border/80 shadow-2xl bg-card/40 backdrop-blur-md">
                <CardContent className="p-0">
                    <DataTable
                        data={students}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search learner registry..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}
