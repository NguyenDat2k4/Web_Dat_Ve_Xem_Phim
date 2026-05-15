"use client"

import { useAuth } from "@/context/AuthContext"
import { Crown, Star, Shield, Zap, Info, ArrowUpRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function MembershipCard() {
    const { user } = useAuth()
    
    if (!user) return null

    const ranks = {
        'Đồng': { icon: Shield, color: 'text-orange-400', bg: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30', next: 'Bạc', target: 1000000 },
        'Bạc': { icon: Star, color: 'text-slate-300', bg: 'from-slate-400/20 to-slate-400/5', border: 'border-slate-400/30', next: 'Vàng', target: 5000000 },
        'Vàng': { icon: Crown, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-500/5', border: 'border-yellow-500/30', next: 'Kim Cương', target: 10000000 },
        'Kim Cương': { icon: Zap, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', next: 'MAX', target: 20000000 }
    }

    const currentRank = ranks[user.rank as keyof typeof ranks] || ranks['Đồng']
    const Icon = currentRank.icon
    const totalSpent = user.totalSpent || 0
    const points = user.points || 0
    const progress = Math.min((totalSpent / currentRank.target) * 100, 100)

    return (
        <div className={`relative overflow-hidden rounded-3xl border-2 ${currentRank.border} bg-gradient-to-br ${currentRank.bg} p-8 shadow-2xl`}>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-md flex items-center justify-center border ${currentRank.border}`}>
                            <Icon className={`h-8 w-8 ${currentRank.color}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Thành Viên {user.rank}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CineMax Elite Club</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Mã thành viên</p>
                        <p className="font-mono font-bold text-sm">CMX-{(user.id || user._id || "000000").slice(-6).toUpperCase()}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <p className="text-sm font-bold">Tiến trình lên {currentRank.next}</p>
                        <p className="text-sm font-black text-primary">{totalSpent.toLocaleString()} / {currentRank.target.toLocaleString()} VNĐ</p>
                    </div>
                    <Progress value={progress} className="h-3 bg-background/50 border border-white/5" />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Chi tiêu thêm {(currentRank.target - totalSpent).toLocaleString()} VNĐ để thăng hạng.
                    </p>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                    <div className="bg-background/40 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/5 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Điểm thưởng</p>
                        <p className="text-xl font-black text-primary">{points.toLocaleString()} pts</p>
                    </div>
                    <div className="bg-background/40 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/5 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Chiết khấu rạp</p>
                        <p className="text-xl font-black text-emerald-400">-{user.rank === 'Đồng' ? '0' : user.rank === 'Bạc' ? '5' : user.rank === 'Vàng' ? '10' : '15'}%</p>
                    </div>
                </div>

                <Button variant="outline" className="w-full h-12 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-white/10 font-bold gap-2" onClick={() => window.location.href='/profile/rewards'}>
                    KHÁM PHÁ ĐẶC QUYỀN
                    <ArrowUpRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
