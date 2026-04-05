"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Calendar, Clock, Armchair, ChevronLeft, Loader2, CheckCircle2, CreditCard, Smartphone, QrCode, ShieldCheck, Coins, AlertCircle, Soup } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { QRCodeSVG } from "qrcode.react"


interface BookingClientProps {
  movie: any
  cinema: string
  time: string
  date: string
  basePrice: number
  roomId?: string
}


export function BookingClient({ movie, cinema, time, date, basePrice, roomId }: BookingClientProps) {

  const router = useRouter()
  const { user, login, refreshUser } = useAuth()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [bookingStep, setBookingStep] = useState<'seats' | 'combos' | 'payment'>('seats')
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay' | 'card'>('momo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successBooking, setSuccessBooking] = useState<any>(null)

  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [usePoints, setUsePoints] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ 
    name: user?.name || "", 
    phone: "" 
  })

  const [availableCombos, setAvailableCombos] = useState<any[]>([])
  const [selectedCombos, setSelectedCombos] = useState<{[key: string]: number}>({})

  // Seating Info
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [dbSeats, setDbSeats] = useState<any[]>([])
  const [isSeatingLoading, setIsSeatingLoading] = useState(false)

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seatsPerRow = 12
  const vipRows = ['E', 'F']
  const priceStandard = basePrice
  const priceVIP = Math.round(basePrice * 1.5)
  const priceCouple = Math.round(basePrice * 2) // Per couple seat (2 persons)


  // Fetch Seats and Occupied Status
  useEffect(() => {
    const fetchSeatingData = async () => {
        setIsSeatingLoading(true)
        try {
            // 1. Fetch Room Layout if roomId exists
            if (roomId) {
                const res = await fetch(`/api/seats/${roomId}`)
                if (res.ok) {
                    const data = await res.json()
                    setDbSeats(data)
                }
            }

            // 2. Fetch Real Occupied Seats from existing bookings
            const occRes = await fetch(`/api/bookings/check-occupied?cinema=${encodeURIComponent(cinema)}&movie=${encodeURIComponent(movie.title)}&date=${encodeURIComponent(date)}&time=${time}`)
            if (occRes.ok) {
                const data = await occRes.json()
                setOccupiedSeats(data.occupiedSeats || [])
            } else {
                // Fallback to random if API fails
                const randomOccupied = []
                const targetRows = roomId ? [] : rows
                if (!roomId) {
                    for (let i = 0; i < 15; i++) {
                        const row = rows[Math.floor(Math.random() * rows.length)]
                        const num = Math.floor(Math.random() * seatsPerRow) + 1
                        randomOccupied.push(`${row}${num}`)
                    }
                    setOccupiedSeats(randomOccupied)
                }
            }
        } catch (error) {
            console.error("Failed to fetch seating data:", error)
        } finally {
            setIsSeatingLoading(false)
        }
    }
    fetchSeatingData()
  }, [roomId, cinema, movie.title, date, time])



  useEffect(() => {
    const fetchCombos = async () => {
        try {
            const res = await fetch("/api/combos")
            const data = await res.json()
            if (res.ok) setAvailableCombos(data)
        } catch (error) {
            console.error("Failed to fetch combos")
        }
    }
    fetchCombos()
  }, [])

  useEffect(() => {
    if (user && !customerInfo.name) {
      setCustomerInfo(prev => ({ ...prev, name: user.name }))
    }
  }, [user, customerInfo.name])


  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    )
  }

  const handleComboChange = (comboId: string, delta: number) => {
    setSelectedCombos(prev => {
        const currentQty = prev[comboId] || 0
        const nextQty = Math.max(0, currentQty + delta)
        return { ...prev, [comboId]: nextQty }
    })
  }

  const calculateSubtotal = () => {
    const seatsTotal = selectedSeats.reduce((total, seatId) => {
      // Priority: Check DB seats first for pricing
      const dbSeat = dbSeats.find(s => `${s.row}${s.number}` === seatId)
      if (dbSeat) {
          if (dbSeat.type === 'vip') return total + priceVIP
          if (dbSeat.type === 'couple') return total + priceCouple
          return total + priceStandard
      }
      
      // Fallback to row-based pricing for legacy rooms
      const row = seatId[0]
      return total + (vipRows.includes(row) ? priceVIP : priceStandard)
    }, 0)


    const combosTotal = Object.entries(selectedCombos).reduce((total, [id, qty]) => {
        const combo = availableCombos.find(c => c._id === id)
        return total + (combo ? combo.price * qty : 0)
    }, 0)

    return seatsTotal + combosTotal
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    let discount = 0
    if (appliedPromo) discount += appliedPromo.discountAmount
    if (usePoints && (user?.points || 0) >= 10000) {
      discount += (user?.points || 0)
    }
    return Math.max(0, subtotal - discount)
  }

  const applyPromoCode = async () => {
    if (!promoCode) return
    setIsApplyingPromo(true)
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, totalAmount: calculateSubtotal() }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppliedPromo(data)
        setPromoCode("")
      } else {
        alert(data.error || "Mã không hợp lệ")
      }
    } catch (error) {
      alert("Lỗi kết nối")
    } finally {
      setIsApplyingPromo(false)
    }
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
    // Simulate payment delay
    setTimeout(async () => {
        try {
          // Prepare combos for saving
          const formattedCombos = Object.entries(selectedCombos)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => {
              const combo = availableCombos.find(c => c._id === id)
              return {
                name: combo?.name || "Unknown Combo",
                price: combo?.price || 0,
                quantity: qty
              }
            })

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
              discountAmount: appliedPromo?.discountAmount || 0,
              promoCode: appliedPromo?.code || null,
              pointsUsed: usePoints ? (user?.points || 0) : 0,
              combos: formattedCombos,
              customerName: customerInfo.name,
              customerPhone: customerInfo.phone,
              userEmail: user?.email || '',
              paymentMethod,
              status: 'paid'
            })
          })
    
          const data = await response.json()
          if (response.ok) {
            setSuccessBooking(data.booking)

            if (data.user) {
                const updatedUser = { ...data.user, id: data.user._id }
                login(updatedUser)
            } else {
                refreshUser()
            }
          } else {
            alert(data.error || "Có lỗi xảy ra. Vui lòng thử lại.")
          }
        } catch (error) {
          alert("Lỗi kết nối server")
        } finally {
          setIsSubmitting(false)
        }
    }, 2000)
  }

  if (successBooking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-3xl text-center max-w-md shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Thành công!</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Mã vé đã được gửi tới số: <strong>{customerInfo.phone}</strong>
          </p>

          <div className="flex flex-col items-center mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
                  <QRCodeSVG 
                      value={JSON.stringify({
                          id: successBooking._id,
                          code: successBooking.ticketCode,
                          movie: movie.title
                      })} 
                      size={180}
                      level="H"
                  />
              </div>
              <p className="text-2xl font-black tracking-widest text-primary">
                  {successBooking.ticketCode}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Mã vé điện tử của bạn</p>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-6 mb-8 text-left space-y-2 text-sm border border-border/50">
            <div className="flex justify-between"><span className="text-muted-foreground">Phim:</span><span className="font-bold">{movie.title}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Suất chiếu:</span><span className="font-bold">{time} • {date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ghế:</span><span className="font-bold text-primary">{selectedSeats.join(', ')}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2 font-bold"><span>Tổng thanh toán:</span><span className="text-primary text-lg">{calculateTotal().toLocaleString()}đ</span></div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>In vé</Button>
            <Link href="/profile" className="flex-1">
                <Button className="w-full">Trang cá nhân</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }


  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
            <Link 
              href={`/movie/${movie._id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại thông tin phim
            </Link>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${bookingStep === 'seats' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${bookingStep === 'seats' ? 'bg-primary border-primary text-white' : 'border-muted-foreground'} text-xs font-bold`}>1</div>
                    <span className="hidden md:inline text-sm font-bold">Chọn ghế</span>
                </div>
                <div className="w-4 h-px bg-border" />
                <div className={`flex items-center gap-2 ${bookingStep === 'combos' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${bookingStep === 'combos' ? 'bg-primary border-primary text-white' : 'border-muted-foreground'} text-xs font-bold`}>2</div>
                    <span className="hidden md:inline text-sm font-bold">Bắp nước</span>
                </div>
                <div className="w-4 h-px bg-border" />
                <div className={`flex items-center gap-2 ${bookingStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${bookingStep === 'payment' ? 'bg-primary border-primary text-white' : 'border-muted-foreground'} text-xs font-bold`}>3</div>
                    <span className="hidden md:inline text-sm font-bold">Thanh toán</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {bookingStep === 'seats' ? (
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm animate-in slide-in-from-left duration-500">
                    <div className="relative w-full h-2 bg-primary/30 rounded-full mb-16 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-transparent blur-md" />
                        <p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground uppercase tracking-[0.5em]">
                            Màn hình
                        </p>
                    </div>

                    {isSeatingLoading ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Đang chuẩn bị sơ đồ phòng...</p>
                        </div>
                    ) : dbSeats.length > 0 ? (
                        /* Dynamic Grid from DB */
                        <div className="flex flex-col items-center gap-4 overflow-x-auto pb-4 w-full">
                            <div className="inline-grid gap-2" style={{ 
                                gridTemplateColumns: `repeat(${Math.max(...dbSeats.map(s => s.x)) + 1}, minmax(0, 1fr))` 
                            }}>
                                {Array.from({ length: Math.max(...dbSeats.map(s => s.y)) + 1 }).map((_, y) => (
                                    Array.from({ length: Math.max(...dbSeats.map(s => s.x)) + 1 }).map((_, x) => {
                                        const seat = dbSeats.find(s => s.x === x && s.y === y)
                                        if (!seat) return <div key={`${y}-${x}`} className="w-8 h-8" />
                                        
                                        const seatId = `${seat.row}${seat.number}`
                                        const isOccupied = occupiedSeats.includes(seatId) || seat.status === 'maintenance'
                                        const isSelected = selectedSeats.includes(seatId)
                                        
                                        return (
                                            <button
                                                key={seatId}
                                                onClick={() => toggleSeat(seatId)}
                                                disabled={isOccupied}
                                                className={`
                                                    w-8 h-8 rounded-lg flex flex-col items-center justify-center text-[8px] font-black transition-all group relative
                                                    ${isOccupied ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-30 shadow-inner' :
                                                    isSelected ? 'bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/40 z-10' :
                                                    seat.type === 'vip' ? 'bg-accent/20 text-accent border-2 border-accent/40 hover:bg-accent/40' :
                                                    seat.type === 'couple' ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500/40 hover:bg-rose-500/40 w-18 w-full col-span-1' :
                                                    'bg-card border border-border hover:border-primary text-muted-foreground/60'}
                                                `}
                                            >
                                                <Armchair className={`h-3 w-3 mb-0.5 ${isSelected ? 'animate-pulse' : ''}`} />
                                                {seatId}
                                                {seat.type === 'couple' && <div className="absolute -bottom-1 -right-1 bg-rose-500 rounded-full w-2 h-2" />}
                                            </button>
                                        )
                                    })
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Fallback Hardcoded Grid */
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
                    )}


                    <div className="mt-12 flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-card border border-border" /><span className="text-xs text-muted-foreground font-medium">Thường</span></div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-accent/20 border border-accent/40" /><span className="text-xs text-muted-foreground font-medium">VIP</span></div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-rose-500/20 border border-rose-500/40" /><span className="text-xs text-muted-foreground font-medium">Couple</span></div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-primary shadow-sm" /><span className="text-xs text-muted-foreground font-medium">Đang chọn</span></div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-secondary opacity-30 shadow-inner" /><span className="text-xs text-muted-foreground font-medium">Đã đặt / Bảo trì</span></div>
                    </div>

                </div>
            ) : bookingStep === 'combos' ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Soup className="h-5 w-5 text-primary" />
                            Chọn thêm Bắp & Nước
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableCombos.map(combo => (
                                <div key={combo._id} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/30 transition-all group">
                                    <div className="w-20 h-20 relative rounded-xl overflow-hidden shadow-sm shrink-0">
                                        <Image src={combo.image} alt={combo.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm truncate">{combo.name}</h4>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{combo.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm font-black text-primary">{combo.price.toLocaleString()}đ</span>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleComboChange(combo._id, -1)}
                                                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-xs"
                                                    disabled={!selectedCombos[combo._id]}
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center">{selectedCombos[combo._id] || 0}</span>
                                                <button 
                                                    onClick={() => handleComboChange(combo._id, 1)}
                                                    className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-xs"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Chọn phương thức thanh toán
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setPaymentMethod('momo')}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${paymentMethod === 'momo' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-secondary/30 border-border opacity-60 hover:opacity-100'}`}
                            >
                                <Smartphone className={`h-8 w-8 mb-3 ${paymentMethod === 'momo' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-bold text-sm">Ví Momo</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('vnpay')}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${paymentMethod === 'vnpay' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-secondary/30 border-border opacity-60 hover:opacity-100'}`}
                            >
                                <QrCode className={`h-8 w-8 mb-3 ${paymentMethod === 'vnpay' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-bold text-sm">VNPay QR</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-secondary/30 border-border opacity-60 hover:opacity-100'}`}
                            >
                                <CreditCard className={`h-8 w-8 mb-3 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-bold text-sm">Thẻ ATM</span>
                            </button>
                        </div>

                        {(paymentMethod === 'momo' || paymentMethod === 'vnpay') && (
                            <div className="mt-8 p-8 bg-secondary/20 rounded-3xl border border-dashed border-border flex flex-col items-center">
                                <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
                                    <div className="w-48 h-48 bg-secondary/10 flex items-center justify-center text-secondary">
                                        <QrCode className="h-40 w-40" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-center max-w-xs">
                                    Mở ứng dụng {paymentMethod.toUpperCase()} và quét mã QR để hoàn tất thanh toán.
                                </p>
                            </div>
                        )}
                        
                        {paymentMethod === 'card' && (
                            <div className="mt-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground">SỐ THẺ</label>
                                        <input className="w-full px-4 py-3 rounded-xl bg-input border border-border" placeholder="XXXX XXXX XXXX XXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground">TÊN CHỦ THẺ</label>
                                        <input className="w-full px-4 py-3 rounded-xl bg-input border border-border" placeholder="NGUYEN VAN A" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                            <MapPin className="h-4 w-4 text-primary/50" />
                            <span>{cinema}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary/50" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary/50" />
                            <span>{time}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Tạm tính:</span>
                            <span className="font-bold">{calculateSubtotal().toLocaleString()}đ</span>
                        </div>
                        {appliedPromo && (
                            <div className="flex justify-between text-sm mb-1 text-emerald-500 font-medium">
                                <span>Giảm giá ({appliedPromo.code}):</span>
                                <span>-{appliedPromo.discountAmount.toLocaleString()}đ</span>
                            </div>
                        )}
                        {usePoints && (user?.points || 0) >= 10000 && (
                            <div className="flex justify-between text-sm mb-1 text-emerald-500 font-medium">
                                <span>Dùng điểm thưởng:</span>
                                <span>-{(user?.points || 0).toLocaleString()}đ</span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-muted-foreground text-sm">Ghế chọn:</span>
                            <span className="font-bold text-primary text-sm text-right">{selectedSeats.join(', ') || 'Chưa chọn'}</span>
                        </div>
                        {Object.entries(selectedCombos).some(([_, qty]) => qty > 0) && (
                            <div className="pt-2 space-y-1">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Combos đã chọn:</span>
                                {Object.entries(selectedCombos).map(([id, qty]) => {
                                    if (qty === 0) return null
                                    const combo = availableCombos.find(c => c._id === id)
                                    return (
                                        <div key={id} className="flex justify-between text-[11px]">
                                            <span>{qty}x {combo?.name}</span>
                                            <span>{(qty * (combo?.price || 0)).toLocaleString()}đ</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                            <span className="text-lg font-bold">Tổng tiền:</span>
                            <span className="text-2xl font-bold text-primary">
                                {calculateTotal().toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-secondary/10 border-t border-border space-y-4">
                    {bookingStep === 'seats' ? (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Họ tên</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg bg-input border border-border" value={customerInfo.name} onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Số điện thoại</label>
                                    <input type="tel" className="w-full px-4 py-2 rounded-lg bg-input border border-border" value={customerInfo.phone} onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))} />
                                </div>
                            </div>
                            <Button 
                                className="w-full h-12 text-lg font-bold mt-4" 
                                disabled={selectedSeats.length === 0}
                                onClick={() => {
                                    if (selectedSeats.length === 0) return alert("Vui lòng chọn ghế")
                                    if (!customerInfo.name || !customerInfo.phone) return alert("Nhập thông tin cá nhân")
                                    setBookingStep('combos')
                                }}
                            >
                                Tiếp tục chọn bắp nước
                            </Button>
                        </>
                    ) : bookingStep === 'combos' ? (
                        <>
                            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
                                <p className="text-xs text-orange-600 font-medium leading-relaxed">
                                    Ưu đãi: Mua combo tại quầy sẽ đắt hơn 15%. Đặt ngay trên app để tiết kiệm thêm!
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button 
                                    variant="outline"
                                    className="flex-1 h-12"
                                    onClick={() => setBookingStep('seats')}
                                >
                                    Quay lại
                                </Button>
                                <Button 
                                    className="flex-[2] h-12 text-lg font-bold"
                                    onClick={() => setBookingStep('payment')}
                                >
                                    Xác nhận & Thanh toán
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Promo Code Input */}
                            <div className="space-y-2 pb-4 border-b border-border">
                                <label className="text-sm font-medium">Mã giảm giá</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 px-3 py-2 rounded-lg bg-input border border-border uppercase" 
                                        placeholder="NHAP MA" 
                                        value={promoCode}
                                        onChange={e => setPromoCode(e.target.value)}
                                        disabled={!!appliedPromo || isApplyingPromo}
                                    />
                                    <Button 
                                        variant="outline" 
                                        className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                        onClick={applyPromoCode}
                                        disabled={!promoCode || !!appliedPromo || isApplyingPromo}
                                    >
                                        {isApplyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
                                    </Button>
                                </div>
                                {appliedPromo && (
                                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Đã áp dụng mã {appliedPromo.code}
                                    </p>
                                )}
                            </div>

                            {/* Loyalty Points Redemption */}
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <Coins className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Điểm thưởng hiện có</p>
                                            <p className="font-bold text-primary">{(user?.points || 0).toLocaleString()} điểm</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant={usePoints ? "default" : "outline"}
                                        size="sm"
                                        className="h-8"
                                        disabled={(user?.points || 0) < 10000}
                                        onClick={() => setUsePoints(!usePoints)}
                                    >
                                        {usePoints ? "Đã dùng" : "Dùng ngay"}
                                    </Button>
                                </div>
                                {(user?.points || 0) < 10000 && (
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Cần tối thiểu 10.000 điểm để đổi.
                                    </p>
                                )}
                                {usePoints && (user?.points || 0) >= 10000 && (
                                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Đã trừ {(user?.points || 0).toLocaleString()}đ vào tổng hóa đơn.
                                    </p>
                                )}
                            </div>

                            <Button 
                                variant="outline" 
                                className="w-full h-10 border-dashed"
                                onClick={() => {
                                    setBookingStep('seats')
                                    setAppliedPromo(null)
                                }}
                                disabled={isSubmitting}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Thay đổi ghế
                            </Button>
                            <Button 
                                className="w-full h-14 text-lg font-bold bg-primary shadow-lg shadow-primary/20" 
                                disabled={isSubmitting}
                                onClick={handleBooking}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                ) : (
                                    <ShieldCheck className="h-6 w-6 mr-2" />
                                )}
                                {isSubmitting ? "Đang xử lý giao dịch..." : `Thanh toán ${calculateTotal().toLocaleString()}đ`}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
