"use client"

import { useState } from "react"
import { MovieCard } from "@/components/movie-card"
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

interface ComingSoonSectionProps {
  movies: any[]
}

export function ComingSoonSection({ movies = [] }: ComingSoonSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const totalPages = Math.ceil(movies.length / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      const element = document.getElementById("coming-soon")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const displayedMovies = movies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <section id="coming-soon" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Phim sắp chiếu
            </h2>
            <p className="text-muted-foreground">
              Đừng bỏ lỡ những bộ phim hấp dẫn sắp ra mắt
            </p>
          </div>
          <Link href="/movie?status=coming-soon">
            <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10">
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie._id || movie.id}
              _id={movie._id || movie.id}
              title={movie.title}
              image={movie.image}
              rating={movie.rating}
              duration={movie.duration}
              genre={movie.genre}
              isComingSoon
              releaseDate={movie.releaseDate}
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
          <Link href="/movie?status=coming-soon">
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

