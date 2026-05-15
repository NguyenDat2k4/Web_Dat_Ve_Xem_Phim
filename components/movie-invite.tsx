"use client"

import { Button } from "@/components/ui/button"
import { Share2, Users, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface MovieInviteProps {
    movieTitle: string
}

export function MovieInvite({ movieTitle }: MovieInviteProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const shareData = {
            title: `Cùng xem ${movieTitle} tại CineMax`,
            text: `Chào bạn, mình thấy bộ phim ${movieTitle} đang rất hay. Chúng mình cùng đi xem nhé!`,
            url: window.location.href
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.error("Error sharing:", err)
            }
        } else {
            handleCopy()
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success("Đã copy link mời bạn bè!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">Mời bạn bè đi cùng</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
                Chia sẻ link phim này để bạn bè cùng đặt vé và ngồi cạnh nhau nhé!
            </p>

            <div className="grid grid-cols-2 gap-3">
                <Button 
                    variant="outline" 
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 gap-2 h-11"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4" />
                    Chia sẻ
                </Button>
                <Button 
                    variant="outline" 
                    className="rounded-xl border-border gap-2 h-11"
                    onClick={handleCopy}
                >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Đã copy" : "Copy link"}
                </Button>
            </div>
        </div>
    )
}
