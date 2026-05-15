"use client"

import { Button } from "@/components/ui/button"
import { Play, Calendar, Clock, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useTranslations } from "next-intl"

interface HeroSectionProps {
  movies: any[]
}

export function HeroSection({ movies = [] }: HeroSectionProps) {
  const t = useTranslations('HeroSection')
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  // Cập nhật indicator (chấm tròn) khi slide thay đổi (drag/swipe)
  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap())
    })
  }, [api])

  // Tự động chuyển slide sau mỗi 4 giây
  useEffect(() => {
    if (movies.length <= 1 || !api) return;
    const interval = setInterval(() => {
      api.scrollNext()
    }, 4000);
    return () => clearInterval(interval);
  }, [api, movies.length]);

  if (movies.length === 0) return null

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden group cursor-grab active:cursor-grabbing">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          dragFree: false,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-full ml-0">
          {movies.map((movie, index) => (
            <CarouselItem key={movie._id || index} className="relative h-screen min-h-[600px] pl-0">
              <div className="absolute inset-0">
                <Image 
                  src={movie.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&q=80"} 
                  alt={movie.title || "Background"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative container mx-auto px-4 h-full flex items-center pt-16">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6 animate-in slide-in-from-left duration-500">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <span className="text-sm text-primary font-medium">{t('featuredMovie')}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 text-balance animate-in slide-in-from-left duration-700">
                    {movie.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 animate-in slide-in-from-left duration-1000">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{movie.releaseDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{movie.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="text-accent font-semibold">{movie.rating}</span>
                    </div>
                    <span className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground">
                      {movie.genre}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed line-clamp-3 animate-in slide-in-from-left duration-1000 delay-150">
                    {movie.description}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom duration-1000 delay-300">
                    <Link href={`/movie/${movie._id || movie.id}`} className="z-10 pointer-events-auto">
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 transition-transform hover:scale-105 active:scale-95">
                        <Play className="h-5 w-5 fill-current" />
                        {t('bookNow')}
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary gap-2 transition-transform hover:scale-105 active:scale-95 z-10 pointer-events-auto">
                      <Play className="h-5 w-5" />
                      {t('watchTrailer')}
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Movie Selector */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {movies.map((movie, index) => (
          <button
            key={movie._id || index}
            onClick={() => api?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? "bg-primary w-8 shadow-[0_0_10px_rgba(255,0,0,0.8)]" 
                : "bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
            aria-label={`Xem ${movie.title || "phim này"}`}
          />
        ))}
      </div>
    </section>
  )
}
