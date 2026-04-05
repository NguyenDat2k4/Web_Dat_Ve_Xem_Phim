"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Send, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Review {
  _id: string
  user: { name: string }
  rating: number
  comment: string
  createdAt: string
}

interface MovieReviewsProps {
  movieId: string
}

export function MovieReviews({ movieId }: MovieReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?movieId=${movieId}`)
      const data = await res.json()
      if (res.ok) setReviews(data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [movieId, fetchReviews])


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
        body: JSON.stringify({ movieId, ...newReview }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Cảm ơn bạn đã gửi nhận xét!")
        setNewReview({ rating: 5, comment: "" })
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
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground mr-2">Đánh giá:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`h-8 w-8 ${star <= newReview.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                    />
                  </button>
                ))}
              </div>
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
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">{review.user?.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                            {format(new Date(review.createdAt), "dd/MM/yyyy • HH:mm", { locale: vi })}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-xs font-bold text-accent">{review.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>

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
