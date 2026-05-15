"use client"

import { useState, useEffect } from "react"
import { Sparkles, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function FlashSale() {
    const [isVisible, setIsVisible] = useState(false)
    const [promoCode, setPromoCode] = useState("")

    useEffect(() => {
        // Mô phỏng sự kiện Flash Sale ngẫu nhiên sau 10-20 giây
        const timer = setTimeout(() => {
            setPromoCode("FLASH20")
            setIsVisible(true)
            
            // Tự động đóng sau 15 giây nếu không tương tác
            setTimeout(() => setIsVisible(false), 15000)
        }, 15000)

        return () => clearTimeout(timer)
    }, [])

    const copyCode = () => {
        navigator.clipboard.writeText(promoCode)
        toast.success("Đã copy mã giảm giá! Hãy sử dụng khi đặt vé nhé.")
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 right-6 z-[60] max-w-sm w-full"
                >
                    <div className="bg-gradient-to-r from-primary to-accent p-1 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-background rounded-[14px] p-5 relative overflow-hidden">
                            {/* Decorative background icon */}
                            <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12" />
                            
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="absolute top-2 right-2 p-1 hover:bg-secondary rounded-full transition-colors"
                                aria-label="Đóng thông báo khuyến mãi"
                                title="Đóng"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-foreground">Săn Deal Chớp Nhoáng!</h4>
                                    <p className="text-sm text-muted-foreground">Nhập mã <span className="font-bold text-primary">{promoCode}</span> để được giảm ngay 20% cho mọi suất chiếu trong hôm nay.</p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button 
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
                                    onClick={copyCode}
                                >
                                    NHẬN MÃ NGAY
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
