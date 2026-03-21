import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CoursesChartProps {
	data: Array<{
		name?: string
		sales?: number
		revenue?: string | number
	}>
}

export default function CoursesChart({ data }: CoursesChartProps) {
	// Transform data for display (limiting to top 5)
	const chartData = (data || []).slice(0, 5).map((course) => ({
		name: course.name?.substring(0, 15) || 'Course',
		sales: course.sales || 0,
	}))

	return (
		<Card className="bg-card/40 border-border/80 backdrop-blur-sm rounded-2xl overflow-hidden">
			<CardHeader className="pb-8">
				<div>
					<CardTitle className="text-foreground">Top Courses</CardTitle>
					<CardDescription className="text-muted-foreground/60">
						Performance by course
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="h-[320px]">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="currentColor"
							className="text-border"
							vertical={true}
						/>
						<XAxis
							dataKey="name"
							stroke="#64748b"
							fontSize={11}
							tickLine={false}
							axisLine={false}
							dy={10}
						/>
						<YAxis
							stroke="#64748b"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'var(--card)',
								borderColor: 'var(--border)',
								borderRadius: '12px',
								color: 'var(--foreground)',
								border: '1px solid var(--border)',
							}}
							itemStyle={{ color: '#818cf8' }}
							formatter={(value) => [value, 'Sales']}
						/>
						<Legend
							wrapperStyle={{
								paddingTop: '20px',
								fontSize: '12px',
								color: 'var(--muted-foreground)',
							}}
						/>
						<Bar
							dataKey="sales"
							fill="#6366f1"
							radius={[8, 8, 0, 0]}
							name="Sales"
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
