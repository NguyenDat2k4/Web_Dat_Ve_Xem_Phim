import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Cinema from '@/models/Cinema'

export async function GET() {
  try {
    await dbConnect()
    const cinemas = await Cinema.find({}).sort({ rating: -1 })
    return NextResponse.json(cinemas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
