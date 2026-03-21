import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CompletionChartProps {
	completed: number
	inProgress: number
	notStarted: number
}

export default function CompletionChart({
	completed,
	inProgress,
	notStarted,
}: CompletionChartProps) {
	const total = completed + inProgress + notStarted

	const data = [
		{ name: 'Completed', value: completed, color: '#10b981' },
		{ name: 'In Progress', value: inProgress, color: '#f59e0b' },
		{ name: 'Not Started', value: notStarted, color: '#ef4444' },
	].filter((item) => item.value > 0)

	return (
		<Card className="bg-card/40 border-border/80 backdrop-blur-sm rounded-2xl overflow-hidden">
			<CardHeader className="pb-6">
				<div>
					<CardTitle className="text-foreground">Completion Status</CardTitle>
					<CardDescription className="text-muted-foreground/60">
						Student progress distribution
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-[260px] flex items-center justify-center">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={50}
								outerRadius={80}
								paddingAngle={2}
								dataKey="value"
								label={({ name, percent }) =>
									`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
								}
								labelLine={false}
							>
								{data.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: 'var(--card)',
									borderColor: 'var(--border)',
									borderRadius: '12px',
									color: 'var(--foreground)',
									border: '1px solid var(--border)',
								}}
								formatter={(value) => [value, 'Students']}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-4 space-y-2">
					{[
						{ label: 'Completed', value: completed, color: 'bg-emerald-500' },
						{ label: 'In Progress', value: inProgress, color: 'bg-amber-500' },
						{ label: 'Not Started', value: notStarted, color: 'bg-red-500' },
					].map((item) => (
						<div
							key={item.label}
							className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
						>
							<div className="flex items-center gap-2">
								<div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
								<span className="text-xs text-muted-foreground">{item.label}</span>
							</div>
							<span className="text-sm font-semibold text-foreground">{item.value}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
