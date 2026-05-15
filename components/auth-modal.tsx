"use client"

import { useState, useEffect, useRef } from "react"
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
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgotPassword'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Initialize Google & Facebook Login
  useEffect(() => {
    const initializeSocialAuth = () => {
      // Google
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (typeof window !== 'undefined' && (window as any).google && googleClientId) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
        });
      }

      // Facebook
      const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (typeof window !== 'undefined' && (window as any).FB && fbAppId) {
        (window as any).FB.init({
          appId: fbAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }
    };

    const timer = setTimeout(initializeSocialAuth, 1000);
    return () => clearTimeout(timer);
  }, []);

  async function handleGoogleResponse(response: any) {
    if (!isMounted.current) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/social/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      
      if (!isMounted.current) return;

      if (res.ok) {
        setAuthUser(data);
        toast.success("Đăng nhập Google thành công!");
        onClose();
      } else {
        toast.error(data.error || "Lỗi đăng nhập Google");
      }
    } catch (err) {
      if (isMounted.current) toast.error("Lỗi kết nối");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }

  const handleGoogleClick = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.prompt();
    } else {
      toast.error("Google Login chưa sẵn sàng");
    }
  };

  const handleFacebookClick = () => {
    if (typeof window !== 'undefined' && (window as any).FB) {
      (window as any).FB.login((response: any) => {
        if (response.authResponse) {
          handleFacebookResponse(response.authResponse.accessToken);
        } else {
          toast.error("Đăng nhập Facebook bị hủy hoặc thất bại");
        }
      }, { scope: 'public_profile,email' });
    } else {
      toast.error("Facebook SDK chưa sẵn sàng");
    }
  };

  const handleFacebookResponse = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/social/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      
      if (!isMounted.current) return;

      if (res.ok) {
        setAuthUser(data);
        toast.success("Đăng nhập Facebook thành công!");
        onClose();
      } else {
        toast.error(data.error || "Lỗi đăng nhập Facebook");
      }
    } catch (err) {
      if (isMounted.current) toast.error("Lỗi kết nối");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (authMode === 'forgotPassword') {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success("Hướng dẫn đặt lại mật khẩu đã được gửi tới email của bạn.")
          setAuthMode('login')
        } else {
          toast.error(data.error || "Có lỗi xảy ra")
        }
      } catch (err) {
        toast.error("Lỗi kết nối")
      } finally {
        setIsLoading(false)
      }
      return
    }

    const endpoint = authMode === 'login' ? "/api/auth/login" : "/api/auth/register"
    const payload = authMode === 'login' 
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
        if (authMode === 'register') {
          toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.")
          setAuthMode('login')
          setFormData({ ...formData, password: "" }) // Giữ email lại cho tiện
        } else {
          setAuthUser(data)
          toast.success("Đăng nhập thành công!")
          onClose()
        }
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
            {authMode === 'login' ? "Đăng nhập CineMax" : authMode === 'register' ? "Tạo tài khoản mới" : "Quên mật khẩu"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {authMode === 'login' ? "Nhập thông tin để tiếp tục trải nghiệm điện ảnh" : 
             authMode === 'register' ? "Tham gia ngay để nhận nhiều ưu đãi hấp dẫn" : 
             "Nhập email để nhận hướng dẫn đặt lại mật khẩu"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {authMode === 'register' && (
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

          {authMode !== 'forgotPassword' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                {authMode === 'login' && (
                  <button 
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setAuthMode('forgotPassword')}
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
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
          )}

          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {authMode === 'login' ? "Đăng nhập" : authMode === 'register' ? "Đăng ký ngay" : "Gửi yêu cầu"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="h-11 font-medium hover:bg-accent/50 transition-colors"
              onClick={handleGoogleClick}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-11 font-medium hover:bg-accent/50 transition-colors"
              onClick={handleFacebookClick}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {authMode === 'login' ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
            </span>
            {" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? "Đăng ký tại đây" : "Đăng nhập ngay"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
