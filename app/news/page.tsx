"use client"

import { useState, useEffect, useCallback } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
    Calendar, 
    Eye, 
    ChevronRight, 
    Search, 
    Filter, 
    Play, 
    Video,
    TrendingUp,
    MessageSquare,
    Loader2,
    Newspaper,
    Film
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const categories = [
    { label: "Tất cả", value: "All" },
    { label: "Tin điện ảnh", value: "Tin điện ảnh" },
    { label: "Khuyến mãi", value: "Khuyến mãi" },
    { label: "Sự kiện", value: "Sự kiện" },
  ]

  const fetchNews = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/news")
      const data = await res.json()
      if (res.ok) {
        setNews(data)
      }
    } catch (error) {
      console.error("Failed to fetch news:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])


  const filteredNews = news.filter(item => {
    const matchesCategory = category === "All" || item.category === category
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Trailers are news with a videoUrl
  const trailers = news.filter(item => item.videoUrl).slice(0, 4)
  const articles = filteredNews.filter(item => !item.videoUrl || category !== "All")

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Header */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 blur-3xl -z-10 rounded-full -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm">
                        <div className="w-8 h-[2px] bg-primary" />
                        <span>CineMax News</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Điểm tin <span className="text-primary italic">Điện ảnh</span> & <span className="text-primary">Sự kiện</span> Hot nhất
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Cập nhật những thông tin mới nhất về các bom tấn thế giới, chương trình khuyến mãi độc quyền và các sự kiện tại CineMax.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-12 items-center justify-between bg-card/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat.value}
                            variant={category === cat.value ? "default" : "ghost"}
                            className={`rounded-full px-6 transition-all ${category === cat.value ? 'shadow-md shadow-primary/20' : ''}`}
                            onClick={() => setCategory(cat.value)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>
                <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm kiếm bài viết..." 
                        className="pl-10 rounded-full bg-background/50 border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Main News Grid */}
            <div className="lg:col-span-3 space-y-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-video bg-secondary/50 rounded-2xl" />
                                <div className="h-6 bg-secondary/50 rounded w-3/4" />
                                <div className="h-4 bg-secondary/50 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="py-20 text-center space-y-4 text-muted-foreground">
                        <Newspaper className="h-16 w-16 mx-auto opacity-10" />
                        <p>Không tìm thấy bài viết nào trong chuyên mục này.</p>
                        <Button variant="outline" onClick={() => {setCategory("All"); setSearchTerm("");}}>Xem tất cả tin tức</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {articles.map((item, idx) => (
                            <Link 
                                href={`/news/${item.slug}`} 
                                key={item._id}
                                className="group block space-y-4"
                            >
                                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-secondary transition-all group-hover:shadow-primary/10 group-hover:scale-[1.02] duration-500">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white font-bold px-3 py-1">
                                            {item.category}
                                        </Badge>
                                    </div>
                                    {item.videoUrl && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 animate-pulse">
                                                <Play className="h-8 w-8 fill-current ml-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {item.views.toLocaleString()} lượt xem
                                        </div>
                                        <div className="flex items-center gap-1 text-primary">
                                            <MessageSquare className="h-3 w-3" />
                                            {item.comments?.length || 0} bình luận
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                        {item.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                    </p>
                                    <div className="pt-2 flex items-center gap-1 text-primary font-bold text-sm">
                                        Đọc tiếp <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Sidebar Section: Latest Trailers */}
            <div className="lg:col-span-1 space-y-8">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Video className="h-5 w-5 text-primary" /> Trailer mới nhất
                        </h2>
                    </div>
                    
                    <div className="space-y-6">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="w-24 h-16 bg-secondary/50 rounded-lg shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 bg-secondary/50 rounded w-full" />
                                        <div className="h-3 bg-secondary/50 rounded w-2/3" />
                                    </div>
                                </div>
                            ))
                        ) : trailers.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Chưa có trailer nào.</p>
                        ) : (
                            trailers.map((item) => (
                                <Link 
                                    href={`/news/${item.slug}`} 
                                    key={item._id}
                                    className="flex gap-4 group"
                                >
                                    <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-border bg-secondary">
                                        <Image
                                            src={item.thumbnail}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Play className="h-4 w-4 text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold line-clamp-2 group-hover:text-primary transition-colors leading-normal">
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                                            <TrendingUp className="h-2.5 w-2.5" /> Xu hướng
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    
                    <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-muted-foreground hover:text-primary border-t border-border rounded-none pt-4 h-auto">
                        XEM TẤT CẢ TRAILERS <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>

                {/* Promotional banner */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] group bg-secondary shadow-lg">
                    <Image 
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800" 
                        alt="Join membership" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                        <Badge className="bg-primary w-fit mb-2">Tích điểm rinh quà</Badge>
                        <h3 className="text-xl font-bold mb-2">Trở thành thành viên CineMax ngay!</h3>
                        <p className="text-xs text-white/80 mb-4">Tích điểm lên tới 5% cho mỗi đơn hàng và nhận hàng ngàn mã giảm giá độc quyền.</p>
                        <Button className="w-full bg-white text-black hover:bg-white/90 font-bold" onClick={() => window.location.href='/profile'}>Tham gia ngay</Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
