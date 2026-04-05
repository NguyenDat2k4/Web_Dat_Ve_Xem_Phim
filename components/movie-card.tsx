import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Clock, Play } from "lucide-react"

interface MovieCardProps {
  id?: string
  _id?: string
  title: string
  image: string
  rating: number
  duration: string
  genre: string
  isComingSoon?: boolean
  releaseDate?: string
}

export function MovieCard({ 
  id,
  _id,
  title, 
  image, 
  rating, 
  duration, 
  genre, 
  isComingSoon = false,
  releaseDate 
}: MovieCardProps) {
  const movieId = _id || id

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
      {/* Poster */}
      <Link href={`/movie/${movieId}`} className="relative aspect-[2/3] block overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="h-3 w-3 text-accent fill-accent" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>

        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
            Sắp chiếu
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/movie/${movieId}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="truncate">{genre}</span>
        </div>

        {isComingSoon && releaseDate ? (
          <div className="text-sm text-primary font-medium">
            Khởi chiếu: {releaseDate}
          </div>
        ) : (
          <Link href={`/movie/${movieId}`} className="block">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Đặt vé
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
