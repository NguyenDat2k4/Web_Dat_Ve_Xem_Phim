"use client"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Sparkles, HelpCircle, Gift, Info } from "lucide-react"
import { motion } from "framer-motion"

export function MysteryMovieCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* "Poster" Section (Aspect matched to MovieCard) */}
      <div className="relative aspect-[2/3] block overflow-hidden bg-slate-900">
        {/* Background Animated Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900 to-cyan-900/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Mystery Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Mystery Icon / Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {/* Animated Question Mark */}
          <motion.div
              animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative z-10"
          >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md border border-primary/30 relative">
                  <HelpCircle className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  <div className="absolute inset-0 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin duration-[3s]" />
              </div>
          </motion.div>

          <div className="mt-4 space-y-1">
              <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tighter italic">
                  VÉ PHIM <span className="text-primary">BÍ ẨN</span>
              </h3>
              <p className="text-[10px] text-primary-foreground/60 font-medium">
                  Khám phá bất ngờ
              </p>
          </div>
        </div>

        {/* Label Badge */}
        <div className="absolute top-0 left-0 bg-primary px-2 py-1 rounded-br-lg text-[9px] font-black text-primary-foreground z-20 shadow-lg">
          HOT
        </div>

        {/* Savings Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent/90 text-accent-foreground rounded-full px-2 py-0.5 z-10 text-[9px] font-bold">
            <Gift className="h-3 w-3" />
            -70%
        </div>
      </div>

      {/* Info Section (Matched to MovieCard padding) */}
      <div className="p-4 bg-card">
        <div className="space-y-2 mb-3">
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-foreground">30.000đ</span>
                <span className="text-[10px] text-muted-foreground line-through">110.000đ</span>
            </div>

            <div className="flex items-start gap-1.5 bg-secondary/50 p-2 rounded-lg border border-border">
                <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground leading-tight italic line-clamp-2">
                    Tên phim sẽ được tiết lộ khi bạn nhận vé tại quầy.
                </p>
            </div>
        </div>

        <Link href="/movie/mystery-booking" className="block">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-xs h-10">
            THỬ THÁCH NGAY
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
