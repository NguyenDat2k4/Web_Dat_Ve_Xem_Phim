"use client"

import { useState, useEffect } from "react"
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Loader2, 
    MapPin, 
    Layout, 
    Users, 
    ChevronRight,
    Armchair
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
} from "@/components/ui/dialog"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([])
  const [cinemas, setCinemas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    cinema: "",
    type: "2D",
    isActive: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [roomsRes, cinemasRes] = await Promise.all([
        fetch("/api/admin/rooms"),
        fetch("/api/admin/cinemas")
      ])
      const roomsData = await roomsRes.json()
      const cinemasData = await cinemasRes.json()
      
      setRooms(roomsData)
      setCinemas(cinemasData)
    } catch (error) {
      toast.error("Lỗi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingRoom ? "PATCH" : "POST"
    const url = editingRoom ? `/api/admin/rooms/${editingRoom._id}` : "/api/admin/rooms"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingRoom ? "Cập nhật thành công!" : "Tạo phòng mới thành công!")
        setIsDialogOpen(false)
        fetchData()
      } else {
        toast.error("Có lỗi xảy ra")
      }
    } catch (error) {
      toast.error("Lỗi server")
    }
  }

  const handleEdit = (room: any) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      cinema: room.cinema._id || room.cinema,
      type: room.type,
      isActive: room.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa phòng chiếu này sẽ ảnh hưởng đến các sơ đồ ghế. Bạn chắc chứ?")) return
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Đã xóa phòng")
        fetchData()
      }
    } catch (error) {
      toast.error("Lỗi server")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Phòng chiếu</h1>
          <p className="text-muted-foreground mt-1">Quản lý không gian và cấu hình rạp chiếu phim.</p>
        </div>
        <Button onClick={() => {
          setEditingRoom(null)
          setFormData({ name: "", cinema: "", type: "2D", isActive: true })
          setIsDialogOpen(true)
        }} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Thêm Phòng mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Danh sách Phòng chiếu
            </CardTitle>
            <CardDescription>Cấu hình phòng và liên kết tới sơ đồ ghế.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead>Tên phòng</TableHead>
                        <TableHead>Thuộc Rạp</TableHead>
                        <TableHead>Định dạng</TableHead>
                        <TableHead>Sức chứa</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : rooms.map((room) => (
                        <TableRow key={room._id} className="group border-border hover:bg-secondary/30 transition-colors">
                            <TableCell className="font-bold">{room.name}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {room.cinema?.name || "N/A"}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black">
                                    {room.type}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    {room.capacity} ghế
                                </div>
                            </TableCell>
                            <TableCell>
                                {room.isActive ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none">Đang hoạt động</Badge>
                                ) : (
                                    <Badge variant="outline">Bảo trì</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/admin/rooms/${room._id}/seats`}>
                                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/10 text-primary">
                                            <Armchair className="h-3.5 w-3.5" /> Sơ đồ ghế
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(room)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(room._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingRoom ? "Chỉnh sửa Phòng" : "Thêm Phòng mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Tên phòng chiếu</label>
              <Input
                placeholder="VD: Phòng 01, IMAX Theatre..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Thuộc Rạp</label>
              <Select value={formData.cinema} onValueChange={(v) => setFormData({ ...formData, cinema: v })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Chọn rạp quản lý" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {cinemas.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Định dạng</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Chọn định dạng" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                    <SelectItem value="2D">2D Standard</SelectItem>
                    <SelectItem value="3D">3D Digital</SelectItem>
                    <SelectItem value="IMAX">IMAX Experience</SelectItem>
                    <SelectItem value="4DX">4DX Motion</SelectItem>
                    <SelectItem value="Gold Class">Gold Class</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">Trạng thái</label>
                <Select value={formData.isActive ? "true" : "false"} onValueChange={(v) => setFormData({ ...formData, isActive: v === "true" })}>
                    <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                    <SelectItem value="true">Đang hoạt động</SelectItem>
                    <SelectItem value="false">Tạm dừng bảo trì</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
