"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"

interface Movie {
  _id: string
  title: string
  image: string
  rating: number
  genre: string
  duration: number
  isComingSoon: boolean
}

export function RecommendationSection() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch("/api/movies/recommendations")
                const data = await res.json()
                if (res.ok) setMovies(data)
            } catch (error) {
                console.error("Failed to fetch recommendations")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecommendations()
    }, [])

    if (isLoading) return null
    if (movies.length === 0) return null

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black tracking-widest uppercase border border-primary/20 animate-pulse">
                            <Sparkles className="h-4 w-4 fill-current" />
                            Dành riêng cho bạn
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                            Khám Phá <span className="text-primary">Đúng Gu</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Dựa trên lịch sử xem phim và danh sách yêu thích của bạn, chúng tôi đề xuất những siêu phẩm này.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {movies.map((movie) => (
                        <MovieCard key={movie._id} {...movie} />
                    ))}
                </div>
            </div>
        </section>
    )
}
