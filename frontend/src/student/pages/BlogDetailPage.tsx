import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, BookOpen, Clock, ChevronLeft } from 'lucide-react'
import { studentBlogs } from '@/student/services/studentService'
import { formatDate, cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const getThumbnailUrl = (path: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')
  return `${baseUrl}${path}`
}

function ReadingTime({ content }: { content: string }) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
      <Clock className="w-4 h-4 text-primary" />
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
      <div className="p-4 lg:p-12 max-w-4xl mx-auto space-y-10">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card border border-dashed border-border rounded-3xl m-8">
        <BookOpen className="w-20 h-20 text-muted-foreground/20 mb-6" />
        <h3 className="text-2xl font-bold">Article Disappeared</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">This piece of content might have been moved or removed from our archive.</p>
        <Link to="/student/blogs" className="mt-8">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Return to Journal
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Nav */}
      <Link
        to="/student/blogs"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group"
      >
        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        BACK TO JOURNAL
      </Link>

      {/* Hero Section */}
      <div className="space-y-6">
        {/* Cover */}
        {blog.thumbnail ? (
          <div className="w-full h-64 lg:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-border">
            <img
              src={getThumbnailUrl(blog.thumbnail)!}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-primary/30" />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-6 flex-wrap border-b border-border pb-6">
          <Badge className="px-4 py-1.5 bg-primary text-primary-foreground font-bold">INSIGHT</Badge>
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-primary" />
            {formatDate(blog.createdAt)}
          </div>
          <ReadingTime content={blog.content} />
        </div>

        {/* Title */}
        <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight">
          {blog.title}
        </h1>
      </div>

      {/* Content */}
      <article
        className="prose prose-lg dark:prose-invert max-w-none 
          prose-headings:font-extrabold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-bold
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
          prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border prose-pre:rounded-2xl
          prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Footer / CTA */}
      <div className="mt-20 p-10 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold mb-3">Enjoyed this article?</h3>
        <p className="text-muted-foreground max-w-md mb-8">Dive deeper into our courses and master your skills today.</p>
        <Link to="/student/courses">
          <Button size="lg" className="rounded-xl px-8 font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            Explore Academy
          </Button>
        </Link>
      </div>
    </div>
  )
}

