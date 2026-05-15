import { BookingClient } from "@/components/booking-client"
import { notFound } from "next/navigation"

async function getMovies() {
  const res = await fetch(`http://localhost:3000/api/movies`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function MysteryBookingPage({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}) {
  const movies = await getMovies()
  // Filter for currently playing movies (now-playing)
  const availableMovies = movies.filter((m: any) => m.status === 'now-playing' || !m.isComingSoon)
  
  if (availableMovies.length === 0) notFound()

  // Pick a random movie
  const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)]

  // Mystery settings
  const cinema = "CineMax Mystery"
  const time = "19:00" // Default mystery time or pick random
  const date = "Hôm nay"
  const basePrice = 30000 // Special price for mystery ticket

  return (
    <div className="min-h-screen bg-background">
      <BookingClient 
        movie={randomMovie} 
        cinema={cinema} 
        time={time} 
        date={date} 
        basePrice={basePrice}
        isMystery={true}
      />
    </div>
  )
}
