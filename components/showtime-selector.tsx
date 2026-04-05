"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Ticket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ShowtimeSelectorProps {
  movieId: string
}

export function ShowtimeSelector({ movieId }: ShowtimeSelectorProps) {
  const [showtimes, setShowtimes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await fetch(`/api/showtimes?movieId=${movieId}`)
        const data = await res.json()
        setShowtimes(data)
        
        // Pick the first available date as default
        if (data.length > 0) {
          const dates = Array.from(new Set(data.map((st: any) => st.date))).sort() as string[]
          setSelectedDate(dates[0])
        }
      } catch (error) {
        console.error("Failed to fetch showtimes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShowtimes()
  }, [movieId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Đang tìm lịch chiếu...</p>
      </div>
    )
  }

  if (showtimes.length === 0) {
    return (
      <div className="p-8 text-center bg-secondary/30 rounded-2xl border border-dashed border-border mt-8">
        <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Hiện tại chưa có lịch chiếu cho phim này.</p>
        <p className="text-[10px] text-muted-foreground">Vui lòng quay lại sau hoặc chọn phim khác.</p>
      </div>
    )
  }

  const uniqueDates = Array.from(new Set(showtimes.map(st => st.date))).sort() as string[]
  const filteredShowtimes = showtimes.filter(st => st.date === selectedDate)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Lịch chiếu
        </h2>
        <div className="flex gap-2 overflow-x-auto max-w-[50%] no-scrollbar">
            {uniqueDates.map((date) => (
                <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedDate === date 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                >
                    {date}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-8">
        {filteredShowtimes.map((st: any) => (
          <div key={st._id} className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">{st.cinema?.name}</h3>
                <p className="text-xs text-muted-foreground">{st.cinema?.address}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {st.times.map((time: string) => (
                <Link 
                  key={time} 
                  href={`/booking/${movieId}?cinema=${encodeURIComponent(st.cinema.name)}&time=${time}&date=${encodeURIComponent(st.date)}&price=${st.price}&room=${st.room?._id || ""}`}

                  className="group"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-12 flex flex-col gap-0.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group-hover:scale-105 duration-300"
                  >
                    <span className="text-sm font-bold">{time}</span>
                    <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">{st.price.toLocaleString()}đ</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
