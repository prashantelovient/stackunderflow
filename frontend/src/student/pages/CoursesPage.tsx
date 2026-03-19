import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, ListVideo, PlayCircle, ChevronRight, Clock } from 'lucide-react'
import { useState } from 'react'
import { playlists, studentVideos } from '@/student/services/studentService'
import type { Playlist, Video } from '@/student/services/studentService'
import { cn } from '@/utils'

const gradients = [
  'from-violet-600 to-purple-700',
  'from-indigo-600 to-blue-700',
  'from-pink-600 to-rose-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-sky-700',
]

function PlaylistCard({ playlist, videos }: { playlist: Playlist; videos: Video[] }) {
  const videoCount = videos.filter(v => v.playlistId === playlist.id).length
  const gradientClass = gradients[playlist.title.charCodeAt(0) % gradients.length]
  const initial = playlist.title.charAt(0).toUpperCase()

  return (
    <Link
      to={`/student/courses/${playlist.id}`}
      className="group bg-white/5 border border-white/8 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 flex flex-col"
    >
      {/* Cover */}
      <div className={cn('relative h-44 bg-gradient-to-br flex items-center justify-center overflow-hidden', gradientClass)}>
        <span className="text-7xl font-black text-white/20 select-none">{initial}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-black/30 backdrop-blur px-2.5 py-1 rounded-full">
            <PlayCircle className="w-3.5 h-3.5" />
            {videoCount} videos
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-white text-base leading-snug group-hover:text-violet-300 transition-colors line-clamp-2">
          {playlist.title}
        </h3>
        <p className="text-sm text-gray-400 mt-1.5 line-clamp-2 flex-1">
          {playlist.description || 'No description provided'}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-violet-400 group-hover:text-violet-300 transition-colors">
            Start learning <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')

  const { data: allPlaylists, isLoading: loadingPlaylists } = useQuery({
    queryKey: ['student-playlists'],
    queryFn: playlists.getAll,
  })

  const { data: allVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const filtered = allPlaylists?.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <p className="text-gray-400 mt-1">Browse all available learning paths</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {loadingPlaylists ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
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
          <ListVideo className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300">
            {search ? 'No courses match your search' : 'No courses available'}
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            {search ? 'Try a different search term' : 'Check back soon for new courses'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(p => (
              <PlaylistCard key={p.id} playlist={p} videos={allVideos || []} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

