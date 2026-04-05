"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, User as UserIcon, Menu, X, LogOut, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthModal } from "./auth-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/movies?q=${query}`)
      const data = await res.json()
      setSearchResults(data.slice(0, 5)) // Show top 5 results
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">CineMax</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Trang chủ
            </Link>
            <Link href="#now-playing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Phim đang chiếu
            </Link>
            <Link href="#cinemas" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Rạp chiếu
            </Link>
            <Link href="#promotions" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Khuyến mãi
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  className="bg-secondary/50 border border-border rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Search Results Dropdown */}
              {searchQuery.length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {searchResults.map((movie) => (
                        <Link 
                          key={movie._id} 
                          href={`/movie/${movie._id}`}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group"
                        >
                          <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
                            <img src={movie.image} alt={movie.title} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{movie.title}</p>
                            <p className="text-xs text-muted-foreground">{movie.genre}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Không tìm thấy phim nào
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 gap-2 px-2 hover:bg-secondary">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
                    Tài khoản cá nhân
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer text-primary font-bold hover:bg-primary/10">
                        Quản trị hệ thống
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
                      Lịch sử đặt vé
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    className="border-border text-foreground hover:bg-secondary"
                    onClick={() => setIsAuthModalOpen(true)}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
                <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    onClick={() => setIsAuthModalOpen(true)}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                Trang chủ
              </Link>
              <Link href="#now-playing" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Phim đang chiếu
              </Link>
              <Link href="#cinemas" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Rạp chiếu
              </Link>
              <Link href="#promotions" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2">
                Khuyến mãi
              </Link>
              
              <div className="flex gap-3 pt-4 border-t border-border">
                {user ? (
                   <Button variant="ghost" className="flex-1 justify-start gap-2" onClick={logout}>
                     <LogOut className="h-4 w-4" />
                     Đăng xuất ({user.name})
                   </Button>
                ) : (
                  <>
                    <Button 
                        variant="outline" 
                        className="flex-1 border-border text-foreground"
                        onClick={() => {
                            setIsAuthModalOpen(true)
                            setIsMenuOpen(false)
                        }}
                    >
                      Đăng nhập
                    </Button>
                    <Button 
                        className="flex-1 bg-primary text-primary-foreground"
                        onClick={() => {
                            setIsAuthModalOpen(true)
                            setIsMenuOpen(false)
                        }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  )
}
