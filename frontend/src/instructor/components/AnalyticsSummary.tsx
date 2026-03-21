import { Users, BookOpen, DollarSign, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AnalyticsSummaryProps {
	data?: {
		totalStudents?: number
		totalCourses?: number
		totalRevenue?: string | number
		avgRating?: number
	}
}

export default function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
	const summaryCards = [
		{
			label: 'Total Students',
			value: data?.totalStudents?.toString() || '0',
			icon: Users,
			color: 'text-blue-400',
			bg: 'bg-blue-500/10',
			change: '+12%',
		},
		{
			label: 'Active Courses',
			value: data?.totalCourses?.toString() || '0',
			icon: BookOpen,
			color: 'text-emerald-400',
			bg: 'bg-emerald-500/10',
			change: '+5%',
		},
		{
			label: 'Total Revenue',
			value: typeof data?.totalRevenue === 'number' ? `$${data.totalRevenue}` : data?.totalRevenue || '$0',
			icon: DollarSign,
			color: 'text-amber-400',
			bg: 'bg-amber-500/10',
			change: '+18%',
		},
		{
			label: 'Completion Rate',
			value: data?.avgRating ? `${(data.avgRating * 10).toFixed(0)}%` : '0%',
			icon: CheckCircle2,
			color: 'text-purple-400',
			bg: 'bg-purple-500/10',
			change: '+8%',
		},
	]

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{summaryCards.map((card, i) => (
				<Card
					key={i}
					className="bg-card/40 border-border/80 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 group rounded-2xl overflow-hidden"
				>
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-4">
							<div className={cn('p-3 rounded-lg transition-colors', card.bg)}>
								<card.icon className={cn('w-5 h-5', card.color)} />
							</div>
							<Badge
								variant="outline"
								className="bg-muted/50 border-border/50 px-2 py-0.5 text-emerald-400 text-xs"
							>
								{card.change}
							</Badge>
						</div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
							{card.label}
						</p>
						<h3 className="text-2xl font-bold text-foreground group-hover:text-indigo-400 transition-colors">
							{card.value}
						</h3>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
