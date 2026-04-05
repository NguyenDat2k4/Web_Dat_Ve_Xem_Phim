"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Loader2, Film, Star, Clock, Calendar } from "lucide-react"
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

export default function MovieManagementPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
      title: "",
      image: "",
      rating: 0,
      duration: "",
      genre: "",
      description: "",
      isComingSoon: false,
      releaseDate: "",
      trailerUrl: "",
      featured: false
  })

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/admin/movies")
      const data = await res.json()
      if (res.ok) setMovies(data)
    } catch (error) {
      console.error("Failed to fetch movies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  const handleEdit = (movie: any) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      image: movie.image,
      rating: movie.rating,
      duration: movie.duration,
      genre: movie.genre,
      description: movie.description,
      isComingSoon: movie.isComingSoon || false,
      releaseDate: movie.releaseDate || "",
      trailerUrl: movie.trailerUrl || "",
      featured: movie.featured || false
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return
    try {
      const res = await fetch("/api/admin/movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Xóa phim thành công!")
        fetchMovies()
      }
    } catch (error) {
      toast.error("Lỗi khi xóa phim")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = "/api/admin/movies"
      const method = editingMovie ? "PUT" : "POST"
      const body = editingMovie ? { id: editingMovie._id, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingMovie ? "Cập nhật thành công!" : "Thêm phim mới thành công!")
        setIsDialogOpen(false)
        fetchMovies()
      } else {
        toast.error("Vui lòng nhập đầy đủ các trường")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý phim</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa các bộ phim trong hệ thống.</p>
        </div>
        <Button onClick={() => {
            setEditingMovie(null)
            setFormData({
                title: "", image: "", rating: 0, duration: "", genre: "", description: "", isComingSoon: false, releaseDate: "", trailerUrl: "", featured: false
            })
            setIsDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm phim mới
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Tìm phim trong danh sách quản lý..." 
          className="pl-10 h-11 bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => (
          <Card key={movie._id} className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all group shadow-sm">
            <div className="aspect-video relative overflow-hidden">
                <img src={movie.image} alt={movie.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-1">
                    {movie.featured && <Badge className="bg-yellow-500">Nổi bật</Badge>}
                    {movie.isComingSoon && <Badge variant="secondary">Sắp chiếu</Badge>}
                </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg truncate flex-1">{movie.title}</h3>
                <div className="flex gap-1 ml-2 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(movie)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(movie._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {movie.rating}
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {movie.duration}
                </div>
                <Badge variant="outline" className="text-[10px] h-4 py-0">{movie.genre}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-card border-border overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin bộ phim vào các trường bên dưới. Nhấn Lưu để hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiêu đề phim</label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link ảnh Poster</label>
                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Thể loại</label>
                <Input value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Thời lượng (phút)</label>
                <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm đánh giá</label>
                <Input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày phát hành</label>
                <Input value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})} placeholder="DD/MM/YYYY" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Link Trailer (YouTube)</label>
                <Input value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả phim</label>
              <textarea 
                className="w-full min-h-[100px] rounded-lg bg-input border border-border p-3 text-sm focus:border-primary outline-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                    <span className="text-sm font-medium">Phim nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isComingSoon} onChange={e => setFormData({...formData, isComingSoon: e.target.checked})} />
                    <span className="text-sm font-medium">Sắp chiếu</span>
                </label>
            </div>

            <DialogFooter>
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
