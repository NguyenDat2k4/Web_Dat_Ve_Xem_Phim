"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Users, 
  Film, 
  Ticket, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const { stats, chartData, recentBookings } = data || {}

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, Admin!</h1>
          <p className="text-muted-foreground">Đây là những gì đang diễn ra với rạp chiếu của bạn hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold">
          <TrendingUp className="h-4 w-4" />
          <span>+12% Doanh thu tuần này</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Tổng Doanh Thu" 
          value={`${stats.totalRevenue.toLocaleString()}đ`} 
          icon={DollarSign} 
          trend="+15%" 
          isPositive={true} 
        />
        <StatsCard 
          title="Tổng Lượt Đặt" 
          value={stats.totalBookings} 
          icon={Ticket} 
          trend="+8%" 
          isPositive={true} 
        />
        <StatsCard 
          title="Phim Đang Có" 
          value={stats.totalMovies} 
          icon={Film} 
          trend="+2" 
          isPositive={true} 
        />
        <StatsCard 
          title="Người Dùng" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="+12" 
          isPositive={true} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Biểu đồ doanh thu tuần
            </CardTitle>
            <CardDescription>Dữ liệu doanh thu ước tính trong 7 ngày gần nhất.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-8">
            {chartData.map((d: any, i: number) => {
              const height = (d.revenue / (stats.totalRevenue || 1)) * 500 // Scale height
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex flex-col items-center justify-end h-full">
                    <div 
                      className="w-full max-w-[40px] bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all duration-500 ease-out relative"
                      style={{ height: `${Math.max(10, height)}%` }}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap shadow-md z-10">
                            {d.revenue.toLocaleString()}đ
                        </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase rotate-[-45deg] md:rotate-0 mt-2">
                    {d.day}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Lượt đặt gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.map((booking: any) => (
              <div key={booking._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{booking.movie}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{booking.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">{booking.totalPrice.toLocaleString()}đ</p>
                  <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[8px] h-4 px-1">
                    {booking.status === 'cancelled' ? 'Hủy' : 'Xong'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, trend, isPositive }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all shadow-sm overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5" />
          </div>
          <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-2xl font-black">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
