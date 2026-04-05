"use client"

import { useState, useEffect, use } from "react"
import { 
    Save, 
    ArrowLeft, 
    Loader2, 
    Armchair, 
    Grid3X3, 
    MousePointer2, 
    Trash2,
    Settings2,
    CheckCircle2,
    Info,
    History,
    ChevronRight,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import Link from "next/link"
import { useRouter } from "next/navigation"

type SeatType = 'regular' | 'vip' | 'couple' | 'hidden'
type BrushType = SeatType | 'toggle-status'

interface SeatState {
    row: string;
    number: number;
    type: SeatType;
    status: 'active' | 'maintenance';
    x: number;
    y: number;
}

export default function SeatEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [room, setRoom] = useState<any>(null)
  const [grid, setGrid] = useState<SeatState[][]>([])
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(12)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeBrush, setActiveBrush] = useState<BrushType>('regular')

  useEffect(() => {
    fetchRoomData()
  }, [id])

  const fetchRoomData = async () => {
    setIsLoading(true)
    try {
      const [roomRes, seatsRes] = await Promise.all([
        fetch(`/api/admin/rooms/${id}`),
        fetch(`/api/admin/seats?roomId=${id}`)
      ])
      
      const roomData = await roomRes.json()
      const seatsData = await seatsRes.json()
      
      if (roomRes.ok) {
        setRoom(roomData)
        if (seatsData.length > 0) {
            const maxX = Math.max(...seatsData.map((s: any) => s.x)) + 1
            const maxY = Math.max(...seatsData.map((s: any) => s.y)) + 1
            const newRows = Math.max(maxY, 10)
            const newCols = Math.max(maxX, 12)
            setRows(newRows)
            setCols(newCols)
            initializeGrid(newRows, newCols, seatsData)
        } else {
            initializeGrid(10, 12, [])
        }
      }
    } catch (error) {
      toast.error("Lỗi tải dữ liệu phòng")
    } finally {
      setIsLoading(false)
    }
  }

  const initializeGrid = (r: number, c: number, existingSeats: any[]) => {
    const newGrid: SeatState[][] = []
    for (let y = 0; y < r; y++) {
      const rowArr: SeatState[] = []
      for (let x = 0; x < c; x++) {
        const existing = existingSeats.find(s => s.x === x && s.y === y)
        if (existing) {
          rowArr.push({
            row: existing.row,
            number: existing.number,
            type: existing.type,
            status: existing.status,
            x: existing.x,
            y: existing.y
          })
        } else {
          rowArr.push({
            row: String.fromCharCode(65 + y),
            number: x + 1,
            type: 'hidden',
            status: 'active',
            x,
            y
          })
        }
      }
      newGrid.push(rowArr)
    }
    setGrid(newGrid)
  }

  const handleCellClick = (y: number, x: number) => {
    const newGrid = [...grid]
    const cell = { ...newGrid[y][x] }

    if (activeBrush === 'toggle-status') {
      cell.status = cell.status === 'active' ? 'maintenance' : 'active'
    } else {
      cell.type = activeBrush as SeatType
    }

    newGrid[y][x] = cell
    recalculateNumbering(newGrid)
    setGrid(newGrid)
  }

  const recalculateNumbering = (currentGrid: SeatState[][]) => {
    currentGrid.forEach((rowArr, y) => {
      let seatNum = 1
      const rowLetter = String.fromCharCode(65 + y)
      rowArr.forEach((cell, x) => {
        cell.row = rowLetter
        if (cell.type !== 'hidden') {
          cell.number = seatNum++
        }
      })
    })
  }

  const handleRowFill = (y: number) => {
    const newGrid = [...grid]
    newGrid[y] = newGrid[y].map(cell => ({
        ...cell,
        type: activeBrush === 'toggle-status' ? cell.type : activeBrush as SeatType,
        status: activeBrush === 'toggle-status' ? (cell.status === 'active' ? 'maintenance' : 'active') : cell.status
    }))
    recalculateNumbering(newGrid)
    setGrid(newGrid)
    toast.info(`Đã phủ hàng ${String.fromCharCode(65 + y)} bằng ${activeBrush}`)
  }

  const handleColFill = (x: number) => {
    const newGrid = [...grid]
    for (let y = 0; y < rows; y++) {
        newGrid[y][x] = {
            ...newGrid[y][x],
            type: activeBrush === 'toggle-status' ? newGrid[y][x].type : activeBrush as SeatType,
            status: activeBrush === 'toggle-status' ? (newGrid[y][x].status === 'active' ? 'maintenance' : 'active') : newGrid[y][x].status
        }
    }
    recalculateNumbering(newGrid)
    setGrid(newGrid)
    toast.info(`Đã phủ cột ${x + 1} bằng ${activeBrush}`)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const flatSeats = grid.flat().filter(s => s.type !== 'hidden')
      const res = await fetch("/api/admin/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: id, seats: flatSeats })
      })

      if (res.ok) {
        toast.success("Đã lưu sơ đồ ghế!")
        router.push("/admin/rooms")
      } else {
        toast.error("Lỗi khi lưu sơ đồ")
      }
    } catch (error) {
      toast.error("Lỗi kết nối server")
    } finally {
      setIsSaving(false)
    }
  }

  const changeGridSize = () => {
    if (confirm("Thay đổi kích thước lưới sẽ đặt lại các tùy chỉnh hiện tại (nếu lưới bị thu hẹp). Tiếp tục?")) {
        initializeGrid(rows, cols, grid.flat().filter(s => s.type !== 'hidden'))
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/rooms">
            <Button variant="ghost" size="icon" className="hover:bg-secondary/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                Thiết kế Sơ đồ: <span className="text-primary">{room?.name}</span>
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-70">
                {room?.cinema?.name} • {room?.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-primary/20" onClick={() => fetchRoomData()}>
              <History className="h-4 w-4" /> Hoàn tác
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu sơ đồ ghế
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Toolbar */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Cấu trúc lưới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Số hàng (Dọc)</label>
                  <Input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Số cột (Ngang)</label>
                  <Input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} />
                </div>
              </div>
              <Button variant="secondary" className="w-full text-xs font-bold" onClick={changeGridSize}>
                  Áp dụng lưới mới
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer2 className="h-5 w-5 text-primary" />
                Bộ công cụ vẽ
              </CardTitle>
              <CardDescription className="text-[10px]">
                Chọn cọ và nhấn vào ô hoặc thẻ hàng/cột để phủ hàng loạt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <BrushButton 
                active={activeBrush === 'regular'} 
                onClick={() => setActiveBrush('regular')} 
                icon={Armchair} 
                label="Ghế Thường" 
                color="bg-zinc-800 border-zinc-700 hover:border-white/40 text-white/40"
              />
              <BrushButton 
                active={activeBrush === 'vip'} 
                onClick={() => setActiveBrush('vip')} 
                icon={Armchair} 
                label="Ghế VIP" 
                color="bg-amber-500/20 text-amber-500 border border-amber-500/50"
              />
              <BrushButton 
                active={activeBrush === 'couple'} 
                onClick={() => setActiveBrush('couple')} 
                icon={Armchair} 
                label="Ghế Couple (Đôi)" 
                color="bg-rose-500/20 text-rose-500 border border-rose-500/50"
              />
              <BrushButton 
                active={activeBrush === 'hidden'} 
                onClick={() => setActiveBrush('hidden')} 
                icon={Trash2} 
                label="Xóa / Lối đi" 
                color="bg-white/5 border border-dashed border-white/10 text-white/20"
              />
              <div className="pt-4 border-t border-border">
                <BrushButton 
                    active={activeBrush === 'toggle-status'} 
                    onClick={() => setActiveBrush('toggle-status')} 
                    icon={Info} 
                    label="Bảo trì / Hỏng" 
                    color="bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-dashed border-border p-4">
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Tổng số ghế:</span>
                    <span className="font-black text-primary">{grid.flat().filter(s => s.type !== 'hidden').length}</span>
                </div>
             </div>
          </Card>
        </div>

        {/* Visual Editor Board */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border overflow-hidden shadow-2xl relative min-h-[750px] flex flex-col">
            <div className="p-12 pb-44 overflow-auto flex-1 flex flex-col items-center bg-[#0a0a0a] bg-[radial-gradient(#1a1a1a_px,transparent_1px)] [background-size:20px_20px]">
              {/* Cinema Screen Mock */}
              <div className="w-[80%] mx-auto mb-24 text-center relative">
                 <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_30px_rgba(244,63,94,0.8)]" />
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full">
                    <span className="text-[12px] uppercase tracking-[0.8em] font-black text-primary/60">MÀN HÌNH CHÍNH</span>
                 </div>
              </div>

              {/* Grid Wrapper with Headers */}
              <div className="relative flex flex-col items-center">
                  {/* Column Headers */}
                  <div className="flex mb-4 ml-10">
                      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                          {Array.from({ length: cols }).map((_, x) => (
                              <button 
                                key={x} 
                                onClick={() => handleColFill(x)}
                                className="w-10 h-8 flex flex-col items-center justify-center text-[10px] font-black text-white/20 hover:text-primary hover:bg-primary/20 rounded-lg group transition-all"
                                title={`Phủ toàn bộ cột ${x+1}`}
                              >
                                {x + 1}
                                <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex items-start gap-4">
                      {/* Row Headers */}
                      <div className="flex flex-col gap-3 mt-1">
                          {Array.from({ length: rows }).map((_, y) => (
                              <button 
                                key={y} 
                                onClick={() => handleRowFill(y)}
                                className="w-10 h-10 flex items-center justify-center gap-1 text-sm font-black text-white/20 hover:text-primary hover:bg-primary/20 rounded-lg group transition-all px-2"
                                title={`Phủ toàn bộ hàng ${String.fromCharCode(65+y)}`}
                              >
                                {String.fromCharCode(65 + y)}
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                          ))}
                      </div>

                      {/* Seats Grid */}
                      <div className="inline-grid gap-3 p-8 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl relative" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                        {grid.map((rowArr, y) => (
                          rowArr.map((cell, x) => (
                            <button
                              key={`${y}-${x}`}
                              onClick={() => handleCellClick(y, x)}
                              className={`
                                w-10 h-10 rounded-xl relative transition-all duration-300 group flex items-center justify-center
                                ${cell.type === 'hidden' ? 'bg-white/5 border border-dashed border-white/10 hover:bg-white/10' : 'shadow-xl hover:scale-110 active:scale-95 border-2'}
                                ${cell.type === 'regular' ? 'bg-zinc-800 border-zinc-700 hover:border-white/40 text-white/40' : ''}
                                ${cell.type === 'vip' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 hover:bg-amber-500/30' : ''}
                                ${cell.type === 'couple' ? 'bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30' : ''}
                                ${cell.status === 'maintenance' ? 'opacity-50 grayscale' : ''}
                              `}
                            >
                              {cell.type !== 'hidden' && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-primary px-2 py-1 rounded-md text-[10px] font-black text-white z-50 pointer-events-none shadow-xl shadow-primary/20 border border-white/20">
                                    {cell.row}{cell.number}
                                </div>
                              )}
                              
                              {cell.type !== 'hidden' && (
                                  <Armchair className={`h-5 w-5 ${cell.type === 'hidden' ? 'opacity-0' : 'opacity-100'}`} />
                              )}
                              
                              {cell.status === 'maintenance' && (
                                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 z-10 shadow-lg ring-2 ring-black">
                                      <Info className="h-2.5 w-2.5 text-black" />
                                  </div>
                              )}

                              {cell.type === 'hidden' && (
                                 <span className="text-[8px] font-bold text-white/5 group-hover:text-white/40 transition-colors uppercase">
                                    {String.fromCharCode(65+y)}{x+1}
                                 </span>
                              )}
                            </button>
                          ))
                        ))}
                      </div>
                  </div>
              </div>
            </div>

            {/* Layout Legend Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-lg border-t border-white/5 flex justify-center gap-10">
                <LegendItem color="bg-zinc-800 border-zinc-700 border-2" label="Ghế Thường" />
                <LegendItem color="bg-amber-500/20 border-amber-500/50 border-2" label="Ghế VIP" />
                <LegendItem color="bg-rose-500/20 border-rose-500/50 border-2" label="Ghế Couple" />
                <LegendItem color="bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" label="Bảo trì" />
                <LegendItem color="bg-white/5 border border-dashed border-white/20" label="Lối đi" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BrushButton({ active, onClick, icon: Icon, label, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all border
        ${active ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5 text-primary' : 'bg-secondary/20 border-transparent hover:bg-secondary/40 text-muted-foreground'}
      `}
    >
      <div className={`p-2 rounded-lg ${color} shadow-inner`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-bold leading-none">{label}</span>
      {active && <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />}
    </button>
  )
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.1em] uppercase text-white/40 group hover:text-white/80 transition-colors">
            <div className={`w-3.5 h-3.5 rounded-sm ${color} transition-transform group-hover:scale-125`} />
            {label}
        </div>
    )
}
