"use client"

import { useState, useEffect } from "react"
import { 
    Search, 
    Plus, 
    Edit2, 
    Trash2, 
    Loader2, 
    User, 
    Mail, 
    Shield, 
    MoreVertical,
    CheckCircle2,
    XCircle,
    UserPlus,
    Filter
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
    DialogDescription,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        points: 0
    })

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                role: roleFilter,
                limit: "10"
            })
            const res = await fetch(`/api/admin/users?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setUsers(data.users)
                setTotalPages(data.pages)
            }
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500)
        return () => clearTimeout(timer)
    }, [page, search, roleFilter])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const method = editingUser ? "PATCH" : "POST"
            const body = editingUser ? { ...formData, id: editingUser._id } : formData
            
            const res = await fetch("/api/admin/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                toast.success(editingUser ? "Đã cập nhật thông tin" : "Đã tạo tài khoản mới")
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                const data = await res.json()
                toast.error(data.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Đã xóa người dùng")
                fetchUsers()
            } else {
                toast.error("Không thể xóa")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        }
    }

    const openEditDialog = (user: any) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            points: user.points || 0
        })
        setIsDialogOpen(true)
    }

    const openAddDialog = () => {
        setEditingUser(null)
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "user",
            points: 0
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-muted-foreground">Quản lý tài khoản khách hàng, nhân viên và quản trị viên</p>
                </div>
                <Button onClick={openAddDialog} className="bg-primary text-primary-foreground gap-2">
                    <UserPlus className="h-4 w-4" /> Thêm tài khoản
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Tìm theo tên hoặc email..." 
                        className="pl-10" 
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select 
                        title="Lọc theo vai trò"
                        className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="user">Khách hàng</option>
                        <option value="staff">Nhân viên</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary/20">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Điểm tích lũy</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    <p className="text-sm text-muted-foreground mt-2">Đang nạp dữ liệu...</p>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    Không tìm thấy người dùng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-secondary/10 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                              user.role === 'staff' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                                              'bg-green-500/10 text-green-500 border-green-500/20'}
                                        `}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user.role === 'admin' ? 'Quản trị' : user.role === 'staff' ? 'Nhân viên' : 'Khách'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isVerified ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3 mr-1" /> Đã xác thực
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                                                <XCircle className="h-3 w-3 mr-1" /> Chưa xác thực
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{user.points?.toLocaleString() || 0} đ</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                    <Edit2 className="h-4 w-4 mr-2" /> Sửa thông tin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Xóa tài khoản
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

            {totalPages > 1 && (
                <div className="pt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); if(page > 1) setPage(page-1); }}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink 
                                        href="#" 
                                        isActive={page === i + 1}
                                        onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); if(page < totalPages) setPage(page+1); }}
                                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Sửa thông tin tài khoản" : "Thêm tài khoản mới"}</DialogTitle>
                        <DialogDescription>Nhập thông tin người dùng. Để trống mật khẩu nếu không muốn đổi.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Họ và tên</label>
                            <Input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input 
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                disabled={!!editingUser}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mật khẩu {editingUser && "(Để trống nếu không đổi)"}</label>
                            <Input 
                                type="password"
                                required={!editingUser}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vai trò</label>
                                <select 
                                    title="Vai trò"
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="user">Khách hàng</option>
                                    <option value="staff">Nhân viên</option>
                                    <option value="admin">Quản trị viên</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Điểm tích lũy</label>
                                <Input 
                                    type="number"
                                    value={formData.points}
                                    onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {editingUser ? "Cập nhật" : "Tạo tài khoản"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
