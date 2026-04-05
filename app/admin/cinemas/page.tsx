"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Loader2, MapPin, Phone, Mail, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CinemaManagementPage() {
  const [cinemas, setCinemas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCinema, setEditingCinema] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
      name: "",
      address: "",
      phone: "",
      email: "",
      openTime: "08:00 - 23:00",
      image: ""
  })

  const fetchCinemas = async () => {
    try {
      const res = await fetch("/api/admin/cinemas")
      const data = await res.json()
      if (res.ok) setCinemas(data)
    } catch (error) {
      console.error("Failed to fetch cinemas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCinemas()
  }, [])

  const handleEdit = (cinema: any) => {
    setEditingCinema(cinema)
    setFormData({
      name: cinema.name,
      address: cinema.address,
      phone: cinema.phone || "",
      email: cinema.email || "",
      openTime: cinema.openTime || "08:00 - 23:00",
      image: cinema.image || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa rạp này?")) return
    try {
      const res = await fetch("/api/admin/cinemas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Xóa rạp thành công!")
        fetchCinemas()
      }
    } catch (error) {
      toast.error("Lỗi khi xóa rạp")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = "/api/admin/cinemas"
      const method = editingCinema ? "PUT" : "POST"
      const body = editingCinema ? { id: editingCinema._id, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingCinema ? "Cập nhật thành công!" : "Thêm rạp mới thành công!")
        setIsDialogOpen(false)
        fetchCinemas()
      } else {
        const data = await res.json()
        toast.error(data.error || "Thao tác thất bại")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCinemas = cinemas.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý rạp</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa các cơ sở rạp chiếu phim.</p>
        </div>
        <Button onClick={() => {
            setEditingCinema(null)
            setFormData({
                name: "", address: "", phone: "", email: "", openTime: "08:00 - 23:00", image: ""
            })
            setIsDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm rạp mới
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm kiếm rạp theo tên hoặc địa chỉ..." 
          className="pl-10 h-11 bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCinemas.map((cinema) => (
          <Card key={cinema._id} className="bg-card border-border hover:border-primary/30 transition-all shadow-sm group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{cinema.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <MapPin className="h-3 w-3" />
                  {cinema.address}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(cinema)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cinema._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    {cinema.phone || "Chưa cập nhật"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 text-primary" />
                    {cinema.email || "Chưa cập nhật"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 text-primary" />
                    {cinema.openTime || "08:00 - 23:00"}
                </div>
                <div className="flex justify-end pt-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Đang hoạt động</Badge>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingCinema ? "Chỉnh sửa rạp" : "Thêm rạp mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ sở rạp phim. Nhấn Lưu để cập nhật.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên rạp</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ví dụ: CineMax Long Biên" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="Số nhà, đường, quận..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0xxx.xxx.xxx" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@cinemax.vn" />
                </div>
            </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Link ảnh cơ sở (Banner)</label>
                    <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Giờ mở cửa</label>
                    <Input value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} placeholder="08:00 - 23:00" />
                </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
