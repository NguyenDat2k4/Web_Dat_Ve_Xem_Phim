import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface NowPlayingSectionProps {
  movies: any[]
}

export function NowPlayingSection({ movies = [] }: NowPlayingSectionProps) {
  return (
    <section id="now-playing" className="py-16 md:py-24 bg-background">

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Phim đang chiếu
            </h2>
            <p className="text-muted-foreground">
              Khám phá những bộ phim hot nhất hiện nay
            </p>
          </div>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10">
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id || movie.id}
              _id={movie._id || movie.id}
              title={movie.title}
              image={movie.image}
              rating={movie.rating}
              duration={movie.duration}
              genre={movie.genre}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
            Xem tất cả
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
