import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, BookOpen, Clock } from 'lucide-react'
import { studentBlogs } from '@/services/studentService'
import { formatDate } from '@/utils'

function ReadingTime({ content }: { content: string }) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return (
    <span className="flex items-center gap-1 text-sm text-gray-400">
      <Clock className="w-3.5 h-3.5" />
      {minutes} min read
    </span>
  )
}

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: blog, isLoading } = useQuery({
    queryKey: ['student-blog', id],
    queryFn: () => studentBlogs.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-6 bg-white/5 rounded w-24" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
          <div className="h-4 bg-white/5 rounded w-4/6" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <BookOpen className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-gray-300 font-semibold">Article not found</h3>
        <Link to="/student/blogs" className="text-violet-400 text-sm mt-2 hover:underline">
          ← Back to blogs
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        to="/student/blogs"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blogs
      </Link>

      {/* Cover */}
      {blog.thumbnail ? (
        <div className="w-full h-64 lg:h-80 rounded-2xl overflow-hidden mb-8">
          <img
            src={`http://localhost:5000${blog.thumbnail}`}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-violet-900/50 to-indigo-900/30 border border-violet-500/10 flex items-center justify-center mb-8">
          <BookOpen className="w-16 h-16 text-violet-600/40" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">
          Article
        </span>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(blog.createdAt)}
        </div>
        <ReadingTime content={blog.content} />
      </div>

      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-8">
        {blog.title}
      </h1>

      {/* Divider */}
      <div className="w-16 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full mb-8" />

      {/* Content */}
      <article
        className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-violet-400 prose-strong:text-white prose-code:text-violet-300 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-blockquote:border-violet-500 prose-blockquote:text-gray-400"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-white/5">
        <Link
          to="/student/blogs"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>
      </div>
    </div>
  )
}
