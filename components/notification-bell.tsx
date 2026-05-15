"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export function NotificationBell() {
    const { user, refreshUser } = useAuth()
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const unreadCount = notifications.filter(n => !n.isRead).length

    const fetchNotifications = useCallback(async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const res = await fetch("/api/user/notifications")
            const data = await res.json()
            if (res.ok) {
                setNotifications(data)
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchNotifications()
        }
    }, [user, fetchNotifications])

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/user/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id, markAll: !id })
            })
            fetchNotifications()
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    if (!user) return null

    return (
        <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border shadow-2xl p-0 overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                    <h3 className="font-bold">Thông báo</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={() => markAsRead()}
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    className={`p-4 transition-colors hover:bg-secondary/50 cursor-pointer relative ${!notification.isRead ? "bg-primary/5" : ""}`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <div className="flex justify-between gap-2 mb-1">
                                        <p className={`text-sm font-bold ${!notification.isRead ? "text-primary" : "text-foreground"}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Bạn chưa có thông báo nào</p>
                        </div>
                    )}
                </div>
                
                <div className="p-2 border-t border-border bg-secondary/10">
                    <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest h-8">
                        Xem tất cả
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
