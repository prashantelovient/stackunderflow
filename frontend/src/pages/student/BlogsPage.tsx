import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Calendar, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { studentBlogs } from '@/services/studentService'
import type { Blog } from '@/services/studentService'
import { formatDate } from '@/utils'

const coverColors = [
  'from-violet-600/80 to-purple-800/80',
  'from-indigo-600/80 to-blue-800/80',
  'from-pink-600/80 to-rose-800/80',
  'from-emerald-600/80 to-teal-800/80',
  'from-amber-600/80 to-orange-800/80',
  'from-cyan-600/80 to-sky-800/80',
]

function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const color = coverColors[index % coverColors.length]
  const excerpt = blog.content.replace(/<[^>]+>/g, '').slice(0, 150)

  return (
    <Link
      to={`/student/blog/${blog.id}`}
      className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 flex flex-col"
    >
      {/* Cover */}
      <div className={`relative h-44 bg-gradient-to-br ${color} flex items-center justify-center overflow-hidden`}>
        <BookOpen className="w-14 h-14 text-white/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {blog.thumbnail && (
          <img
            src={`http://localhost:5000${blog.thumbnail}`}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/60 bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">
            Article
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-white text-[15px] leading-snug group-hover:text-violet-300 transition-colors line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-400 mt-2 line-clamp-3 flex-1">{excerpt}...</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
            Read more <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogsPage() {
  const [search, setSearch] = useState('')

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['student-blogs'],
    queryFn: studentBlogs.getAll,
  })

  const published = blogs?.filter(b => b.status === 'published') ?? []
  const filtered = published.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.content.replace(/<[^>]+>/g, '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog & Articles</h1>
          <p className="text-gray-400 mt-1">Tutorials, guides and learning resources</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/5 overflow-hidden">
              <div className="h-44 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300">
            {search ? 'No articles match your search' : 'No articles published yet'}
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            {search ? 'Try a different search term' : 'Check back soon for new content'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
