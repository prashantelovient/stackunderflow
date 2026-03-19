import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Clock, PlayCircle, BookOpen, Layers, ArrowRight, Search } from 'lucide-react'
import { courses } from '@/student/services/studentService'
import type { Course as CourseType } from '@/student/services/studentService'
import { cn } from '@/utils'
import { useState } from 'react'

const gradients = [
  'from-violet-600 to-purple-700',
  'from-indigo-600 to-blue-700',
  'from-pink-600 to-rose-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-sky-700',
]

function CourseCard({ course, index }: { course: CourseType; index: number }) {
  const gradient = gradients[index % gradients.length]

  return (
    <Link
      to={`/student/courses/${course.id}`}
      className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10"
    >
      {/* Thumbnail / gradient */}
      <div className={cn('h-40 bg-gradient-to-br flex items-center justify-center relative', gradient)}>
        {course.thumbnail ? (
          <img
            src={`http://localhost:5000${course.thumbnail}`}
            alt={course.title}
            className="w-full h-full object-cover"
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
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-violet-300 transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{course.description}</p>
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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Browse Courses</h1>
          <p className="text-sm text-gray-400 mt-1">{allCourses.length} courses available</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-white/5 rounded-t-2xl" />
              <div className="p-4 bg-white/3 rounded-b-2xl space-y-2">
                <div className="h-4 bg-white/10 rounded" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">{search ? 'No courses match your search' : 'No courses available yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
