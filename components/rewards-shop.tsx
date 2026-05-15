"use client"

import { useState, useEffect } from "react"
import { Gift, Coins, CheckCircle2, Loader2, ArrowRight, Ticket, Coffee, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import Image from "next/image"

interface Reward {
    _id: string
    title: string
    description: string
    pointsRequired: number
    image: string
    type: 'voucher' | 'combo' | 'gift'
    value: number
}

export function RewardsShop() {
    const { user, refreshUser } = useAuth()
    const [rewards, setRewards] = useState<Reward[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null)

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const res = await fetch("/api/rewards")
                const data = await res.json()
                if (res.ok) setRewards(data)
            } catch (error) {
                console.error("Failed to fetch rewards")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRewards()
    }, [])

    const handleRedeem = async (rewardId: string) => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để đổi quà")
            return
        }

        setIsRedeeming(rewardId)
        try {
            const res = await fetch("/api/rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(`Đổi quà thành công! Mã của bạn: ${data.code}`)
                refreshUser()
            } else {
                toast.error(data.error || "Không thể đổi quà")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        } finally {
            setIsRedeeming(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-3xl border border-primary/20">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                        <Gift className="h-8 w-8 text-primary" />
                        CineMax Rewards Shop
                    </h2>
                    <p className="text-muted-foreground">Sử dụng CinePoints của bạn để đổi lấy những phần quà hấp dẫn.</p>
                </div>
                <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Coins className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Điểm hiện có</p>
                        <p className="text-2xl font-black text-primary">{user?.points?.toLocaleString() || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewards.map((reward) => (
                    <Card key={reward._id} className="overflow-hidden border-2 border-border hover:border-primary/30 transition-all group rounded-3xl shadow-lg hover:shadow-primary/5">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image 
                                src={reward.image} 
                                alt={reward.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                unoptimized
                            />
                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-lg flex items-center gap-2">
                                <Coins className="h-4 w-4 text-primary" />
                                <span className="font-black text-primary">{reward.pointsRequired}</span>
                            </div>
                            <div className="absolute top-4 left-4">
                                {reward.type === 'voucher' && <Badge className="bg-blue-500 gap-1"><Tag className="h-3 w-3" /> VOUCHER</Badge>}
                                {reward.type === 'combo' && <Badge className="bg-orange-500 gap-1"><Coffee className="h-3 w-3" /> COMBO</Badge>}
                                {reward.type === 'gift' && <Badge className="bg-purple-500 gap-1"><Gift className="h-3 w-3" /> QUÀ TẶNG</Badge>}
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold line-clamp-1">{reward.title}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10">{reward.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 text-xs font-medium text-muted-foreground">
                                Hạn sử dụng: 30 ngày kể từ khi đổi.
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full h-12 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                                disabled={isRedeeming === reward._id || (user && user.points < reward.pointsRequired)}
                                onClick={() => handleRedeem(reward._id)}
                            >
                                {isRedeeming === reward._id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        ĐỔI NGAY
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black text-white shadow-lg ${className}`}>
            {children}
        </span>
    )
}
