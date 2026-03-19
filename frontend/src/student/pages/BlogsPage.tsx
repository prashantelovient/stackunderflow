import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Calendar, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { studentBlogs } from '@/student/services/studentService'
import type { Blog } from '@/student/services/studentService'
import { formatDate, cn } from '@/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const coverColors = [
  'from-violet-600/60 to-purple-800/60',
  'from-indigo-600/60 to-blue-800/60',
  'from-pink-600/60 to-rose-800/60',
  'from-emerald-600/60 to-teal-800/60',
  'from-amber-600/60 to-orange-800/60',
  'from-cyan-600/60 to-sky-800/60',
]

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const color = coverColors[index % coverColors.length]
  const excerpt = blog.content.replace(/<[^>]+>/g, '').slice(0, 150)

  return (
    <Link
      to={`/student/blog/${blog.id}`}
      className="group"
    >
      <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl shadow-sm flex flex-col h-full">
        {/* Cover */}
        <div className={cn("relative h-48 bg-gradient-to-br flex items-center justify-center overflow-hidden", color)}>
          <BookOpen className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {blog.thumbnail && (
            <img
              src={`${API_BASE}${blog.thumbnail}`}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">Article</Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1 leading-relaxed">{excerpt}...</p>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              EXPLORE <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
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
    <div className="p-4 lg:p-10 max-w-7xl mx-auto min-h-full space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">VaultLearn <span className="text-primary italic">Journal</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Expert tutorials, development guides and the latest learning resources from our library.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="h-11 pl-10 bg-card border-border shadow-sm focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border h-[400px]">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
                <div className="pt-4 flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 border-dashed border-border">
          <BookOpen className="w-20 h-20 text-muted-foreground/20 mb-6" />
          <h3 className="text-2xl font-bold">
            {search ? 'Content hidden' : 'No publications'}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {search ? `We couldn't find any articles matching "${search}". Try refining your search.` : 'Check back later for tutorials and guides.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1 font-bold">{filtered.length} AVAILABLE</Badge>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

