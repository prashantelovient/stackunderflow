import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  User, Mail, Calendar, PlayCircle, CheckCircle2, Trophy,
  TrendingUp, Clock, BookOpen, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/auth/store/authStore'
import { courses, studentVideos, watchProgress } from '@/student/services/studentService'
import { formatDate, cn } from '@/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function StatItem({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user: student } = useAuthStore()
  const displayName = student?.name || 'Student'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const { data: allCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: courses.getAll,
  })

  const { data: allVideos } = useQuery({
    queryKey: ['student-videos'],
    queryFn: studentVideos.getAll,
  })

  const { data: progressList, isLoading: loadingProgress } = useQuery({
    queryKey: ['student-progress'],
    queryFn: watchProgress.getAll,
  })

  const completedVideos = progressList?.filter(p => p.completed) ?? []
  const inProgressVideos = progressList?.filter(p => !p.completed && p.progress > 0) ?? []

  const videoTotal = allVideos?.length || 0
  const completedCount = completedVideos.length
  const overallPercent = videoTotal > 0 ? Math.round((completedCount / videoTotal) * 100) : 0

  // Find which courses have been touched
  const progressVideoIds = new Set(progressList?.map(p => {
    const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
    return vid
  }))

  const touchedCourseIds = new Set(
    allVideos?.filter(v => progressVideoIds.has(v.id) && v.courseId).map(v => v.courseId!) ?? []
  )
  const enrolledCourses = allCourses?.filter(c => touchedCourseIds.has(c.id)) ?? []

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-10">
      {/* Profile hero */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border-4 border-background shadow-2xl">
              <AvatarImage src={student?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-4xl font-extrabold text-white">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">{displayName}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-primary" />
                {student?.email}
              </p>
              <Badge variant="outline" className="bg-background/50 border-primary/20 py-1">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Active Student
              </Badge>
            </div>

            <div className="mt-8 max-w-md mx-auto md:mx-0">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                <span>Learning Progress</span>
                <span className="text-primary">{overallPercent}%</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden border border-border p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                You have mastered <span className="text-foreground font-bold">{completedCount}</span> out of <span className="text-foreground font-bold">{videoTotal}</span> modules.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem icon={PlayCircle} label="Total Content" value={videoTotal} color="bg-indigo-600 shadow-indigo-500/20" />
        <StatItem icon={CheckCircle2} label="Completed" value={completedCount} color="bg-emerald-600 shadow-emerald-500/20" />
        <StatItem icon={TrendingUp} label="In Progress" value={inProgressVideos.length} color="bg-pink-600 shadow-pink-500/20" />
        <StatItem icon={Trophy} label="Enrolled" value={enrolledCourses.length} color="bg-amber-600 shadow-amber-500/20" />
      </div>

      {/* Enrolled courses */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Active Learning Paths</h2>
          <Link to="/student/courses">
            <Button variant="ghost" size="sm" className="text-primary font-bold">Browse More</Button>
          </Link>
        </div>

        {loadingProgress ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="h-20 animate-pulse bg-muted" />
            ))}
          </div>
        ) : enrolledCourses.length === 0 ? (
          <Card className="bg-muted/30 border-dashed border-border py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="text-lg font-bold">Your library is waiting</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">Start your first course to begin tracking your achievements.</p>
            <Link to="/student/courses" className="mt-6 inline-block">
              <Button className="bg-primary hover:scale-105 transition-transform">Explore Academy</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledCourses.map(course => {
              const courseVideos = allVideos?.filter(v => v.courseId === course.id) ?? []
              const completedInCourse = completedVideos.filter(p => {
                const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)?.id
                return courseVideos.some(v => v.id === vid)
              }).length
              const pct = courseVideos.length > 0
                ? Math.round((completedInCourse / courseVideos.length) * 100)
                : 0

              return (
                <Link
                  key={course.id}
                  to={`/student/courses/${course.id}`}
                  className="group"
                >
                  <Card className="bg-card border-border hover:border-primary/50 transition-all hover:translate-y-[-2px] hover:shadow-lg overflow-hidden h-full">
                    <CardContent className="p-5 flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-800 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {course.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden border border-border/50 p-[1px]">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-8">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {completedInCourse}/{courseVideos.length} MODULES
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed videos */}
      {completedVideos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Recent Achievements</h2>
          <Card className="bg-card border-border p-1">
            <div className="divide-y divide-border">
              {completedVideos.slice(0, 8).map(p => {
                const vid = typeof p.videoId === 'string' ? p.videoId : (p.videoId as any)
                const videoObj = allVideos?.find(v => v.id === (typeof vid === 'string' ? vid : vid?.id))
                if (!videoObj) return null
                return (
                  <Link
                    key={p.id}
                    to={`/student/watch/${videoObj.id}${videoObj.courseId ? `?course=${videoObj.courseId}` : ''}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {videoObj.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                        <BookOpen className="w-3 h-3" />
                        {videoObj.courseTitle}
                      </p>
                    </div>
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 opacity-60">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{videoObj.duration}</span>
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
