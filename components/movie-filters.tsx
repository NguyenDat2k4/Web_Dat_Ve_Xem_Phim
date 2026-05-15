"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
    Search, 
    Filter, 
    ChevronDown, 
    Star, 
    Film, 
    Calendar,
    X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface MovieFiltersProps {
    onFilterChange: (filters: any) => void
}

const GENRES = ["Tất cả", "Hành động", "Hài hước", "Kinh dị", "Tình cảm", "Hoạt hình", "Khoa học viễn tưởng", "Phiêu lưu"]
const RATINGS = [
    { label: "Trên 4 sao", value: "4" },
    { label: "Trên 3 sao", value: "3" },
    { label: "Tất cả", value: "" },
]
const STATUSES = [
    { label: "Đang chiếu", value: "now-playing" },
    { label: "Sắp chiếu", value: "coming-soon" },
    { label: "Tất cả", value: "" },
]

export function MovieFilters({ onFilterChange }: MovieFiltersProps) {
    const [activeGenre, setActiveGenre] = useState("Tất cả")
    const [activeRating, setActiveRating] = useState("")
    const [activeStatus, setActiveStatus] = useState("now-playing")
    const [searchQuery, setSearchQuery] = useState("")

    const handleFilterChange = (updates: any) => {
        const newFilters = {
            genre: updates.genre !== undefined ? updates.genre : activeGenre,
            rating: updates.rating !== undefined ? updates.rating : activeRating,
            status: updates.status !== undefined ? updates.status : activeStatus,
            q: updates.q !== undefined ? updates.q : searchQuery
        }
        
        if (updates.genre !== undefined) setActiveGenre(updates.genre)
        if (updates.rating !== undefined) setActiveRating(updates.rating)
        if (updates.status !== undefined) setActiveStatus(updates.status)
        if (updates.q !== undefined) setSearchQuery(updates.q)

        onFilterChange(newFilters)
    }

    const clearFilters = () => {
        setActiveGenre("Tất cả")
        setActiveRating("")
        setActiveStatus("now-playing")
        setSearchQuery("")
        onFilterChange({ genre: "Tất cả", rating: "", status: "now-playing", q: "" })
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Tìm tên phim, thể loại..." 
                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => handleFilterChange({ q: e.target.value })}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl border-border gap-2">
                                <Calendar className="h-4 w-4" />
                                {STATUSES.find(s => s.value === activeStatus)?.label}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-border min-w-[150px]">
                            {STATUSES.map(status => (
                                <DropdownMenuItem 
                                    key={status.value}
                                    onClick={() => handleFilterChange({ status: status.value })}
                                    className={activeStatus === status.value ? "text-primary font-bold" : ""}
                                >
                                    {status.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Rating Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-xl border-border gap-2">
                                <Star className="h-4 w-4" />
                                {activeRating ? RATINGS.find(r => r.value === activeRating)?.label : "Đánh giá"}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-card border-border min-w-[150px]">
                            {RATINGS.map(rating => (
                                <DropdownMenuItem 
                                    key={rating.value}
                                    onClick={() => handleFilterChange({ rating: rating.value })}
                                    className={activeRating === rating.value ? "text-primary font-bold" : ""}
                                >
                                    {rating.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(activeGenre !== "Tất cả" || activeRating !== "" || searchQuery !== "") && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-muted-foreground hover:text-destructive"
                            onClick={clearFilters}
                        >
                            <X className="h-4 w-4 mr-1" /> Xóa lọc
                        </Button>
                    )}
                </div>
            </div>

            {/* Genre Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0 mr-2">Thể loại:</span>
                </div>
                {GENRES.map(genre => (
                    <button
                        key={genre}
                        onClick={() => handleFilterChange({ genre })}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
                            ${activeGenre === genre 
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}
                        `}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    )
}
