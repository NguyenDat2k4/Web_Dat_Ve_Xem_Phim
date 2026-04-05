"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Mail, Lock, User } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login: setAuthUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setAuthUser(data)
        toast.success(isLogin ? "Đăng nhập thành công!" : "Đăng ký thành công!")
        onClose()
      } else {
        toast.error(data.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? "Đăng nhập CineMax" : "Tạo tài khoản mới"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLogin ? "Nhập thông tin để tiếp tục trải nghiệm điện ảnh" : "Tham gia ngay để nhận nhiều ưu đãi hấp dẫn"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isLogin ? "Đăng nhập" : "Đăng ký ngay"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            </span>
            {" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Đăng ký tại đây" : "Đăng nhập ngay"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
