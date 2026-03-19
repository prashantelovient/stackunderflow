import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock, PlayCircle, BookOpen, Layers, ArrowRight, Search } from 'lucide-react'
import { courses } from '@/student/services/studentService'
import type { Course as CourseType } from '@/student/services/studentService'
import { cn } from '@/utils'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const gradients = [
  'from-violet-600 to-purple-700',
  'from-indigo-600 to-blue-700',
  'from-pink-600 to-rose-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-sky-700',
]

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
  return `${baseUrl}${path}`
}

function CourseCard({ course, index }: { course: CourseType; index: number }) {
  const gradient = gradients[index % gradients.length]

  return (
    <Link
      to={`/student/courses/${course.id}`}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Thumbnail / gradient */}
      <div className={cn('h-40 bg-gradient-to-br flex items-center justify-center relative', gradient)}>
        {course.thumbnail ? (
          <img
            src={getThumbnailUrl(course.thumbnail)!}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <BookOpen className="w-12 h-12 text-white/30" />
          </>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {course.moduleCount || 0} modules
          </span>
          <span className="bg-black/40 backdrop-blur-sm text-white/80 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <PlayCircle className="w-3 h-3" />
            {course.lectureCount || 0} lectures
          </span>
        </div>
        <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-card">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{course.description}</p>
        )}
      </div>
    </Link>
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
          <h1 className="text-xl lg:text-3xl font-bold tracking-tight">Browse Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">{allCourses.length} courses available in the library</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 h-10 bg-card border-border transition-colors focus:ring-primary/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border h-[260px]">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
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
