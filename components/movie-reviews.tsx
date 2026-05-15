"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, MessageSquare, Send, User, Loader2, Heart } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

interface Review {
  _id: string
  user: { name: string, _id: string }
  rating: number
  comment: string
  images?: string[]
  likes?: string[]
  replies?: Array<{
    user: { name: string, _id: string }
    comment: string
    createdAt: string
  }>
  createdAt: string
  hasPurchased?: boolean
}

interface MovieReviewsProps {
  movieId: string
}

export function MovieReviews({ movieId }: MovieReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "", images: "" })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyComment, setReplyComment] = useState("")

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?movieId=${movieId}`)
      const data = await res.json()
      if (res.ok) setReviews(data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }, [movieId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi nhận xét")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          movieId, 
          ...newReview,
          images: newReview.images ? newReview.images.split(",").map(i => i.trim()) : []
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Cảm ơn bạn đã gửi nhận xét!")
        setNewReview({ rating: 5, comment: "", images: "" })
        fetchReviews()
      } else {
        toast.error(data.error || "Không thể gửi nhận xét")
      }
    } catch (error) {
      toast.error("Lỗi kết nối")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (reviewId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bình luận")
      return
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: "POST" })
      if (res.ok) fetchReviews()
    } catch (error) {
      console.error("Like failed")
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để trả lời")
      return
    }
    if (!replyComment) return

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: replyComment })
      })
      if (res.ok) {
        toast.success("Đã gửi phản hồi")
        setReplyComment("")
        setReplyingTo(null)
        fetchReviews()
      }
    } catch (error) {
      toast.error("Không thể gửi phản hồi")
    }
  }

  return (
    <div className="space-y-12">
      {/* Review Form */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Viết nhận xét của bạn
        </h3>

        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Đánh giá:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Đánh giá ${star} sao`}
                        title={`${star} sao`}
                      >
                        <Star 
                          className={`h-7 w-7 ${star <= newReview.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Input 
                    placeholder="Dán link ảnh (phân cách bằng dấu phẩy)..."
                    value={newReview.images}
                    onChange={(e) => setNewReview({ ...newReview, images: e.target.value })}
                    className="max-w-xs bg-secondary/30 border-border rounded-xl"
                />
            </div>

            <Textarea
              placeholder="Chia sẻ cảm nhận của bạn về bộ phim này..."
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="min-h-[120px] bg-secondary/30 border-border focus:ring-primary rounded-2xl p-4 text-base"
              required
            />

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Gửi nhận xét
            </Button>
          </form>
        ) : (
          <div className="p-6 bg-secondary/20 rounded-2xl border border-dashed border-border text-center">
            <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để có thể để lại bình luận và đánh giá.</p>
            <Button variant="outline" onClick={() => window.location.href='/login'}>Đăng nhập ngay</Button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Cộng đồng nhận xét ({reviews.length})</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-base">{review.user?.name}</p>
                            {review.hasPurchased && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[9px] h-5 px-2 border-emerald-500/20 gap-1 font-bold">
                                    <ShieldCheck className="h-3 w-3" />
                                    Đã mua vé
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                            {format(new Date(review.createdAt), "dd/MM/yyyy • HH:mm", { locale: vi })}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-xl">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-black text-accent">{review.rating}</span>
                  </div>
                </div>

                <div className="pl-0 md:pl-15 space-y-4">
                    <p className="text-foreground text-lg leading-relaxed">
                        {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {review.images.map((img, i) => (
                                <div key={i} className="relative w-32 aspect-square rounded-xl overflow-hidden border border-border">
                                    <Image 
                                        src={img || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80"} 
                                        alt={`Review image ${i + 1}`} 
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer" 
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-6 pt-2 border-t border-border/50">
                        <button 
                            onClick={() => handleLike(review._id)}
                            className={`flex items-center gap-2 text-sm font-bold transition-colors ${review.likes?.includes(user?.id as string) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            <Heart className={`h-5 w-5 ${review.likes?.includes(user?.id as string) ? 'fill-current' : ''}`} />
                            Hữu ích ({review.likes?.length || 0})
                        </button>
                        <button 
                            onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                        >
                            <MessageSquare className="h-5 w-5" />
                            Phản hồi ({review.replies?.length || 0})
                        </button>
                    </div>

                    {/* Replies List */}
                    {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-8 border-l-2 border-primary/20">
                            {review.replies.map((reply, i) => (
                                <div key={i} className="bg-secondary/20 p-3 rounded-2xl relative">
                                    <p className="font-bold text-xs text-primary mb-1">{reply.user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{reply.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === review._id && (
                        <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2">
                            <Input 
                                placeholder="Viết phản hồi của bạn..."
                                value={replyComment}
                                onChange={(e) => setReplyComment(e.target.value)}
                                className="bg-secondary/30 border-border rounded-xl"
                                autoFocus
                            />
                            <Button size="sm" className="rounded-xl px-4" onClick={() => handleReply(review._id)}>Gửi</Button>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-border">
             <MessageSquare className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
             <p className="text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  )
}
