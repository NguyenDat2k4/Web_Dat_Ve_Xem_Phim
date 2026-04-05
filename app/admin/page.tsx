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
  Loader2,
  Download,
  FileSpreadsheet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import * as XLSX from "xlsx"

const COLORS = ["#f43f5e", "#ec4899", "#d946ef", "#8b5cf6", "#6366f1"]

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

  const exportToExcel = () => {
    if (!data) return
    
    // Prepare data for Excel
    const reportData = data.recentBookings.map((b: any) => ({
      "Phim": b.movie,
      "Khách hàng": b.customerName,
      "SĐT": b.customerPhone,
      "Rạp": b.cinema,
      "Suất chiếu": `${b.time} ${b.date}`,
      "Ghế": b.seats.join(", "),
      "Tổng tiền": b.totalPrice,
      "Ngày đặt": new Date(b.createdAt).toLocaleString("vi-VN")
    }))

    const worksheet = XLSX.utils.json_to_sheet(reportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu")
    XLSX.writeFile(workbook, `Bao_cao_CineMax_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const { stats, chartData, movieSales, recentBookings } = data || {}

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại, Admin!</h1>
          <p className="text-muted-foreground">Phân tích chuyên sâu về tình hình kinh doanh của CineMax.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToExcel} className="gap-2 border-primary/20 hover:bg-primary/5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Xuất báo cáo Excel
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>Real-time Analytics</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Tổng Doanh Thu" 
          value={`${stats.totalRevenue.toLocaleString()}đ`} 
          icon={DollarSign} 
          trend="+15.2%" 
          isPositive={true} 
        />
        <StatsCard 
          title="Lượt Đặt Vé" 
          value={stats.totalBookings} 
          icon={Ticket} 
          trend="+8.4%" 
          isPositive={true} 
        />
        <StatsCard 
          title="Phim Khả Dụng" 
          value={stats.totalMovies} 
          icon={Film} 
          trend="+2" 
          isPositive={true} 
        />
        <StatsCard 
          title="Thành Viên" 
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
              Xu hướng doanh thu (7 ngày)
            </CardTitle>
            <CardDescription>Biểu đồ biến động doanh thu thực tế từ các đơn hàng thành công.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#888', fontSize: 12}}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#888', fontSize: 12}}
                    tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f43f5e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Movie Popularity Section */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              Tỉ lệ phim ăn khách
            </CardTitle>
            <CardDescription>Cơ cấu doanh thu theo từng bộ phim.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movieSales}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {movieSales.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Recent Bookings Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Dòng tiền giao dịch
                </CardTitle>
                <CardDescription>Danh sách 8 đơn hàng mới nhất phát sinh trên hệ thống.</CardDescription>
            </div>
            <Badge variant="outline" className="h-6">Live Stream</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-muted-foreground border-b border-border">
                            <th className="pb-3 font-bold">Khách hàng</th>
                            <th className="pb-3 font-bold">Bộ phim</th>
                            <th className="pb-3 font-bold text-center">Ghế</th>
                            <th className="pb-3 font-bold text-right">Tổng tiền</th>
                            <th className="pb-3 font-bold text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {recentBookings.map((booking: any) => (
                        <tr key={booking._id} className="group hover:bg-secondary/20 transition-colors">
                            <td className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {booking.customerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold">{booking.customerName}</p>
                                        <p className="text-[10px] text-muted-foreground">{booking.customerPhone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 font-medium max-w-[200px] truncate">{booking.movie}</td>
                            <td className="py-4 text-center">
                                <Badge variant="secondary" className="text-[10px] bg-secondary/50 font-mono">
                                    {booking.seats.length} ghế
                                </Badge>
                            </td>
                            <td className="py-4 text-right font-black text-primary">
                                {booking.totalPrice.toLocaleString()}đ
                            </td>
                            <td className="py-4 text-right">
                                <Badge variant={booking.status === 'paid' ? 'default' : 'outline'} className={`text-[9px] h-5 px-1.5 ${booking.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-none' : ''}`}>
                                    {booking.status === 'paid' ? 'Đã thanh toán' : booking.status}
                                </Badge>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
