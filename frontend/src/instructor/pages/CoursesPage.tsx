import { LayoutDashboard, BookOpen, Search, Plus, MoreVertical, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, PenSquare, Trash2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const courses = [
    { id: 1, title: 'Next.js 14 For Beginners', students: 124, revenue: '$6,076', rating: 4.8, status: 'published', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop' },
    { id: 2, title: 'Advanced UI Design Patterns', students: 89, revenue: '$7,031', rating: 4.9, status: 'published', thumbnail: 'https://images.unsplash.com/photo-1541462608141-ad4d14b0b14c?w=400&h=250&fit=crop' },
    { id: 3, title: 'Framer Motion Masterclass', students: 56, revenue: '$5,544', rating: 5.0, status: 'draft', thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=250&fit=crop' },
    { id: 4, title: 'Modern Tailwind CSS Techniques', students: 210, revenue: '$4,100', rating: 4.7, status: 'published', thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop' },
    { id: 5, title: 'Serverless Functions in Node.js', students: 45, revenue: '$2,250', rating: 4.6, status: 'published', thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop' },
    { id: 6, title: 'Fullstack Authentication Guide', students: 0, revenue: '$0', rating: 0, status: 'pending', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop' },
]

export default function InstructorCoursesPage() {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Manage Courses</h1>
                    <p className="text-slate-400 mt-1">Create, edit and manage your teaching content here.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                        <Button variant="ghost" size="sm" className="bg-slate-800 text-white rounded-lg h-8 text-[11px] font-bold uppercase tracking-wider">All Courses</Button>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white rounded-lg h-8 text-[11px] font-bold uppercase tracking-wider">Published</Button>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white rounded-lg h-8 text-[11px] font-bold uppercase tracking-wider">Drafts</Button>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all h-10 px-6 font-bold">
                        <Plus className="w-4 h-4" />
                        New Course
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Filter by course name..."
                        className="w-full bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-sm text-slate-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white px-3 gap-2 rounded-xl text-xs h-10">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </Button>
                    <div className="h-6 w-px bg-slate-800" />
                    <p className="text-xs text-slate-500 font-medium">Show 1-6 of 14 courses</p>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="group overflow-hidden bg-slate-900/40 border-slate-800/80 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300">
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <Badge className={cn(
                                    "backdrop-blur-md border-white/10 text-[10px] py-0.5 px-2 font-bold uppercase tracking-wider",
                                    course.status === 'published' ? "bg-emerald-500/20 text-emerald-400" :
                                        course.status === 'draft' ? "bg-slate-500/20 text-slate-300" : "bg-amber-500/20 text-amber-400"
                                )}>
                                    {course.status}
                                </Badge>
                            </div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-5">
                            <h3 className="font-bold text-white text-lg mb-4 line-clamp-1 group-hover:text-indigo-400 transition-colors">{course.title}</h3>

                            <div className="grid grid-cols-2 gap-4 mb-5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Students</span>
                                    <div className="flex items-center gap-1.5">
                                        <LayoutDashboard className="w-3 h-3 text-indigo-400" />
                                        <span className="text-sm font-bold text-white">{course.students}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Revenue</span>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-3 h-3 text-emerald-400" />
                                        <span className="text-sm font-bold text-white">{course.revenue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <Avatar key={i} className="w-6 h-6 border-2 border-slate-900 ring-1 ring-slate-800">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=course${course.id}${i}`} />
                                            </Avatar>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium">Enrolled</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                                        <PenSquare className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                <Button variant="outline" size="icon" className="w-10 h-10 border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl disabled:opacity-30" disabled>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-10 h-10 border-slate-800 bg-indigo-600 text-white rounded-xl font-bold">1</Button>
                <Button variant="outline" className="w-10 h-10 border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">2</Button>
                <Button variant="outline" className="w-10 h-10 border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">3</Button>
                <Button variant="outline" size="icon" className="w-10 h-10 border-slate-800 text-slate-400 hover:bg-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
