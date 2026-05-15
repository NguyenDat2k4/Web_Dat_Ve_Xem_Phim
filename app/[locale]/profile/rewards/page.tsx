"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RewardsShop } from "@/components/rewards-shop"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RewardsPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại cá nhân
                        </Link>
                        <h1 className="text-4xl font-black">Ưu Đãi & Đổi Thưởng</h1>
                    </div>
                    <Button variant="outline" className="rounded-2xl gap-2 h-12 px-6 font-bold border-2 border-primary/20 hover:bg-primary/5" onClick={() => router.push('/profile/history')}>
                        <Ticket className="h-5 w-5 text-primary" />
                        Quà của tôi
                    </Button>
                </div>

                <RewardsShop />
            </div>
            <Footer />
        </main>
    )
}
