import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { instructorService } from '../services/instructorService'
import AnalyticsSummary from '../components/AnalyticsSummary'
import EnrollmentChart from '../components/EnrollmentChart'
import CoursesChart from '../components/CoursesChart'
import RevenueChart from '../components/RevenueChart'
import CompletionChart from '../components/CompletionChart'

type TimePeriod = '7d' | '30d' | '6m'

export default function AnalyticsPage() {
	const [period, setPeriod] = useState<TimePeriod>('30d')

	const { data: analyticsData, isLoading, error } = useQuery({
		queryKey: ['instructor-analytics', period],
		queryFn: () => instructorService.getAnalytics(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})

	// Filter data by time period
	const getFilteredData = (data: any) => {
		if (!data) return data

		const monthsToInclude = period === '7d' ? 1 : period === '30d' ? 1 : 6

		return {
			...data,
			studentsByMonth: data.studentsByMonth?.slice(-monthsToInclude) || [],
			revenueData: data.revenueData?.slice(-monthsToInclude) || [],
		}
	}

	const filteredData = getFilteredData(analyticsData)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[500px]">
				<div className="flex flex-col items-center gap-3">
					<div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
					<p className="text-muted-foreground text-sm">Loading analytics...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[500px]">
				<div className="text-center">
					<p className="text-red-400 font-semibold mb-2">Failed to load analytics</p>
					<p className="text-muted-foreground text-sm">Please try again later</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-700">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
						<TrendingUp className="w-8 h-8 text-indigo-400" />
						Analytics & Insights
					</h1>
					<p className="text-muted-foreground mt-1">Track your courses, students, and revenue performance.</p>
				</div>

				{/* Time Period Filter */}
				<div className="flex items-center gap-2">
					<Calendar className="w-4 h-4 text-muted-foreground" />
					<Select value={period} onValueChange={(val) => setPeriod(val as TimePeriod)}>
						<SelectTrigger className="w-[180px] bg-muted/50 border-border rounded-lg h-9">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-card border-border">
							<SelectItem value="7d">Last 7 Days</SelectItem>
							<SelectItem value="30d">Last 30 Days</SelectItem>
							<SelectItem value="6m">Last 6 Months</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Summary Cards */}
			<AnalyticsSummary data={filteredData} />

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - Main Charts */}
				<div className="lg:col-span-2 space-y-8">
					{/* Enrollment Trend */}
					<EnrollmentChart data={filteredData?.studentsByMonth || []} />

					{/* Revenue Trend */}
					<RevenueChart data={filteredData?.revenueData || []} />
				</div>

				{/* Right Column - Supporting Charts */}
				<div className="space-y-8">
					{/* Course Performance */}
					<CoursesChart data={filteredData?.topCourses || []} />

					{/* Completion Status */}
					<CompletionChart
						completed={filteredData?.totalStudents ? Math.round(filteredData.totalStudents * 0.68) : 0}
						inProgress={filteredData?.totalStudents ? Math.round(filteredData.totalStudents * 0.25) : 0}
						notStarted={filteredData?.totalStudents ? Math.round(filteredData.totalStudents * 0.07) : 0}
					/>
				</div>
			</div>

			{/* Additional Insights */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Quick Stats */}
				<Card className="bg-card/40 border-border/80 backdrop-blur-sm p-6 rounded-2xl">
					<h3 className="font-bold text-foreground mb-4">Quick Stats</h3>
					<div className="space-y-3">
						<div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
							<span className="text-sm text-muted-foreground">Avg. Course Rating</span>
							<span className="font-bold text-foreground flex items-center gap-1">
								{filteredData?.avgRating || '0'} ★
							</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
							<span className="text-sm text-muted-foreground">Total Videos</span>
							<span className="font-bold text-foreground">{filteredData?.totalVideos || 0}</span>
						</div>
					</div>
				</Card>

				{/* Growth Info */}
				<Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-sm p-6 rounded-2xl">
					<h3 className="font-bold text-foreground mb-4">Performance</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Your courses are performing well! Keep engaging with your students and publishing new content to boost enrollment.
					</p>
					<Button
						variant="outline"
						size="sm"
						className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs h-8"
					>
						View Recommendations
					</Button>
				</Card>
			</div>
		</div>
	)
}
