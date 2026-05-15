"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MovieFilters } from "@/components/movie-filters"
import { MovieCard } from "@/components/movie-card"
import { Loader2, Ticket } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function MovieDiscoveryPage() {
    const [movies, setMovies] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filters, setFilters] = useState({
        status: "now-playing",
        genre: "Tất cả",
        rating: "",
        q: ""
    })

    const fetchMovies = async (currentFilters: any, currentPage: number) => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (currentFilters.status) params.append("status", currentFilters.status)
            if (currentFilters.genre && currentFilters.genre !== "Tất cả") params.append("genre", currentFilters.genre)
            if (currentFilters.rating) params.append("rating", currentFilters.rating)
            if (currentFilters.q) params.append("q", currentFilters.q)
            
            // Thêm params phân trang (giới hạn 30 phim mỗi trang, tương đương lưới 6x5)
            params.append("page", currentPage.toString())
            params.append("limit", "30")

            const res = await fetch(`/api/movies?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                // Do chúng ta truyền 'page', API sẽ trả về cấu trúc phân trang mới
                setMovies(data.movies || [])
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages || 1)
                }
            }
        } catch (error) {
            console.error("Failed to fetch movies:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Mỗi khi filter thay đổi, quay về trang 1
    useEffect(() => {
        setPage(1)
    }, [filters])

    // Gọi API mỗi khi page hoặc filters thay đổi
    useEffect(() => {
        fetchMovies(filters, page)
    }, [filters, page])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            
            <div className="container mx-auto px-4 py-12 pt-28">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">KHÁM PHÁ ĐIỆN ẢNH</h1>
                        <p className="text-muted-foreground">Tìm kiếm và lọc những bộ phim đang hot nhất tại CineMax</p>
                    </div>

                    <MovieFilters onFilterChange={setFilters} />

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Đang tìm phim cho bạn...</p>
                        </div>
                    ) : movies.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {movies.map((movie) => (
                                    <MovieCard
                                        key={movie._id}
                                        _id={movie._id}
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
                                <div className="mt-12">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page - 1) }} 
                                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            
                                            {[...Array(totalPages)].map((_, i) => {
                                                if (
                                                    i === 0 || 
                                                    i === totalPages - 1 || 
                                                    (i >= page - 2 && i <= page)
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationLink 
                                                                href="#" 
                                                                isActive={page === i + 1}
                                                                onClick={(e) => { e.preventDefault(); handlePageChange(i + 1) }}
                                                            >
                                                                {i + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    )
                                                }
                                                if (i === 1 && page > 3) return <PaginationEllipsis key={i} />
                                                if (i === totalPages - 2 && page < totalPages - 2) return <PaginationEllipsis key={i} />
                                                return null
                                            })}

                                            <PaginationItem>
                                                <PaginationNext 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page + 1) }}
                                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center space-y-4 bg-secondary/20 rounded-3xl border border-dashed border-border">
                            <Ticket className="h-16 w-16 text-muted-foreground mx-auto opacity-20" />
                            <h3 className="text-xl font-bold">Không tìm thấy phim nào</h3>
                            <p className="text-muted-foreground">Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
