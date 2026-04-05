"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    User, 
    Mail, 
    Ticket, 
    Calendar, 
    Clock, 
    MapPin, 
    Loader2, 
    ChevronRight, 
    Trash2,
    XCircle,
    CheckCircle,
    Coins,
    Info,
    QrCode
} from "lucide-react"

import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,

  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)


  const fetchBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const res = await fetch("/api/bookings/my")
      const data = await res.json()
      if (res.ok) {
        setBookings(data)
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const handleCancel = async () => {
    if (!bookingToCancel) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${bookingToCancel}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      if (res.ok) {
        toast.success("Đã hủy vé thành công!")
        fetchBookings() // Refresh list
      } else {
        toast.error("Không thể hủy vé vào lúc này.")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsCancelling(false)
      setBookingToCancel(null)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Đang nạp hồ sơ...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để xem lịch sử đặt vé.</p>
        <Button onClick={() => window.location.href = "/"}>Quay về trang chủ</Button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-sm sticky top-32">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl capitalize">{user.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                 <div className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tổng lượt đặt:</span>
                    <span className="font-bold">{bookings.length}</span>
                 </div>
                 
                 <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Coins className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Điểm thưởng</p>
                            <p className="text-xl font-black text-primary">{(user.points || 0).toLocaleString()} <span className="text-sm font-normal">điểm</span></p>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-primary/10">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Đổi điểm khi đạt tối thiểu 10.000 điểm.
                        </p>
                    </div>
                 </div>

                 <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start text-sm" disabled>
                        <User className="h-4 w-4 mr-2" /> Hồ sơ cá nhân
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10" disabled>
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa tài khoản
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking History */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">Lịch sử đặt vé</h1>
                <Badge variant="outline" className="px-3 py-1">
                    {bookings.length} Suất chiếu
                </Badge>
            </div>

            {isLoadingBookings ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 rounded-2xl bg-secondary/20 animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <Card className="bg-card border-dashed border-border py-16 text-center">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold mb-2">Chưa có giao dịch nào</h3>
                <p className="text-muted-foreground mb-6">Hãy đặt vé cho bộ phim yêu thích của bạn ngay hôm nay!</p>
                <Button onClick={() => window.location.href = "/"}>Đặt vé ngay</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="overflow-hidden bg-card border-border hover:shadow-md transition-shadow group">
                    <div className="flex flex-col md:flex-row">
                        {/* Status bar */}
                        <div className={`w-2 md:w-3 ${booking.status === 'cancelled' ? 'bg-destructive' : 'bg-primary'}`} />
                        
                        <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                        Phim: {booking.movie}
                                    </h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {booking.cinema}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {booking.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {booking.time}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <Badge 
                                        variant={booking.status === 'cancelled' ? 'destructive' : booking.status === 'paid' ? 'default' : 'secondary'}
                                        className="capitalize"
                                    >
                                        {booking.status === 'cancelled' ? (
                                            <><XCircle className="h-3 w-3 mr-1" /> Đã hủy</>
                                        ) : booking.status === 'paid' ? (
                                            <><CheckCircle className="h-3 w-3 mr-1" /> Đã thanh toán</>
                                        ) : (
                                            <><Clock className="h-3 w-3 mr-1" /> Đã xác nhận</>
                                        )}
                                    </Badge>
                                    {booking.paymentMethod && (
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary/50 rounded-full border border-border">
                                            {booking.paymentMethod}
                                        </span>
                                    )}
                                    <span className="text-2xl font-black text-primary">
                                        {booking.totalPrice.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Ghế đã chọn</p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {booking.seats.map((seat: string) => (
                                            <span key={seat} className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
                                                {seat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {booking.status !== 'cancelled' && (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button 
                                            variant="secondary" 
                                            size="sm"
                                            className="bg-primary/20 text-primary border-primary/10 hover:bg-primary/30 transition-all font-bold px-4"
                                            onClick={() => setSelectedTicket(booking)}
                                        >
                                            <QrCode className="h-4 w-4 mr-2" />
                                            Xem vé
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all group"
                                            onClick={() => setBookingToCancel(booking._id)}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Hủy đặt vé
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket QR Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden p-0">
          {selectedTicket && (
            <div className="flex flex-col">
                <div className="bg-primary/10 p-6 text-center border-b border-border">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-2xl font-black text-primary">VÉ ĐIỆN TỬ</DialogTitle>
                    </DialogHeader>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-bold">
                        Vui lòng xuất trình mã này tại quầy vé
                    </p>
                </div>
                
                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 relative group transform hover:scale-105 transition-transform duration-500">
                        <QRCodeSVG 
                            value={JSON.stringify({
                                id: selectedTicket._id,
                                code: selectedTicket.ticketCode || selectedTicket._id,
                                movie: selectedTicket.movie
                            })} 
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                    </div>
                    
                    <div className="text-center space-y-1 mb-8">
                        <p className="text-2xl font-black tracking-widest text-foreground">
                            {selectedTicket.ticketCode || `CMX-${selectedTicket._id.slice(-6).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">Mã vé của bạn</p>
                    </div>

                    <div className="w-full space-y-4 bg-secondary/30 rounded-2xl p-6 border border-border">
                        <div className="space-y-1">
                            <h4 className="font-bold text-lg text-primary">{selectedTicket.movie}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedTicket.cinema}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Thời gian</span>
                                <p className="font-bold">{selectedTicket.time} • {selectedTicket.date}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ghế</span>
                                <p className="font-bold text-primary">{selectedTicket.seats.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 border-t border-border flex justify-center gap-4 bg-secondary/10">
                    <Button 
                        variant="default" 
                        className="w-full font-bold"
                        onClick={() => window.print()}
                    >
                        Tải ảnh vé
                    </Button>
                </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận hủy vé</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác và tiền sẽ được hoàn về ví điện tử của bạn (mô phỏng).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bỏ qua</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isCancelling}
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </main>
  )
}
