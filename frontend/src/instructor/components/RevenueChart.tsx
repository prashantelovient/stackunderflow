import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RevenueChartProps {
	data: Array<{
		name: string
		revenue?: number
	}>
}

export default function RevenueChart({ data }: RevenueChartProps) {
	return (
		<Card className="bg-card/40 border-border/80 backdrop-blur-sm rounded-2xl overflow-hidden">
			<CardHeader className="pb-8">
				<div>
					<CardTitle className="text-foreground">Revenue Performance</CardTitle>
					<CardDescription className="text-muted-foreground/60">
						Monthly revenue trends
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="h-[320px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
						<defs>
							<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="currentColor"
							className="text-border"
							vertical={false}
						/>
						<XAxis
							dataKey="name"
							stroke="#64748b"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							dy={10}
						/>
						<YAxis
							stroke="#64748b"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `$${value}`}
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
							formatter={(value) => [`$${value}`, 'Revenue']}
						/>
						<Area
							type="monotone"
							dataKey="revenue"
							stroke="#6366f1"
							strokeWidth={2.5}
							fillOpacity={1}
							fill="url(#colorRevenue)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
