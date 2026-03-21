import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PlayCircle, BookOpen, Layers, Search, ListVideo } from 'lucide-react'
import { courses } from '@/student/services/studentService'
import type { Course as CourseType } from '@/student/services/studentService'
import { cn } from '@/utils'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const gradients = [
  'from-blue-500 via-indigo-500 to-purple-600',
  'from-cyan-500 via-blue-500 to-indigo-600',
  'from-fuchsia-500 via-purple-500 to-indigo-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-violet-500 via-indigo-500 to-blue-600',
]

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
  return `${baseUrl}${path}`
}

function CourseCard({ course, index }: { course: CourseType; index: number }) {
  const gradient = gradients[index % gradients.length]
  const videoCount = course.lectureCount || 0
  const moduleCount = course.moduleCount || 0
  const pillLabel = course.description?.trim() ? course.description : 'Uncategorized'

  return (
    <div className="group relative rounded-3xl overflow-hidden border border-border/80 bg-card shadow-[0_4px_25px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)] active:scale-[0.98] dark:bg-[#0f1426]/60 backdrop-blur-md">
      <Link to={`/student/courses/${course.id}`} className="absolute inset-0 z-20" />

      {/* Enrollment Badge */}
      {course.isEnrolled && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 border border-white/20 animate-in fade-in zoom-in duration-500">
           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
           Enrolled
        </div>
      )}

      {/* Thumbnail / gradient */}
      <div className={cn('relative h-48 bg-gradient-to-br flex items-center justify-center overflow-hidden', gradient)}>
        {course.thumbnail ? (
          <img
            src={getThumbnailUrl(course.thumbnail)!}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <ListVideo className="w-14 h-14 text-white/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                <PlayCircle className="w-8 h-8 text-white fill-white/20" />
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black tracking-[0.1em] px-2 py-0.5 uppercase">
                {pillLabel}
            </span>
          </div>
          
          <h3 className="text-lg font-black text-foreground line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>
          
          <div className="flex items-center gap-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none">{moduleCount} Modules</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <PlayCircle className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-widest leading-none font-mono">{videoCount} Assets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const { data: allCourses = [], isLoading } = useQuery<CourseType[]>({
    queryKey: ['student-courses'],
    queryFn: courses.getAll,
  })

  const filtered = search
    ? allCourses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : allCourses

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold tracking-tight text-foreground">
  Courses
</h1>
          <p className="text-sm text-muted-foreground mt-1">{allCourses.length} courses in your library</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 h-10 bg-card/60 border-border/60 transition-colors focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/60 h-[320px] rounded-2xl">
              <Skeleton className="h-44 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <div className="pt-3 border-t border-border/40" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border mt-10">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground">{search ? 'No courses match' : 'Library is empty'}</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">
            {search ? `We couldn't find any courses matching "${search}"` : 'Check back later for new content!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
