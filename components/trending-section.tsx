"use client"

import { TrendingUp, Flame } from "lucide-react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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

interface TrendingSectionProps {
  movies: Movie[]
}

export function TrendingSection({ movies }: TrendingSectionProps) {
  if (!movies || movies.length === 0) return null

  // Lấy top 10 phim đang hot nhất
  const hotMovies = movies.slice(0, 10)

  return (
    <section className="pt-10 pb-20 bg-background relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 pl-4 md:pl-12">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm">
                        <Flame className="h-4 w-4 fill-current" />
                        Đang làm mưa làm gió
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        Top 10 Phim Đang Hot
                    </h2>
                </div>
            </div>

            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-6">
                {hotMovies.map((movie, index) => (
                  <CarouselItem key={movie._id} className="pl-2 md:pl-6 basis-[45%] md:basis-[28%] lg:basis-[20%]">
                    <div className="relative w-full pt-8 pb-4 flex justify-end group">
                        {/* Huge Number - Netflix style */}
                        <div 
                          className="absolute left-[-20px] md:left-[-30px] bottom-[-5px] md:bottom-[-10px] z-30 pointer-events-none font-black text-[140px] md:text-[220px] leading-none select-none tracking-tighter drop-shadow-md netflix-number"
                        >
                          {index + 1}
                        </div>
                        
                        {/* Movie Poster */}
                        <Link href={`/movie/${movie._id}`} className="block relative z-20 w-[85%] md:w-[85%] aspect-[2/3] rounded-md md:rounded-xl overflow-hidden border-2 border-transparent group-hover:border-primary/50 transition-all ml-auto shadow-2xl group-hover:shadow-primary/20 bg-secondary group-hover:-translate-y-2">
                           <Image
                              src={movie.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"}
                              alt={movie.title}
                              fill
                              className="object-cover"
                           />
                           
                           {/* Netflix "N" style logo (Optional visual flair) */}
                           <div className="absolute top-2 left-2 md:top-3 md:left-3 z-30">
                              <span className="text-primary font-black text-xl md:text-2xl drop-shadow-md">C</span>
                           </div>

                           <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <span className="font-bold text-sm md:text-base line-clamp-2 text-foreground drop-shadow-lg">{movie.title}</span>
                           </div>
                        </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-12" />
                <CarouselNext className="-right-12" />
              </div>
            </Carousel>
        </div>
    </section>
  )
}
