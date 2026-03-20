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
    <div className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,0.6)] hover:border-primary/30 dark:border-white/10 dark:bg-[#0f1426]">
      <Link to={`/student/courses/${course.id}`} aria-label={`Open ${course.title}`} className="absolute inset-0 z-0" />

      {/* Thumbnail / gradient */}
      <div className={cn('relative h-44 bg-gradient-to-br flex items-center justify-center overflow-hidden', gradient)}>
        {course.thumbnail ? (
          <img
            src={getThumbnailUrl(course.thumbnail)!}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <ListVideo className="w-12 h-12 text-white/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide line-clamp-1 text-foreground">
            {course.title}
          </h3>
          <span className="shrink-0 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold px-2.5 py-0.5">
            {videoCount} video{videoCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="mt-2">
          <span
            className="inline-flex max-w-full items-center rounded-full bg-muted/50 text-muted-foreground border border-border/60 px-2.5 py-0.5 text-[11px] truncate"
            title={pillLabel}
          >
            {pillLabel}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3">
         <Link
  to={`/student/courses/${course.id}`}
  className="
    relative z-10 flex-1 text-center
    text-sm font-medium
    rounded-lg px-4 py-2
    border border-border
    bg-muted/60
    backdrop-blur-sm
    text-foreground
    hover:bg-muted/60
    hover:border-primary/40
    transition-all duration-200
  "
>
 Explore
</Link>
          <div className="relative z-10 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground"
              title={`${moduleCount} modules`}
            >
              <Layers className="w-3.5 h-3.5" />
              {moduleCount}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground"
              title={`${videoCount} videos`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              {videoCount}
            </span>
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
