"use client"

import { useState } from "react"
import { MovieCard } from "@/components/movie-card"
import { MysteryMovieCard } from "@/components/mystery-movie-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface NowPlayingSectionProps {
  movies: any[]
}

export function NowPlayingSection({ movies = [] }: NowPlayingSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Trang 1 hiện 1 MysteryMovieCard + 11 Phim. Các trang sau hiện 12 Phim.
  const moviesPerPageFirstPage = 11
  const moviesPerPageSubsequentPages = 12

  const totalPages = movies.length <= moviesPerPageFirstPage
    ? 1
    : 1 + Math.ceil((movies.length - moviesPerPageFirstPage) / moviesPerPageSubsequentPages)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      const element = document.getElementById("now-playing")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const displayedMovies = currentPage === 1
    ? movies.slice(0, moviesPerPageFirstPage)
    : movies.slice(
        moviesPerPageFirstPage + (currentPage - 2) * moviesPerPageSubsequentPages,
        moviesPerPageFirstPage + (currentPage - 1) * moviesPerPageSubsequentPages
      )

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
          <Link href="/movie?status=now-playing">
            <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10">
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {/* Mystery Ticket Featured Card (chỉ hiện ở trang 1) */}
          {currentPage === 1 && <MysteryMovieCard />}

          {displayedMovies.map((movie) => (
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

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(i + 1)
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/movie?status=now-playing">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              Xem tất cả
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

