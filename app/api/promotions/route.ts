import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Promotion from '@/models/Promotion'

export async function GET() {
  try {
    await dbConnect()
    const promotions = await Promotion.find({})
    return NextResponse.json(promotions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
