"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Film, Calendar, Clock, Search, Loader2, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

const dates = [
  "Hôm nay, 05/04",
  "Thứ 2, 06/04",
  "Thứ 3, 07/04",
  "Thứ 4, 08/04",
  "Thứ 5, 09/04"
]

const times = [
  "10:00",
  "12:30",
  "15:00",
  "17:30",
  "20:00",
  "22:30"
]

interface QuickBookingSectionProps {
  cinemas: any[]
  movies: any[]
}

export function QuickBookingSection({ cinemas = [], movies = [] }: QuickBookingSectionProps) {
  const { user } = useAuth()
  const [selectedCinema, setSelectedCinema] = useState("")
  const [selectedMovie, setSelectedMovie] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleBooking = async () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      alert("Vui lòng chọn đầy đủ thông tin")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cinema: selectedCinema,
          movie: selectedMovie,
          date: selectedDate,
          time: selectedTime,
          userEmail: user?.email || ''
        })
      })

      if (response.ok) {
        setIsSuccess(true)
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSuccess(false)
          setSelectedCinema("")
          setSelectedMovie("")
          setSelectedDate("")
          setSelectedTime("")
        }, 3000)
      } else {
        alert("Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.")
      }
    } catch (error) {
      alert("Lỗi kết nối server")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Đặt vé nhanh
          </h2>
          <p className="text-muted-foreground">
            Chọn rạp, phim, ngày và giờ chiếu để đặt vé ngay
          </p>
        </div>

        <div className="bg-secondary/50 rounded-2xl p-6 md:p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-primary animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Đặt vé thành công!</h3>
              <p className="text-muted-foreground">Cảm ơn bạn đã lựa chọn CineMax.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Cinema Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rạp chiếu
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedCinema}
                    onChange={(e) => setSelectedCinema(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">Chọn rạp</option>
                    {cinemas.map((cinema) => (
                      <option key={cinema._id || cinema.id} value={cinema.name}>{cinema.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Movie Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phim
                </label>
                <div className="relative">
                  <Film className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedMovie}
                    onChange={(e) => setSelectedMovie(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">Chọn phim</option>
                    {movies.map((movie) => (
                      <option key={movie._id || movie.id} value={movie.title}>{movie.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ngày chiếu
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">Chọn ngày</option>
                    {dates.map((date) => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Suất chiếu
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">Chọn giờ</option>
                    {times.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 h-[50px] text-base font-semibold gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  {isSubmitting ? "Đang xử lý..." : "Đặt vé ngay"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
