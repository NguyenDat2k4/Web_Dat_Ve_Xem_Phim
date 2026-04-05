"use client"

import { useState, useEffect } from "react"
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Eye, 
    Loader2, 
    Image as ImageIcon,
    Video,
    Calendar,
    Tag,
    ExternalLink,
    MoreVertical,
    FileText
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export default function AdminNews() {
  const [news, setNews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentNews, setCurrentNews] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    videoUrl: "",
    category: "Tin điện ảnh",
    isActive: true
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/news")
      const data = await res.json()
      if (res.ok) {
        setNews(data)
      } else {
        toast.error(data.error || "Không thể tải danh sách tin tức")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (item: any = null) => {
    if (item) {
      setCurrentNews(item)
      setFormData({
        title: item.title,
        content: item.content,
        thumbnail: item.thumbnail,
        videoUrl: item.videoUrl || "",
        category: item.category,
        isActive: item.isActive
      })
    } else {
      setCurrentNews(null)
      setFormData({
        title: "",
        content: "",
        thumbnail: "",
        videoUrl: "",
        category: "Tin điện ảnh",
        isActive: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.thumbnail) {
      toast.error("Vui lòng điền đầy đủ tiêu đề, nội dung và ảnh đại diện")
      return
    }

    setIsLoading(true)
    try {
      const url = currentNews ? `/api/admin/news/${currentNews._id}` : "/api/admin/news"
      const method = currentNews ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        toast.success(currentNews ? "Cập nhật thành công!" : "Đã tạo bài viết mới!")
        setIsDialogOpen(false)
        fetchNews()
      } else {
        const data = await res.json()
        toast.error(data.error || "Thao tác thất bại")
      }
    } catch (error) {
      toast.error("Lỗi server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Đã xóa bài viết!")
        fetchNews()
      } else {
        toast.error("Không thể xóa bài viết")
      }
    } catch (error) {
      toast.error("Lỗi server")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Khuyến mãi': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Khuyến mãi</Badge>
      case 'Sự kiện': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Sự kiện</Badge>
      default: return <Badge variant="outline">Tin điện ảnh</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Tin tức & Sự kiện</h1>
          <p className="text-muted-foreground mt-1">Đăng tải thông báo, khuyến mãi và trailer phim mới nhất.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-10 px-4 bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Viết bài mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng bài viết</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">{news.length}</div>
                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">Hoạt động bình thường</p>
            </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng lượt xem</CardTitle>
                <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">{news.reduce((acc, item) => acc + (item.views || 0), 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">+12% so với tháng trước</p>
            </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Phân loại</CardTitle>
                <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">3 Chuyên mục</div>
                <div className="flex gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-border bg-background transition-all focus:ring-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-[100px]">Ảnh</TableHead>
                  <TableHead>Tiêu đề & Chuyên mục</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredNews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Không tìm thấy bài viết nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNews.map((item) => (
                    <TableRow key={item._id} className="group border-border hover:bg-secondary/30 transition-colors">
                      <TableCell>
                        <div className="relative w-16 h-10 rounded-md overflow-hidden bg-secondary border border-border shadow-sm">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-sm line-clamp-1">{item.title}</span>
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {item.videoUrl && (
                                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 h-5">
                                    <Video className="h-3 w-3" /> Trailer
                                </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {item.author}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                            <DropdownMenuItem onClick={() => handleOpenDialog(item)} className="cursor-pointer gap-2">
                              <Edit2 className="h-3.5 w-3.5" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => window.open(`/news/${item.slug}`, '_blank')}>
                              <ExternalLink className="h-3.5 w-3.5" /> Xem thực tế
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item._id)} 
                              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Xóa bài viết
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

      {/* Write/Edit News Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-card border-border overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {currentNews ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {currentNews ? "Chỉnh sửa bài viết" : "Viết bài mới"}
            </DialogTitle>
            <DialogDescription>
                Tạo nội dung hấp dẫn để truyền tải thông điệp từ CineMax đến khách hàng.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Tiêu đề bài viết
                    </label>
                    <Input
                        placeholder="VD: Top 10 bộ phim bom tấn không thể bỏ lỡ tháng này"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="bg-secondary/20 border-border h-11 focus:ring-primary/20"
                    />
                </div>

                {/* Category & Thumbnail */}
                <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" /> Chuyên mục
                    </label>
                    <Select 
                        value={formData.category} 
                        onValueChange={(val) => setFormData({...formData, category: val})}
                    >
                        <SelectTrigger className="bg-secondary/20 border-border h-11">
                            <SelectValue placeholder="Chọn chuyên mục" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                            <SelectItem value="Tin điện ảnh">Tin điện ảnh</SelectItem>
                            <SelectItem value="Sự kiện">Sự kiện</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Link ảnh đại diện
                    </label>
                    <Input
                        placeholder="Link ảnh (HTTPS)..."
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                        className="bg-secondary/20 border-border h-11 focus:ring-primary/20"
                    />
                </div>

                {/* Video URL (Optional) */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" /> YouTube Video ID (Tùy chọn - Dùng cho Trailer)
                    </label>
                    <div className="relative">
                        <Input
                            placeholder="Chỉ nhập ID video, vd: dQw4w9WgXcQ"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                            className="bg-secondary/20 border-border h-11 pl-12 focus:ring-primary/20"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                            ID:
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Nếu có video, bài viết sẽ được hiển thị kèm nhãn &quot;Trailer&quot; và có trình phát video ở đầu trang chi tiết.</p>

                </div>

                {/* Content */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" /> Nội dung bài viết (Hỗ trợ HTML/Markdown)
                    </label>
                    <Textarea
                        placeholder="Nhập nội dung chi tiết bài viết tại đây..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="bg-secondary/20 border-border min-h-[250px] focus:ring-primary/20 leading-relaxed"
                    />
                </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="h-11">
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentNews ? "Cập nhật" : "Xuất bản ngay"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`rounded-xl border ${className}`}>{children}</div>
}

function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex flex-col space-y-1.5 ${className}`}>{children}</div>
}

function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`${className}`}>{children}</div>
}
