"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

function VerifyEmailContent() {
  const { logout } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Đăng xuất tài khoản hiện tại (nếu có) để tránh nhầm lẫn phiên làm việc
    logout()
    
    if (!token) {
      setStatus('error')
      setMessage("Mã xác thực không hợp lệ.")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.error || "Xác thực thất bại.")
        }
      } catch (error) {
        setStatus('error')
        setMessage("Lỗi kết nối server.")
      }
    }

    verify()
  }, [token])

  return (
    <div className="max-w-md mx-auto text-center py-20 bg-card border border-border rounded-3xl p-8 shadow-xl">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-bold">Đang xác thực tài khoản...</h2>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Tuyệt vời!</h2>
          <p className="text-muted-foreground mb-8">Tài khoản của bạn đã được xác thực thành công. Bạn có thể bắt đầu đặt vé ngay bây giờ.</p>
          <Link href="/">
            <Button className="w-full h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20">
              Khám phá phim ngay
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Xác thực thất bại</h2>
          <p className="text-muted-foreground mb-8">{message}</p>
          <Link href="/">
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border">
              Quay lại trang chủ
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-32">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <VerifyEmailContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
