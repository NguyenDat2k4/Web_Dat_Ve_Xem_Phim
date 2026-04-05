import { 
    Calendar, 
    Eye, 
    ChevronRight, 
    Newspaper,
    Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface NewsSectionProps {
  news: any[]
}

export function NewsSection({ news }: NewsSectionProps) {
  if (!news || news.length === 0) return null

  // Get top 4 latest news
  const displayedNews = news.slice(0, 4)

  return (
    <section id="news" className="py-24 relative overflow-hidden bg-secondary/20">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm">
                    <div className="w-8 h-[2px] bg-primary" />
                    <span>Tin tức mới nhất</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    Khám phá Thế giới <span className="text-primary italic">Điện ảnh</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                    Cập nhật những thông tin nóng hổi nhất về các bộ phim sắp ra mắt, hậu trường và các sự kiện độc quyền.
                </p>
            </div>
            <Link href="/news">
                <Button variant="outline" className="group rounded-full px-6 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all h-12 font-bold uppercase tracking-widest text-xs">
                    Xem tất cả tin tức <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedNews.map((item, idx) => (
                <Link 
                    href={`/news/${item.slug}`} 
                    key={item._id}
                    className="group block space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-secondary transition-all group-hover:shadow-primary/10 group-hover:scale-[1.02] duration-500">
                        <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                        />
                        <div className="absolute top-3 left-3">
                            <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[10px] font-bold px-2 py-0.5">
                                {item.category}
                            </Badge>
                        </div>
                        {item.videoUrl && (
                            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40">
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="h-2.5 w-2.5" />
                                {item.views.toLocaleString()}
                            </div>
                        </div>
                        <h3 className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {item.title}
                        </h3>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </section>
  )
}
