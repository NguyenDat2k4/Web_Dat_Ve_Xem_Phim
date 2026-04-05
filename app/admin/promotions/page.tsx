"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Ticket, 
  Trash2, 
  Edit2, 
  Loader2, 
  Calendar as CalendarIcon, 
  Percent, 
  DollarSign,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"

interface Promotion {
  _id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  value: number
  minAmount: number
  expiryDate: string
  isActive: boolean
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as 'percentage' | 'fixed',
    value: 0,
    minAmount: 0,
    expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    isActive: true
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/admin/promotions")
      const data = await res.json()
      if (res.ok) setPromotions(data)
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khuyến mãi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success("Đã tạo mã khuyến mãi mới")
        setIsDialogOpen(false)
        fetchPromotions()
        setFormData({
            code: "",
            description: "",
            discountType: "percentage",
            value: 0,
            minAmount: 0,
            expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            isActive: true
        })
      } else {
        toast.error("Lỗi khi tạo khuyến mãi")
      }
    } catch (error) {
      toast.error("Lỗi kết nối")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã này?")) return
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Đã xóa mã khuyến mãi")
        fetchPromotions()
      }
    } catch (error) {
      toast.error("Lỗi khi xóa")
    }
  }

  const filteredPromotions = promotions.filter(p => 
    (p.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Khuyến mãi</h2>
          <p className="text-muted-foreground">Tạo và quản lý các mã giảm giá cho khách hàng</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Thêm mã mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Tạo mã khuyến mãi mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã code (Viết liền, không dấu)</label>
                <Input 
                  required 
                  placeholder="Ví dụ: SUMMER20" 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <Input 
                  required 
                  placeholder="Ví dụ: Giảm 20% cho mùa hè" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại giảm giá</label>
                  <select 
                    className="w-full h-10 px-3 py-2 bg-input border border-border rounded-md text-sm"
                    value={formData.discountType}
                    onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá trị giảm</label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chi tiêu tối thiểu</label>
                  <Input 
                    type="number" 
                    value={formData.minAmount}
                    onChange={e => setFormData({...formData, minAmount: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày hết hạn</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Tạo mã
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm mã code hoặc mô tả..." 
            className="pl-10 bg-transparent border-none focus-visible:ring-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead>Mã Code</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Chi tối thiểu</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy mã khuyến mãi nào
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promo) => {
                const isExpired = new Date(promo.expiryDate) < new Date()
                return (
                  <TableRow key={promo._id} className="hover:bg-secondary/10 transition-colors group">
                    <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-primary" />
                            {promo.code}
                        </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {promo.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        {promo.discountType === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                        {(promo.value || 0).toLocaleString()}{promo.discountType === 'percentage' ? '%' : 'đ'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {(promo.minAmount || 0) > 0 ? `${(promo.minAmount || 0).toLocaleString()}đ` : "Không"}
                    </TableCell>
                    <TableCell className="text-sm">
                        <div className={`flex items-center gap-1.5 ${isExpired ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {promo.expiryDate ? (
                              isNaN(new Date(promo.expiryDate).getTime()) 
                                ? "Ngày không lệ" 
                                : format(new Date(promo.expiryDate), 'dd/MM/yyyy')
                            ) : "Chưa đặt"}
                        </div>
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Hết hạn</Badge>
                      ) : promo.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Tạm ngắt</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(promo._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
