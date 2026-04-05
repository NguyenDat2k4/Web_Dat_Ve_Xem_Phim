"use client"

import { useState, useEffect } from "react"
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Loader2, 
    Image as ImageIcon,
    Tag,
    MoreVertical,
    Soup,
    DollarSign,
    Info,
    CheckCircle2,
    XCircle
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function AdminCombos() {
  const [combos, setCombos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCombo, setCurrentCombo] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    isActive: true
  })

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/combos")
      const data = await res.json()
      if (res.ok) {
        setCombos(data)
      } else {
        toast.error(data.error || "Không thể tải danh sách combo")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (item: any = null) => {
    if (item) {
      setCurrentCombo(item)
      setFormData({
        name: item.name,
        price: item.price.toString(),
        description: item.description,
        image: item.image,
        isActive: item.isActive
      })
    } else {
      setCurrentCombo(null)
      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        isActive: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.description || !formData.image) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    setIsLoading(true)
    try {
      const url = currentCombo ? `/api/admin/combos/${currentCombo._id}` : "/api/admin/combos"
      const method = currentCombo ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            price: Number(formData.price)
        })
      })
      
      if (res.ok) {
        toast.success(currentCombo ? "Cập nhật thành công!" : "Đã tạo combo mới!")
        setIsDialogOpen(false)
        fetchCombos()
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
    if (!confirm("Bạn có chắc chắn muốn xóa combo này không?")) return
    
    try {
      const res = await fetch(`/api/admin/combos/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Đã xóa combo!")
        fetchCombos()
      } else {
        toast.error("Không thể xóa combo")
      }
    } catch (error) {
      toast.error("Lỗi server")
    }
  }

  const filteredCombos = combos.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Bắp Nước & Combos</h1>
          <p className="text-muted-foreground mt-1">Quản lý danh sách các gói sản phẩm bắp và nước uống đính kèm.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-10 px-4 bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Thêm Combo mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số Combo</CardTitle>
                <Soup className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">{combos.length}</div>
                <p className="text-xs text-muted-foreground mt-1 text-emerald-500">Hoạt động bình thường</p>
            </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Đang kinh doanh</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">{combos.filter(c => c.isActive).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Sẵn sàng phục vụ</p>
            </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Giá cao nhất</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">
                    {combos.length > 0 ? Math.max(...combos.map(c => c.price)).toLocaleString() : 0}đ
                </div>
                <p className="text-xs text-muted-foreground mt-1">Giá trị trung bình cao</p>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên combo..."
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
                  <TableHead className="w-[80px]">Ảnh</TableHead>
                  <TableHead>Tên Combo & Mô tả</TableHead>
                  <TableHead>Giá (VNĐ)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Đang tải dữ liệu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCombos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Không tìm thấy combo nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCombos.map((item) => (
                    <TableRow key={item._id} className="group border-border hover:bg-secondary/30 transition-colors">
                      <TableCell>
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary border border-border shadow-sm">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm tracking-tight">{item.name}</span>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="h-3 w-3" /> {item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-sm">
                        {item.price.toLocaleString()}đ
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"} className={`gap-1.5 border-none h-6 ${item.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {item.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {item.isActive ? "Đang bán" : "Ngừng bán"}
                        </Badge>
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
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item._id)} 
                              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Xóa combo
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

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {currentCombo ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                {currentCombo ? "Chỉnh sửa Combo" : "Thêm Combo mới"}
            </DialogTitle>
            <DialogDescription>
                Thiết lập thông tin sản phẩm bắp và nước uống hiển thị tại trang đặt hàng.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4 px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                         Tên Combo
                    </label>
                    <Input
                        placeholder="VD: Combo Solo, Combo Couple 1..."
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-secondary/20 border-border h-11 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" /> Giá bán (đ)
                    </label>
                    <Input
                        type="number"
                        placeholder="70000"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="bg-secondary/20 border-border h-11 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2 text-center md:text-left">
                     <label className="text-sm font-bold block mb-3">Hiển thị bán hàng</label>
                     <div className="flex items-center justify-center md:justify-start gap-3 h-11">
                        <Switch 
                            checked={formData.isActive}
                            onCheckedChange={(val) => setFormData({...formData, isActive: val})}
                        />
                        <span className={formData.isActive ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                            {formData.isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                     </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Link ảnh minh họa
                    </label>
                    <Input
                        placeholder="https://..."
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="bg-secondary/20 border-border h-11 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                        Mô tả gói sản phẩm
                    </label>
                    <Textarea
                        placeholder="VD: 1 bắp vừa + 1 nước ngọt 22oz..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="bg-secondary/20 border-border min-h-[100px] focus:ring-primary/20"
                    />
                </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border mt-6">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="h-11">
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={isLoading} className="h-11 px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentCombo ? "Cập nhật" : "Tạo Combo"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
