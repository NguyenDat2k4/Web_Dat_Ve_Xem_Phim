"use client"

import { Button } from "@/components/ui/button"
import { Play, Calendar, Clock, Star } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface HeroSectionProps {
  movies: any[]
}

export function HeroSection({ movies = [] }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  if (movies.length === 0) return null
  
  const activeMovie = movies[activeIndex]

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${activeMovie.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center pt-16">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm text-primary font-medium">Phim nổi bật</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance">
            {activeMovie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{activeMovie.releaseDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{activeMovie.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <span className="text-accent font-semibold">{activeMovie.rating}</span>
            </div>
            <span className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground">
              {activeMovie.genre}
            </span>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {activeMovie.description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Link href={`/movie/${activeMovie._id || activeMovie.id}`}>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Play className="h-5 w-5 fill-current" />
                Đặt vé ngay
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary gap-2">
              <Play className="h-5 w-5" />
              Xem trailer
            </Button>
          </div>
        </div>
      </div>

      {/* Movie Selector */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {movies.map((movie, index) => (
          <button
            key={movie._id || index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? "bg-primary w-8" 
                : "bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
            aria-label={`Xem ${movie.title}`}
          />
        ))}
      </div>
    </section>
  )
}
