import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Combo from '@/models/Combo'

export async function GET() {
  try {
    await dbConnect()
    const combos = await Combo.find({ isActive: true }).sort({ price: 1 })
    return NextResponse.json(combos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
