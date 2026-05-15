"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MapPin, Calendar, Clock, Armchair, ChevronLeft, Loader2, CheckCircle2, CreditCard, Smartphone, QrCode, ShieldCheck, Coins, AlertCircle, Soup, Gift, Share2, HelpCircle } from "lucide-react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { io, Socket } from "socket.io-client"
import { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { TheaterPreview } from "@/components/theater-preview"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"


interface BookingClientProps {
  movie: any
  cinema: string
  time: string
  date: string
  basePrice: number
  roomId?: string
  isMystery?: boolean
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SEATS_PER_ROW = 12
const VIP_ROWS = ['E', 'F']


export function BookingClient({ movie, cinema, time, date, basePrice, roomId, isMystery = false }: BookingClientProps) {

  const router = useRouter()
  const { user, login, refreshUser } = useAuth()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [othersLockedSeats, setOthersLockedSeats] = useState<string[]>([])
  const socketRef = useRef<Socket | null>(null)
  
  const showtimeKey = `${movie.title}-${cinema}-${date}-${time}`

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
  const [isGift, setIsGift] = useState(false)
  const [giftInfo, setGiftInfo] = useState({
    recipientName: "",
    recipientEmail: "",
    message: "",
    templateId: "birthday"
  })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Seating Info
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [dbSeats, setDbSeats] = useState<any[]>([])
  const [isSeatingLoading, setIsSeatingLoading] = useState(false)

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
                const targetRows = roomId ? [] : ROWS
                if (!roomId) {
                    for (let i = 0; i < 15; i++) {
                        const row = ROWS[Math.floor(Math.random() * ROWS.length)]
                        const num = Math.floor(Math.random() * SEATS_PER_ROW) + 1
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

    // Socket.io Real-time Setup
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
    socketRef.current = socket

    socket.emit("join-showtime", showtimeKey)

    socket.on("current-locked-seats", (seats: string[]) => {
      setOthersLockedSeats(seats)
    })

    socket.on("seat-locked", (seatId: string) => {
      setOthersLockedSeats(prev => [...prev, seatId])
    })

    socket.on("seat-unlocked", (seatId: string) => {
      setOthersLockedSeats(prev => prev.filter(id => id !== seatId))
    })

    // Polling for sold seats
    const pollInterval = setInterval(async () => {
        try {
            const params = new URLSearchParams({
                cinema,
                movie: movie.title,
                date,
                time
            })
            const res = await fetch(`/api/bookings?${params.toString()}`)
            const data = await res.json()
            if (res.ok && data.reservedSeats) {
                setOccupiedSeats(data.reservedSeats)
            }
        } catch (error) {
            console.error("Polling error:", error)
        }
    }, 5000)

    return () => {
      socket.disconnect()
      clearInterval(pollInterval)
    }
  }, [showtimeKey, cinema, movie.title, date, time])

  useEffect(() => {
    if (user && !customerInfo.name) {
      setCustomerInfo(prev => ({ ...prev, name: user.name }))
    }
  }, [user, customerInfo.name])


  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId) || othersLockedSeats.includes(seatId)) return
    
    const isSelected = selectedSeats.includes(seatId)
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId))
      socketRef.current?.emit("unlock-seat", { showtimeKey, seatId })
    } else {
      setSelectedSeats(prev => [...prev, seatId])
      socketRef.current?.emit("lock-seat", { showtimeKey, seatId })
    }
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
      return total + (VIP_ROWS.includes(row) ? priceVIP : priceStandard)
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
        toast.error(data.error || "Mã không hợp lệ")
      }
    } catch (error) {
      toast.error("Lỗi kết nối")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ghế")
      return
    }
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Vui lòng nhập đầy đủ thông tin cá nhân")
      return
    }

    setIsSubmitting(true)

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

    // Truy xuất trực tiếp dữ liệu từ màn hình để đảm bảo an toàn tuyệt đối
    const currentRecipientName = (document.querySelector('input[name="recipientName"]') as HTMLInputElement)?.value || giftInfo.recipientName;
    const currentRecipientEmail = (document.querySelector('input[name="recipientEmail"]') as HTMLInputElement)?.value || giftInfo.recipientEmail;
    const currentMessage = (document.querySelector('textarea[placeholder="Chúc bạn xem phim vui vẻ..."]') as HTMLTextAreaElement)?.value || giftInfo.message;

    const bookingData = {
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
      isGift: !!(isGift || (currentRecipientEmail && currentRecipientEmail.trim() !== "")),
      recipientName: currentRecipientName,
      recipientEmail: currentRecipientEmail,
      giftMessage: currentMessage,
      giftTemplate: giftInfo.templateId,
      isMystery: isMystery
    }

    console.log(">>> [CLIENT] SENDING BOOKING DATA:", bookingData);

    try {
      if (paymentMethod === 'vnpay') {
        // Real VNPay Integration
        const response = await fetch('/api/payment/vnpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: calculateTotal(),
            bookingData: bookingData,
          })
        })

        const data = await response.json()
        if (response.ok && data.url) {
          window.location.href = data.url // Redirect to VNPay
          return
        } else {
          toast.error(data.error || "Không thể khởi tạo thanh toán VNPay")
        }
      } else if (paymentMethod === 'momo') {
        // Real MoMo Integration
        const response = await fetch('/api/payment/momo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: calculateTotal(),
              bookingData: bookingData,
            })
          })
  
          const data = await response.json()
          if (response.ok && data.url) {
            window.location.href = data.url // Redirect to MoMo
            return
          } else {
            toast.error(data.error || "Không thể khởi tạo thanh toán MoMo")
          }
      } else {
        // Original logic for other methods (mocked)
        setTimeout(async () => {
            try {
              const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...bookingData,
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
                toast.error(data.error || "Có lỗi xảy ra. Vui lòng thử lại.")
              }
            } catch (error) {
              toast.error("Lỗi kết nối server")
            } finally {
              setIsSubmitting(false)
            }
        }, 2000)
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Lỗi kết nối server")
      setIsSubmitting(false)
    }
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
            <div className="flex justify-between"><span className="text-muted-foreground">Phim:</span><span className={`font-bold ${isMystery ? 'blur-md select-none' : ''}`}>{isMystery ? '???' : movie.title}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Suất chiếu:</span><span className="font-bold">{time} • {date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Ghế:</span><span className="font-bold text-primary">{selectedSeats.join(', ')}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2 font-bold"><span>Tổng thanh toán:</span><span className="text-primary text-lg">{calculateTotal().toLocaleString()}đ</span></div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:flex sm:gap-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => {
                if (navigator.share) {
                    navigator.share({
                        title: `Vé xem phim ${movie.title}`,
                        text: `Mình vừa đặt vé xem phim ${movie.title} tại CineMax vào lúc ${time} ngày ${date}. Đi xem cùng mình nhé!`,
                        url: window.location.origin
                    }).catch(console.error);
                } else {
                    toast.info("Trình duyệt của bạn không hỗ trợ chia sẻ trực tiếp. Hãy copy mã vé nhé!");
                }
            }}>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.print()}>In vé</Button>
            <Link href="/profile" className="flex-1">
                <Button className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20">Quản lý vé</Button>
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
              href={isMystery ? "/" : `/movie/${movie._id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              {isMystery ? "Quay lại trang chủ" : "Quay lại thông tin phim"}
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

                    {/* Nút Xem 3D nổi bật ngay tại sơ đồ ghế */}
                    {selectedSeats.length > 0 && (
                        <div className="flex justify-center -mt-10 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsPreviewOpen(true)}
                                className="rounded-full bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all gap-2 h-10 px-8 shadow-xl shadow-primary/10 border-2"
                             >
                                <Eye className="h-4 w-4" />
                                Xem góc nhìn 3D từ ghế {selectedSeats[0]}
                             </Button>
                        </div>
                    )}

                    {isSeatingLoading ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Đang chuẩn bị sơ đồ phòng...</p>
                        </div>
                    ) : dbSeats.length > 0 ? (
                        /* Dynamic Grid from DB */
                        <div className="flex flex-col items-center gap-4 overflow-x-auto pb-4 w-full">
                            <style>{`
                                .dynamic-seat-grid {
                                    display: grid;
                                    gap: 0.5rem;
                                    grid-template-columns: repeat(${Math.max(...dbSeats.map(s => s.x)) + 1}, minmax(0, 1fr));
                                }
                            `}</style>
                            <div className="dynamic-seat-grid">
                                {Array.from({ length: Math.max(...dbSeats.map(s => s.y)) + 1 }).map((_, y) => (
                                    Array.from({ length: Math.max(...dbSeats.map(s => s.x)) + 1 }).map((_, x) => {
                                        const seat = dbSeats.find(s => s.x === x && s.y === y)
                                        if (!seat) return <div key={`${y}-${x}`} className="w-8 h-8" />
                                        
                                        const seatId = `${seat.row}${seat.number}`
                                        const isOccupied = occupiedSeats.includes(seatId) || seat.status === 'maintenance'
                                        const isLockedByOthers = othersLockedSeats.includes(seatId)
                                        const isSelected = selectedSeats.includes(seatId)
                                        
                                        return (
                                            <button
                                                key={seatId}
                                                onClick={() => toggleSeat(seatId)}
                                                disabled={isOccupied || isLockedByOthers}
                                                className={`
                                                    w-8 h-8 rounded-lg flex flex-col items-center justify-center text-[8px] font-black transition-all group relative
                                                    ${isOccupied ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-30 shadow-inner' :
                                                    isLockedByOthers ? 'bg-orange-500/20 text-orange-500 border-2 border-orange-500/40 cursor-not-allowed animate-pulse' :
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
                            {ROWS.map(row => (
                            <div key={row} className="flex gap-2 items-center">
                                <span className="w-6 text-xs font-bold text-muted-foreground">{row}</span>
                                <div className="flex gap-2">
                                    {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                                    const seatNum = i + 1
                                    const seatId = `${row}${seatNum}`
                                    const isOccupied = occupiedSeats.includes(seatId)
                                    const isLockedByOthers = othersLockedSeats.includes(seatId)
                                    const isSelected = selectedSeats.includes(seatId)
                                    const isVIP = VIP_ROWS.includes(row)

                                    return (
                                        <button
                                            key={seatId}
                                            onClick={() => toggleSeat(seatId)}
                                            disabled={isOccupied || isLockedByOthers}
                                            className={`
                                                w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[10px] font-bold transition-all
                                                ${isOccupied ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50' :
                                                isLockedByOthers ? 'bg-orange-500/20 text-orange-500 border-2 border-orange-500/40 cursor-not-allowed animate-pulse' :
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
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-orange-500/20 border border-orange-500/40 animate-pulse" /><span className="text-xs text-muted-foreground font-medium">Người khác đang chọn</span></div>
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

                        {/* Gift Section */}
                        <div className="mt-8 bg-pink-500/5 border border-pink-500/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Gift className="h-24 w-24 rotate-12" />
                            </div>
                            
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                                        <Gift className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Mua vé làm quà tặng (PHIÊN BẢN MỚI 1.0)</h3>
                                        <p className="text-xs text-muted-foreground">Gửi tặng vé kèm thiệp điện tử</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsGift(!isGift)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isGift ? 'bg-pink-500' : 'bg-secondary'}`}
                                    aria-label="Bật/Tắt chế độ mua vé làm quà tặng"
                                    title="Mua vé làm quà tặng"
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGift ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {isGift && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">TÊN NGƯỜI NHẬN</label>
                                            <input 
                                                name="recipientName"
                                                placeholder="Tên bạn thân, người yêu..." 
                                                className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:ring-pink-500 focus:border-pink-500 outline-none"
                                                value={giftInfo.recipientName}
                                                onChange={(e) => setGiftInfo({...giftInfo, recipientName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground">EMAIL NGƯỜI NHẬN</label>
                                            <input 
                                                name="recipientEmail"
                                                type="email"
                                                placeholder="email@example.com" 
                                                className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:ring-pink-500 focus:border-pink-500 outline-none"
                                                value={giftInfo.recipientEmail}
                                                onChange={(e) => setGiftInfo({...giftInfo, recipientEmail: e.target.value})}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground">LỜI CHÚC</label>
                                        <textarea 
                                            placeholder="Chúc bạn xem phim vui vẻ..." 
                                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:ring-pink-500 focus:border-pink-500 outline-none min-h-[80px]"
                                            value={giftInfo.message}
                                            onChange={(e) => setGiftInfo({...giftInfo, message: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground">CHỌN MẪU THIỆP</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'birthday', name: 'Sinh nhật', icon: '🎂' },
                                                { id: 'love', name: 'Hẹn hò', icon: '❤️' },
                                                { id: 'thankyou', name: 'Cảm ơn', icon: '🙏' },
                                            ].map((tpl) => (
                                                <button
                                                    key={tpl.id}
                                                    onClick={() => setGiftInfo({...giftInfo, templateId: tpl.id})}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${giftInfo.templateId === tpl.id ? 'border-pink-500 bg-pink-500/10' : 'border-border bg-background'}`}
                                                >
                                                    <span className="text-xl">{tpl.icon}</span>
                                                    <span className="text-[9px] font-bold uppercase">{tpl.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
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
                            <Image src={isMystery ? "https://images.unsplash.com/photo-1512418490979-92798cec1380?w=400&q=80" : movie.image} alt={movie.title} fill className={`object-cover ${isMystery ? 'blur-sm grayscale' : ''}`} />
                            {isMystery && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <HelpCircle className="h-8 w-8 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className={`font-bold text-xl mb-1 ${isMystery ? 'blur-md select-none' : ''}`}>{isMystery ? 'Mystery Movie' : movie.title}</h2>
                            <p className={`text-sm text-primary font-medium ${isMystery ? 'blur-sm' : ''}`}>{isMystery ? 'Hồi hộp / Bí ẩn' : movie.genre}</p>
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
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground text-sm">Ghế chọn:</span>
                                {selectedSeats.length > 0 && bookingStep === 'seats' && (
                                    <button 
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider group"
                                    >
                                        <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                        Xem View 3D
                                    </button>
                                )}
                            </div>
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
                            <div className="text-right">
                                <span className="text-2xl font-bold text-primary">
                                    {calculateTotal().toLocaleString('vi-VN')}đ
                                </span>
                                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter mt-0.5">
                                    <Coins className="h-3 w-3" />
                                    Nhận thêm +{Math.round(calculateTotal() * 0.05).toLocaleString()} P
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-secondary/10 border-t border-border space-y-4">
                    {bookingStep === 'seats' ? (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="customer-name" className="text-sm font-medium">Họ tên</label>
                                    <input 
                                        id="customer-name"
                                        type="text" 
                                        className="w-full px-4 py-2 rounded-lg bg-input border border-border" 
                                        value={customerInfo.name} 
                                        onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))} 
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="customer-phone" className="text-sm font-medium">Số điện thoại</label>
                                    <input 
                                        id="customer-phone"
                                        type="tel" 
                                        className="w-full px-4 py-2 rounded-lg bg-input border border-border" 
                                        value={customerInfo.phone} 
                                        onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))} 
                                        placeholder="0123456789"
                                    />
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
                            {isMystery && (
                                <p className="text-[10px] text-destructive font-black text-center mt-3 flex items-center justify-center gap-1 uppercase tracking-wider animate-pulse">
                                    <AlertCircle className="h-3 w-3" />
                                    VÉ BÍ ẨN KHÔNG HỖ TRỢ HOÀN TIỀN HOẶC HỦY VÉ
                                </p>
                            )}
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 border-none bg-black/95 overflow-hidden shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Xem trước rạp phim 3D</DialogTitle>
            <DialogDescription>
              Xem góc nhìn từ vị trí ghế bạn đã chọn trong không gian 3D.
            </DialogDescription>
          </DialogHeader>
          <TheaterPreview 
            selectedSeats={selectedSeats.map(id => ({
                row: id[0],
                number: parseInt(id.substring(1))
            }))} 
            moviePoster={isMystery ? "https://images.unsplash.com/photo-1512418490979-92798cec1380?w=1000&q=80" : movie.image}
            movieTitle={isMystery ? "???" : movie.title}
            dbSeats={dbSeats.length > 0 ? dbSeats : []} 
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
