"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MovieCard } from "@/components/movie-card"
import { Loader2, Heart, Ticket } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WatchlistPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [movies, setMovies] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchWatchlist = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/user/watchlist")
            const data = await res.json()
            if (res.ok) {
                setMovies(data)
            }
        } catch (error) {
            console.error("Failed to fetch watchlist:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchWatchlist()
        }
    }, [user])

    if (authLoading) return null

    if (!user) {
        return (
            <main className="min-h-screen bg-background">
                <Header />
                <div className="container mx-auto px-4 py-32 text-center">
                    <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
                    <p className="text-muted-foreground mb-8">Bạn cần đăng nhập để xem danh sách phim yêu thích.</p>
                    <Link href="/">
                        <Button>Quay lại trang chủ</Button>
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            
            <div className="container mx-auto px-4 py-12 pt-28">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight flex items-center gap-3">
                                <Heart className="h-10 w-10 text-primary fill-primary" />
                                PHIM YÊU THÍCH
                            </h1>
                            <p className="text-muted-foreground">Danh sách những bộ phim bạn đã lưu để xem sau</p>
                        </div>
                        <Link href="/movie">
                            <Button variant="outline" className="rounded-xl">Khám phá thêm phim</Button>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Đang tải danh sách...</p>
                        </div>
                    ) : movies.length > 0 ? (
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
                    ) : (
                        <div className="py-20 text-center space-y-4 bg-secondary/20 rounded-3xl border border-dashed border-border">
                            <Heart className="h-16 w-16 text-muted-foreground mx-auto opacity-20" />
                            <h3 className="text-xl font-bold">Chưa có phim yêu thích</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">Bạn chưa lưu bộ phim nào vào danh sách yêu thích. Hãy khám phá và nhấn vào biểu tượng trái tim để lưu phim nhé!</p>
                            <Link href="/movie" className="inline-block mt-4">
                                <Button className="bg-primary shadow-lg shadow-primary/20 rounded-xl px-8 h-12 font-bold">KHÁM PHÁ NGAY</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
