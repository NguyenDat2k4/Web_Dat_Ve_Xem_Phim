"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie 
} from "recharts"
import { 
  TrendingUp, Users, DollarSign, Film, 
  BrainCircuit, RefreshCcw, ArrowUpRight, ArrowDownRight 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AIAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [analysis, setAnalysis] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const dataRes = await fetch("/api/admin/analytics/data")
      const rawData = await dataRes.json()
      setData(rawData)

      const aiRes = await fetch("/api/admin/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [{ 
            role: "user", 
            content: `Đây là dữ liệu kinh doanh: ${JSON.stringify(rawData)}. Hãy phân tích ngắn gọn và đưa ra dự báo.` 
          }] 
        }),
      })
      const aiResult = await aiRes.json()
      setAnalysis(aiResult.content)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = () => {
    window.print();
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen print:p-0 print:bg-white">
      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; color: black !important; }
          .bg-background { background: white !important; }
          .bg-card { background: white !important; border: 1px solid #ddd !important; color: black !important; box-shadow: none !important; }
          .text-primary { color: #ef4444 !important; }
          .text-muted-foreground { color: #444 !important; }
          .prose { color: black !important; max-width: none !important; }
          h1, h2, h3, p, span, div { color: black !important; }
          .recharts-cartesian-grid-horizontal line,
          .recharts-cartesian-grid-vertical line { stroke: #eee !important; }
          .recharts-text { fill: black !important; font-weight: bold !important; }
        }
      `}</style>
      <div className="flex justify-between items-end no-print">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">AI ANALYTICS</h1>
          <p className="text-muted-foreground">Phân tích kinh doanh thông minh bởi Hibiki AI</p>
        </div>
        <Button onClick={fetchAnalytics} disabled={isLoading} variant="outline" className="gap-2 rounded-xl">
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Cập nhật dữ liệu
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarSign className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Tổng doanh thu (6 tháng)</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {data?.totalRevenue?.toLocaleString()}đ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-green-500 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% so với kỳ trước
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lượt đặt vé</CardDescription>
            <CardTitle className="text-3xl font-black">
              {data?.totalBookings?.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-green-500 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5.2% lượt khách mới
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Giá trị đơn trung bình</CardDescription>
            <CardTitle className="text-3xl font-black">
              {data && data.totalRevenue ? Math.round(data.totalRevenue / data.totalBookings).toLocaleString() : 0}đ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-amber-500 font-medium">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -2.1% (Combo giảm giá)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Film className="h-12 w-12" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription>Phim ăn khách nhất</CardDescription>
            <CardTitle className="text-xl font-bold truncate">
              {data?.movieRevenue?.[0]?.name || "Đang tải..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">Hạng 1 doanh thu</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu hàng tháng</CardTitle>
              <CardDescription>Dữ liệu được tổng hợp từ hệ thống Booking</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#ef4444' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 6, fill: '#ef4444' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-white/5 shadow-xl">
              <CardHeader>
                <CardTitle>Doanh thu theo rạp</CardTitle>
                <CardDescription>Top các rạp có doanh thu cao nhất</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.cinemaRevenue} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {data?.cinemaRevenue?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/5 shadow-xl">
              <CardHeader>
                <CardTitle>Top 5 phim doanh thu</CardTitle>
                <CardDescription>Phim mang lại lợi nhuận tốt nhất</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.movieRevenue} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 shadow-2xl h-full flex flex-col print:h-auto">
            <CardHeader className="border-b border-primary/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-xl no-print">
                  <BrainCircuit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Hibiki AI Analysis</CardTitle>
                  <CardDescription>Nhận xét chuyên môn từ AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[600px] p-6 print:h-auto overflow-visible">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse no-print">
                    <div className="h-4 bg-primary/10 rounded w-3/4" />
                    <div className="h-4 bg-primary/10 rounded w-full" />
                    <div className="h-4 bg-primary/10 rounded w-5/6" />
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none print:prose-black">
                    <div className="bg-primary/10 p-4 rounded-2xl mb-6 border border-primary/20 print:bg-gray-100">
                      <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">Dự báo chiến lược</p>
                      <p className="text-sm italic leading-relaxed">
                        Dựa trên dữ liệu thực tế, tôi nhận thấy rạp {data?.cinemaRevenue?.[0]?.name} đang dẫn đầu doanh thu. Chiến lược sắp tới nên tập trung vào việc duy trì phong độ tại cụm rạp này.
                      </p>
                    </div>
                    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {analysis}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <div className="p-4 border-t border-primary/10 bg-primary/5 no-print">
              <Button onClick={handleExportPDF} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                Xuất báo cáo PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
