import { BookingClient } from "@/components/booking-client"
import { notFound } from "next/navigation"

async function getMovie(id: string) {
  const res = await fetch(`http://localhost:3000/api/movies/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function BookingPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const { id } = await params
  const sParams = await searchParams
  
  const movie = await getMovie(id)
  if (!movie) notFound()

  const cinema = typeof sParams.cinema === 'string' ? sParams.cinema : "CineMax"
  const time = typeof sParams.time === 'string' ? sParams.time : "10:00"
  const date = typeof sParams.date === 'string' ? sParams.date : "Hôm nay, 05/04"

  return (
    <BookingClient 
      movie={movie} 
      cinema={cinema} 
      time={time} 
      date={date} 
    />
  )
}
