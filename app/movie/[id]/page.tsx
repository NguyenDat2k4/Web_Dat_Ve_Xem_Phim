import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Star, Clock, Calendar, Play, MapPin, Ticket, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ShowtimeSelector } from "@/components/showtime-selector"
import { MovieReviews } from "@/components/movie-reviews"

async function getMovie(id: string) {
  const res = await fetch(`http://localhost:3000/api/movies/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = await getMovie(id)
  if (!movie) notFound()

  const getYoutubeId = (url: string) => {
    if (!url) return ""
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : url
  }

  const trailerId = getYoutubeId(movie.trailerUrl)

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            {/* Poster */}
            <div className="hidden md:block w-64 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl border border-border/50">
              <Image src={movie.image} alt={movie.title} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.isComingSoon ? (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Sắp chiếu
                  </span>
                ) : (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Đang chiếu
                  </span>
                )}
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {movie.genre}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span className="text-xl font-bold text-foreground">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{movie.releaseDate || '2026'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Synopsis & Trailer */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Play className="h-6 w-6 text-primary" />
                  Nội dung phim
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {trailerId && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Play className="h-6 w-6 text-primary" />
                    Trailer
                  </h2>
                  <div className="aspect-video bg-secondary rounded-2xl overflow-hidden border border-border shadow-lg group relative">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${trailerId}?autoplay=0`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Showtime Selector */}
            <div className="space-y-8">
              <ShowtimeSelector movieId={movie._id} />

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-bold text-primary mb-2">Lưu ý:</h3>
                <p className="text-sm text-primary/80">
                  Vui lòng có mặt tại rạp ít nhất 15 phút trước giờ chiếu để nhận vé. Giá vé có thể thay đổi tùy theo loại ghế và định dạng phòng chiếu (2D/3D).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-secondary/5 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <MovieReviews movieId={movie._id} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
