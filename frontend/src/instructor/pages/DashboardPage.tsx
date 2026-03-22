import React from 'react'
import { 
    Users, 
    BookOpen, 
    Plus, 
    ChevronRight,
    TrendingUp,
    Star,
    ArrowUpRight,
    LayoutDashboard,
    Zap
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { instructorService } from '../services/instructorService'
import { useAuthStore } from '@/auth/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function InstructorDashboard() {
    const { user } = useAuthStore()
    
    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
        queryKey: ['instructor-analytics'],
        queryFn: instructorService.getAnalytics,
    })

    const { data: revenue, isLoading: isLoadingRevenue } = useQuery({
        queryKey: ['instructor-revenue'],
        queryFn: instructorService.getRevenue,
    })

    const isLoading = isLoadingAnalytics || isLoadingRevenue

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-background">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
            </div>
        )
    }

    const topCourses = (analytics?.topCourses || []).map((c: any) => {
        const revData = revenue?.courseWiseRevenue?.find((r: any) => r.courseId === c.id.toString());
        return {
            id: c.id,
            title: c.name,
            sales: revData ? revData.sales : 0,
            rating: c.rating || '4.8',
            thumbnail: c.thumbnail
        };
    }).slice(0, 4);

    return (
        <div className="min-h-full rounded-[2.5rem] border border-border bg-background p-8 lg:p-12 space-y-12">

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Instructor Active
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-black text-foreground">
                        Welcome {user?.name}
                    </h1>

                    <p className="text-muted-foreground text-lg max-w-lg">
                        Manage your courses and track your growth easily.
                    </p>
                </div>

                <Link to="/instructor/courses">
                    <Button className="h-16 px-10 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-md transition-all active:scale-95 group bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                        Create Course
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">

                <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
                    <div className="space-y-4">
                        <Users className="w-7 h-7 text-indigo-500" />
                        <p className="text-xs font-bold text-muted-foreground uppercase">
                            Total Students
                        </p>
                        <h3 className="text-4xl font-black text-foreground">
                            {analytics?.totalStudents || 0}
                        </h3>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm">
                    <div className="space-y-4">
                        <BookOpen className="w-7 h-7 text-emerald-500" />
                        <p className="text-xs font-bold text-muted-foreground uppercase">
                            Total Courses
                        </p>
                        <h3 className="text-4xl font-black text-foreground">
                            {analytics?.totalCourses || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Courses */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        Your Courses
                    </h2>

                    <Link to="/instructor/courses" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {topCourses.map((course: any) => (
                        <Link key={course.id} to={`/instructor/courses`}>
                            <div className="p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all">

                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-foreground">
                                            {course.title}
                                        </h4>

                                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {course.sales}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500" />
                                                {course.rating}
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Card */}
            <div className="p-8 rounded-[2rem] bg-primary/10 border border-border flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-foreground">
                        Improve Your Courses 🚀
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Add more content to boost engagement
                    </p>
                </div>

                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade
                </Button>
            </div>

        </div>
    )
}