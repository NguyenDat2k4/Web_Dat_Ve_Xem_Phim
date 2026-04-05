import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { QuickBookingSection } from "@/components/quick-booking-section"
import { NowPlayingSection } from "@/components/now-playing-section"
import { ComingSoonSection } from "@/components/coming-soon-section"
import { CinemasSection } from "@/components/cinemas-section"
import { PromotionsSection } from "@/components/promotions-section"
import { Footer } from "@/components/footer"

async function getMovies(params: string = "") {
  const res = await fetch(`http://localhost:3000/api/movies${params}`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function getCinemas() {
  const res = await fetch('http://localhost:3000/api/cinemas', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function getPromotions() {
  const res = await fetch('http://localhost:3000/api/promotions', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function HomePage() {
  const [featuredMovies, nowPlayingMovies, comingSoonMovies, cinemas, promotions] = await Promise.all([
    getMovies("?featured=true"),
    getMovies("?comingSoon=false"),
    getMovies("?comingSoon=true"),
    getCinemas(),
    getPromotions()
  ])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection movies={featuredMovies} />
      <QuickBookingSection cinemas={cinemas} movies={nowPlayingMovies} />
      <NowPlayingSection movies={nowPlayingMovies} />
      <ComingSoonSection movies={comingSoonMovies} />
      <CinemasSection cinemas={cinemas} />
      <PromotionsSection promotions={promotions} />
      <Footer />
    </main>
  )
}
