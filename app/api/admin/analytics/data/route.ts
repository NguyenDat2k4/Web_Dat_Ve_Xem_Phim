import { NextResponse } from "next/server";
import * as adminTools from "@/lib/admin-ai-tools";

export async function GET() {
  try {
    const data = await adminTools.getRevenueData();
    const stats = await adminTools.getOccupancyStats();
    
    return NextResponse.json({ 
      ...data,
      occupancy: stats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
