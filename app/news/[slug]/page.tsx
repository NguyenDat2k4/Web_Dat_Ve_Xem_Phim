"use client"

import { useState, useEffect, use, useCallback } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
    Calendar, 
    Eye, 
    ChevronLeft, 
    MessageSquare,
    Loader2,
    User,
    Send,
    Play,
    Newspaper,
    Share2,
    Bookmark,
    ThumbsUp,
    TrendingUp,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user } = useAuth()
  const [news, setNews] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const fetchNewsDetail = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/news/${slug}`)
      const data = await res.json()
      if (res.ok) {
        setNews(data)
      }
    } catch (error) {
      console.error("Failed to fetch news detail:", error)
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchNewsDetail()
  }, [fetchNewsDetail])


  const getYoutubeId = (url: string) => {
    if (!url) return ""
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : url
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }
    if (!commentContent.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/news/${slug}`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success("Bình luận thành công!")
        setCommentContent("")
        fetchNewsDetail() // Refresh comments
      } else {
        toast.error(data.error || "Thất bại")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Đang tải bài viết...</p>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Bài viết không tồn tại</h2>
        <Button onClick={() => window.location.href = "/news"}>Quay lại tin tức</Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Header with Thumbnail/Video */}
      <section className="relative pt-20">
        {news.videoUrl ? (
            <div className="container mx-auto px-4 mt-8">
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-border shadow-primary/10">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYoutubeId(news.videoUrl)}?autoplay=0&rel=0`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        ) : (
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                <Image 
                    src={news.thumbnail} 
                    alt={news.title}
                    fill
                    className="object-cover blur-sm opacity-30 scale-110"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="container relative mx-auto h-full flex flex-col justify-end px-4 pb-12">
                   <div className="w-full max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-white text-sm px-4 py-1">{news.category}</Badge>
                            {news.videoUrl && <Badge variant="secondary" className="gap-1 bg-white/20 text-white backdrop-blur-md px-3 h-7"><Play className="h-3 w-3 fill-current" /> TRAILER</Badge>}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl">
                            {news.title}
                        </h1>
                   </div>
                </div>
            </div>
        )}
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Article Content */}
            <div className="lg:col-span-3 space-y-12">
                <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{news.author}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1.5 font-bold text-primary">
                            <Eye className="h-4 w-4" />
                            {news.views.toLocaleString()} lượt xem
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-secondary/50"><Share2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full bg-secondary/50"><Bookmark className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div 
                    className="prose prose-invert prose-lg max-w-none leading-relaxed prose-headings:font-black prose-p:text-muted-foreground prose-strong:text-white prose-a:text-primary transition-all pb-12 border-b border-border"
                    dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br />') }}
                />

                {/* Interaction Section */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-border">
                    <h3 className="font-bold flex items-center gap-2">
                        Bạn cảm thấy bài viết này thế nào?
                    </h3>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" className="gap-2 hover:text-primary h-11 px-6"><ThumbsUp className="h-5 w-5" /> Hữu ích</Button>
                        <Button variant="ghost" className="gap-2 h-11 px-6"><Share2 className="h-5 w-5" /> Chia sẻ</Button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-8 pb-20">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-primary fill-primary/10" />
                        <h2 className="text-2xl font-bold">Bình luận ({news.comments?.length || 0})</h2>
                    </div>

                    {user ? (
                        <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold">{user.name}</span>
                            </div>
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <Textarea 
                                    placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                                    className="bg-secondary/20 border-border min-h-[100px] focus:ring-primary/20"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSubmittingComment} className="bg-primary hover:bg-primary/90 px-6 font-bold shadow-md shadow-primary/20">
                                        {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                        Gửi nhận xét
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-8 text-center rounded-2xl bg-secondary/20 border border-dashed border-border">
                            <p className="text-muted-foreground mb-4">Vui lòng đăng nhập để gửi bình luận và tham gia thảo luận.</p>
                            <Button variant="outline" onClick={() => window.location.href='/login'}>Đăng nhập ngay</Button>
                        </div>
                    )}

                    <div className="space-y-8 mt-10">
                        {news.comments?.length === 0 ? (
                            <p className="text-center py-10 text-muted-foreground italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        ) : (
                            news.comments.map((comment: any, idx: number) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                                        {comment.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm">{comment.userName}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed p-4 rounded-2xl bg-secondary/30 border border-border/50 group-hover:border-primary/20 transition-colors">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar with related/trending */}
            <div className="lg:col-span-1 space-y-10">
                <div className="p-6 rounded-2xl bg-card border border-border">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Bài viết khác
                    </h2>
                    <div className="space-y-6">
                        {/* Static/Mock related content for visual flair */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="group cursor-pointer space-y-2" onClick={() => window.location.href='/news'}>
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                                    <Image 
                                        src={`https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80&idx=${i}`} 
                                        alt="Related news" 
                                        fill 
                                        className="object-cover transition-transform group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                </div>
                                <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    Khám phá hậu trường bom tấn tháng này...
                                </h4>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-primary h-auto pt-4 border-t border-border rounded-none text-xs font-bold" onClick={() => window.location.href='/news'}>
                        XEM TẤT CẢ TIN TỨC <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
