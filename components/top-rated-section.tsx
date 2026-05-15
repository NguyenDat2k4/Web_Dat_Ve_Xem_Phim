"use client"

import { MovieCard } from "@/components/movie-card"
import { Star } from "lucide-react"

interface Movie {
  _id: string
  title: string
  image: string
  rating: number
  genre: string
  duration: number
  isComingSoon: boolean
  numReviews?: number
}

interface TopRatedSectionProps {
  movies: Movie[]
}

export function TopRatedSection({ movies }: TopRatedSectionProps) {
  if (!movies || movies.length === 0) return null

  const topMovies = movies.slice(0, 4)

  return (
    <section className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold tracking-widest uppercase text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        Được yêu thích nhất
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                        Phim Đánh Giá Cao
                    </h2>
                </div>
                <div className="hidden md:block text-muted-foreground text-sm max-w-xs text-right">
                    Những tác phẩm điện ảnh được khán giả chấm điểm cao nhất.
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {topMovies.map((movie) => (
                    <MovieCard key={movie._id} {...movie} />
                ))}
            </div>
        </div>
    </section>
  )
}
