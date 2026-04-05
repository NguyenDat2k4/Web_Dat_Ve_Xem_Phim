"use client"

import { useState, useEffect } from "react"
import { 
    Search, 
    Trash2, 
    Eye, 
    Loader2, 
    Ticket,
    Calendar,
    User,
    CreditCard,
    Armchair,
    Clock,
    MapPin,
    Filter,
    ChevronRight,
    Soup,
    MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  
  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/bookings")
      const data = await res.json()
      if (res.ok) {
        setBookings(data)
      } else {
        toast.error("Không thể tải danh sách đơn vé")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công!")
        fetchBookings()
        if (selectedBooking && selectedBooking._id === id) {
            setIsDetailOpen(false)
        }
      } else {
        toast.error("Không thể cập nhật trạng thái")
      }
    } catch (error) {
      toast.error("Lỗi server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn vé này? Hành động này không thể hoàn tác.")) return
    
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Đã xóa đơn vé!")
        fetchBookings()
      } else {
        toast.error("Không thể xóa đơn vé")
      }
    } catch (error) {
      toast.error("Lỗi server")
    }
  }

  const filteredBookings = bookings.filter(item => {
    const matchesSearch = 
      item.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.movie?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Đã thanh toán</Badge>
      case 'confirmed': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Đã xác nhận</Badge>
      case 'pending': return <Badge variant="outline" className="text-amber-500 border-amber-500/20">Chờ xử lý</Badge>
      case 'cancelled': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Đã hủy</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleShowDetail = (booking: any) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Đơn vé & Giao dịch</h1>
          <p className="text-muted-foreground mt-1">Theo dõi, kiểm tra và cập nhật trạng thái đơn hàng của khách hàng.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-secondary/50">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã vé, tên khách, phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-border bg-background"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px] h-10 bg-background border-border">
                        <div className="flex items-center gap-2">
                             <Filter className="h-4 w-4 text-muted-foreground" />
                             <SelectValue placeholder="Lọc trạng thái" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" className="h-10 px-4 gap-2" onClick={fetchBookings}>
                    Làm mới
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead>Mã vé</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Phim & Rạp</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Không tìm thấy đơn vé nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((item) => (
                    <TableRow key={item._id} className="group border-border hover:bg-secondary/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {item.ticketCode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.customerName}</span>
                          <span className="text-[10px] text-muted-foreground">{item.customerPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-xs line-clamp-1">{item.movie}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" /> {item.cinema}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col text-[10px]">
                            <span className="font-bold">{item.time}</span>
                            <span className="text-muted-foreground">{item.date}</span>
                         </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {item.totalPrice.toLocaleString()}đ
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                            <DropdownMenuItem onClick={() => handleShowDetail(item)} className="cursor-pointer gap-2">
                              <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item._id, 'paid')} className="cursor-pointer gap-2 text-emerald-500">
                              <CreditCard className="h-3.5 w-3.5" /> Xác nhận thanh toán
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item._id, 'cancelled')} className="cursor-pointer gap-2 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" /> Hủy đơn vé
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-card border-border overflow-hidden p-0">
          {selectedBooking && (
            <>
              <DialogHeader className="p-6 bg-secondary/50 border-b border-border text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            Mã vé: <span className="text-primary">{selectedBooking.ticketCode}</span>
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            Giao dịch lúc {format(new Date(selectedBooking.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                        </DialogDescription>
                    </div>
                    {getStatusBadge(selectedBooking.status)}
                </div>
              </DialogHeader>
              
              <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                    {/* Customer Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User className="h-3.5 w-3.5" /> Khách hàng
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Tên:</span> {selectedBooking.customerName}</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">SĐT:</span> {selectedBooking.customerPhone}</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Email:</span> {selectedBooking.userEmail || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Movie Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Ticket className="h-3.5 w-3.5" /> Suất chiếu
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-primary">{selectedBooking.movie}</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Rạp:</span> {selectedBooking.cinema}</p>
                            <p className="text-sm"><span className="font-medium text-muted-foreground">Lúc:</span> {selectedBooking.time} - {selectedBooking.date}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                     {/* Seats Section */}
                     <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Armchair className="h-3.5 w-3.5" /> Ghế
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedBooking.seats.map((seat: string) => (
                                <Badge key={seat} variant="secondary" className="font-mono bg-primary/10 text-primary border-none">{seat}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* Combos Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Soup className="h-3.5 w-3.5" /> Combo
                        </h4>
                        <div className="space-y-2">
                            {selectedBooking.combos && selectedBooking.combos.length > 0 ? (
                                selectedBooking.combos.map((combo: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span>{combo.name} x{combo.quantity}</span>
                                        <span className="font-medium">{(combo.price * combo.quantity).toLocaleString()}đ</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Không có combo</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> Thanh toán</span>
                            <span className="font-bold uppercase">{selectedBooking.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Ticket className="h-4 w-4" /> Điểm dùng</span>
                            <span className="font-bold">{selectedBooking.pointsUsed || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl mt-2">
                            <span className="font-black">TỔNG CỘNG</span>
                            <span className="font-black text-primary">{selectedBooking.totalPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-secondary/20 border-t border-border">
                <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1" onClick={() => setIsDetailOpen(false)}>Đóng</Button>
                    {selectedBooking.status !== 'paid' && (
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleUpdateStatus(selectedBooking._id, 'paid')}>
                            Duyệt thanh toán
                        </Button>
                    )}
                    {selectedBooking.status !== 'cancelled' && (
                        <Button variant="destructive" className="flex-1" onClick={() => handleUpdateStatus(selectedBooking._id, 'cancelled')}>
                            Hủy vé
                        </Button>
                    )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
