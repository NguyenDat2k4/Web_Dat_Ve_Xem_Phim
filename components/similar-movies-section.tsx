"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { Sparkles } from "lucide-react"

interface Movie {
  _id: string
  title: string
  image: string
  rating: number
  genre: string
  duration: number
  isComingSoon: boolean
}

interface SimilarMoviesSectionProps {
  movieId: string
}

export function SimilarMoviesSection({ movieId }: SimilarMoviesSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await fetch(`/api/movies/recommendations?type=similar&movieId=${movieId}`)
        const data = await res.json()
        if (res.ok) setMovies(data)
      } catch (error) {
        console.error("Failed to fetch similar movies", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (movieId) {
      fetchSimilar()
    }
  }, [movieId])

  if (isLoading) return null
  if (movies.length === 0) return null

  // Hiển thị 4 phim tương tự
  const similarMovies = movies.slice(0, 4)

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Có thể bạn sẽ thích</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {similarMovies.map((movie) => (
            <MovieCard key={movie._id} {...movie} />
          ))}
        </div>
      </div>
    </section>
  )
}
