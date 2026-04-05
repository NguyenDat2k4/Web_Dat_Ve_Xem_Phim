"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Loader2, Calendar, Clock, DollarSign, MapPin, Film, Layout } from "lucide-react"

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

export default function ShowtimeManagementPage() {
  const [showtimes, setShowtimes] = useState<any[]>([])
  const [movies, setMovies] = useState<any[]>([])
  const [cinemas, setCinemas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
   const [editingShowtime, setEditingShowtime] = useState<any>(null)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [availableRooms, setAvailableRooms] = useState<any[]>([])


  const [formData, setFormData] = useState({
      movie: "",
      cinema: "",
      room: "",
      date: "",
      times: "", // String comma separated
      price: 80000
  })


  const fetchData = async () => {
    try {
      const [showRes, movieRes, cinemaRes] = await Promise.all([
        fetch("/api/admin/showtimes"),
        fetch("/api/admin/movies"),
        fetch("/api/admin/cinemas")
      ])
      
      const [showData, movieData, cinemaData] = await Promise.all([
        showRes.json(),
        movieRes.json(),
        cinemaRes.json()
      ])

      if (showRes.ok) setShowtimes(showData)
      if (movieRes.ok) setMovies(movieData)
      if (cinemaRes.ok) setCinemas(cinemaData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.cinema) {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`/api/admin/rooms?cinemaId=${formData.cinema}`)
                if (res.ok) {
                    const data = await res.json()
                    setAvailableRooms(data)
                }
            } catch (error) {
                console.error("Failed to fetch rooms")
            }
        }
        fetchRooms()
    } else {
        setAvailableRooms([])
    }
  }, [formData.cinema])


  const handleEdit = (showtime: any) => {
    setEditingShowtime(showtime)
    setFormData({
      movie: showtime.movie._id,
      cinema: showtime.cinema._id,
      room: showtime.room?._id || showtime.room || "",
      date: showtime.date,
      times: showtime.times.join(", "),
      price: showtime.price
    })
    setIsDialogOpen(true)
  }


  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch chiếu này?")) return
    try {
      const res = await fetch("/api/admin/showtimes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Xóa lịch chiếu thành công!")
        fetchData()
      }
    } catch (error) {
      toast.error("Lỗi khi xóa lịch chiếu")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Clean up times array
    const timesArray = formData.times.split(",").map(t => t.trim()).filter(t => t.length > 0)

    try {
      const url = "/api/admin/showtimes"
      const method = editingShowtime ? "PUT" : "POST"
      const body = {
          ...(editingShowtime ? { id: editingShowtime._id } : {}),
          ...formData,
          times: timesArray
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingShowtime ? "Cập nhật thành công!" : "Thêm lịch chiếu mới!")
        setIsDialogOpen(false)
        fetchData()
      } else {
        toast.error("Vui lòng nhập đầy đủ các trường")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý lịch chiếu</h1>
          <p className="text-muted-foreground">Sắp xếp suất chiếu và giá vé động cho từng cụm rạp.</p>
        </div>
        <Button onClick={() => {
            setEditingShowtime(null)
            setFormData({
                movie: "", cinema: "", room: "", date: "", times: "", price: 80000
            })

            setIsDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm lịch chiếu mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {showtimes.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 text-xs font-bold uppercase text-muted-foreground">
                    <tr>
                        <th className="px-6 py-4">Phim</th>
                        <th className="px-6 py-4">Rạp chiếu</th>
                        <th className="px-6 py-4">Ngày chiếu</th>
                        <th className="px-6 py-4">Suất chiếu & Giá</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {showtimes.map((st) => (
                        <tr key={st._id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-primary/10 text-primary">
                                        <Film className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold">{st.movie?.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary/50" />
                                        {st.cinema?.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground w-fit">
                                        <Layout className="h-3 w-3" />
                                        {st.room?.name || "Chưa gán phòng"}
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary/50" />
                                    {st.date}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1">
                                        {st.times.map((t: string, i: number) => (
                                            <Badge key={i} variant="outline" className="bg-secondary/50 text-[10px] h-5 px-1.5 font-bold">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-black text-primary">
                                        <DollarSign className="h-3 w-3" />
                                        {st.price.toLocaleString()}đ
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(st)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(st._id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-card border border-dashed border-border rounded-xl">
             <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
             <p className="text-muted-foreground font-medium">Chưa có lịch chiếu nào được thiết lập.</p>
             <Button variant="link" onClick={() => setIsDialogOpen(true)}>Tạo lịch chiếu đầu tiên</Button>
          </div>
        )}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingShowtime ? "Cập nhật lịch chiếu" : "Thêm lịch chiếu mới"}</DialogTitle>
            <DialogDescription>
                Thiết lập thời gian chiếu và giá vé cho bộ phim tại cụm rạp đã chọn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phim</label>
                    <select 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.movie}
                        onChange={e => setFormData({...formData, movie: e.target.value})}
                        required
                    >
                        <option value="">Chọn phim...</option>
                        {movies.map(m => (
                            <option key={m._id} value={m._id}>{m.title}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rạp chiếu</label>
                    <select 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.cinema}
                        onChange={e => setFormData({...formData, cinema: e.target.value})}
                        required
                    >
                        <option value="">Chọn rạp...</option>
                        {cinemas.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phòng chiếu</label>
                    <select 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.room}
                        onChange={e => setFormData({...formData, room: e.target.value})}
                        required
                        disabled={!formData.cinema}
                    >
                        <option value="">Chọn phòng...</option>
                        {availableRooms.map(r => (
                            <option key={r._id} value={r._id}>{r.name} ({r.type})</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2 text-transparent hidden md:block"> spacer </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày chiếu</label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Giá vé chuẩn (VNĐ)</label>
                    <Input type="number" step="1000" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} required />
                </div>
            </div>

            
            <div className="space-y-2">
              <label className="text-sm font-medium">Các suất chiếu (Cách nhau bằng dấu phẩy)</label>
              <Input 
                value={formData.times} 
                onChange={e => setFormData({...formData, times: e.target.value})} 
                placeholder="Ví dụ: 09:00, 13:00, 16:30, 20:00"
                required
              />
              <p className="text-[10px] text-muted-foreground">Ví dụ: 10:00, 14:00, 19:30, 22:00</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Lưu lịch chiếu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
