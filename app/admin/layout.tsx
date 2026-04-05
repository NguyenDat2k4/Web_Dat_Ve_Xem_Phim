"use client"

import { useAuth } from "@/context/AuthContext"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Film, 
  MapPin, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isLoading || !isMounted) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    )
  }

  if (!user || user.role !== 'admin') {
    redirect("/")
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
    { icon: Film, label: "Quản lý Phim", href: "/admin/movies" },
    { icon: MapPin, label: "Quản lý Rạp", href: "/admin/cinemas" },
    { icon: Users, label: "Người dùng", href: "/admin/users" },
  ]

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">CineMax Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-sm text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 mb-4 bg-secondary/50 rounded-xl">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">Quản trị viên</p>
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
        </div>
      </main>
    </div>
  )
}
