"use client"

import { useState, useEffect } from "react"
import { Users, Shield, User as UserIcon, Loader2, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) {
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setUpdatingId(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      })
      if (res.ok) {
        toast.success(`Đã cập nhật quyền thành: ${newRole}`)
        fetchUsers()
      } else {
        toast.error("Lỗi cập nhật quyền")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setUpdatingId(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Phân quyền và quản lý tài khoản thành viên.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {users.length} Thành viên
        </Badge>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Danh sách thành viên
          </CardTitle>
          <CardDescription>Người dùng đăng ký trong hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-medium">Thành viên</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Vai trò</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.role === 'admin' ? (
                          <><Shield className="h-3 w-3 mr-1" /> Admin</>
                        ) : (
                          <><UserIcon className="h-3 w-3 mr-1" /> User</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={user.role === 'admin' ? 'text-destructive' : 'text-primary'}
                        onClick={() => toggleRole(user._id, user.role)}
                        disabled={updatingId === user._id}
                      >
                        {updatingId === user._id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : user.role === 'admin' ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : (
                          <Shield className="h-3 w-3 mr-1" />
                        )}
                        {user.role === 'admin' ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
