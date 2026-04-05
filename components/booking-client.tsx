"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Calendar, Clock, Armchair, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

interface BookingClientProps {
  movie: any
  cinema: string
  time: string
  date: string
}

export function BookingClient({ movie, cinema, time, date }: BookingClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ 
    name: user?.name || "", 
    phone: "" 
  })

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seatsPerRow = 12
  const vipRows = ['E', 'F']
  const priceStandard = 80000
  const priceVIP = 120000

  // Mock occupied seats
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])

  useEffect(() => {
    // Generate some random occupied seats on mount
    const randomOccupied = []
    for (let i = 0; i < 15; i++) {
        const row = rows[Math.floor(Math.random() * rows.length)]
        const num = Math.floor(Math.random() * seatsPerRow) + 1
        randomOccupied.push(`${row}${num}`)
    }
    setOccupiedSeats(randomOccupied)
  }, [])

  useEffect(() => {
    if (user && !customerInfo.name) {
      setCustomerInfo(prev => ({ ...prev, name: user.name }))
    }
  }, [user])

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    )
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId[0]
      return total + (vipRows.includes(row) ? priceVIP : priceStandard)
    }, 0)
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế")
      return
    }
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Vui lòng nhập đầy đủ thông tin cá nhân")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie: movie.title,
          cinema,
          date,
          time,
          seats: selectedSeats,
          totalPrice: calculateTotal(),
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          userEmail: user?.email || ''
        })
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        alert("Có lỗi xảy ra. Vui lòng thử lại.")
      }
    } catch (error) {
      alert("Lỗi kết nối server")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border p-12 rounded-3xl text-center max-w-md shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Đặt vé thành công!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Mã vé đã được gửi tới số điện thoại <strong>{customerInfo.phone}</strong>. Cảm ơn bạn đã lựa chọn CineMax.
          </p>
          <Link href="/">
            <Button className="w-full h-12 text-lg">Quay về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link 
          href={`/movie/${movie._id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại thông tin phim
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Seat Map */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              {/* Screen */}
              <div className="relative w-full h-2 bg-primary/30 rounded-full mb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-transparent blur-md" />
                <p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground uppercase tracking-[0.5em]">
                  Màn hình
                </p>
              </div>

              {/* Seats Grid */}
              <div className="flex flex-col items-center gap-4 overflow-x-auto pb-4">
                {rows.map(row => (
                  <div key={row} className="flex gap-2 items-center">
                    <span className="w-6 text-xs font-bold text-muted-foreground">{row}</span>
                    <div className="flex gap-2">
                        {Array.from({ length: seatsPerRow }).map((_, i) => {
                          const seatNum = i + 1
                          const seatId = `${row}${seatNum}`
                          const isOccupied = occupiedSeats.includes(seatId)
                          const isSelected = selectedSeats.includes(seatId)
                          const isVIP = vipRows.includes(row)

                          return (
                            <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId)}
                                disabled={isOccupied}
                                className={`
                                    w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[10px] font-bold transition-all
                                    ${isOccupied ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50' :
                                      isSelected ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' :
                                      isVIP ? 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/40' :
                                      'bg-card border border-border hover:border-primary text-muted-foreground'}
                                `}
                            >
                                {seatNum}
                            </button>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-12 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-card border border-border" />
                  <span className="text-xs text-muted-foreground">Thường</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-accent/20 border border-accent/30" />
                  <span className="text-xs text-muted-foreground">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">Đang chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-secondary opacity-50" />
                  <span className="text-xs text-muted-foreground">Đã đặt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Info */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-secondary/30">
                    <div className="flex gap-4">
                        <div className="aspect-[2/3] w-20 relative rounded-lg overflow-hidden shrink-0 shadow-md">
                            <Image src={movie.image} alt={movie.title} fill className="object-cover" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl mb-1">{movie.title}</h2>
                            <p className="text-sm text-primary font-medium">{movie.genre}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{cinema}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground">Ghế chọn:</span>
                            <span className="font-bold text-primary">{selectedSeats.join(', ') || 'Chưa chọn'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Tổng tiền:</span>
                            <span className="text-2xl font-bold text-primary">
                                {calculateTotal().toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-secondary/10 border-t border-border space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Họ tên</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none"
                            placeholder="Nguyễn Văn A"
                            value={customerInfo.name}
                            onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Số điện thoại</label>
                        <input 
                            type="tel" 
                            className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:border-primary outline-none"
                            placeholder="0123.456.789"
                            value={customerInfo.phone}
                            onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>
                    <Button 
                        className="w-full h-12 text-lg font-bold mt-4" 
                        disabled={selectedSeats.length === 0 || isSubmitting}
                        onClick={handleBooking}
                    >
                        {isSubmitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : null}
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
