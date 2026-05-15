"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  User, 
  Film, 
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCcw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Html5Qrcode } from "html5-qrcode"
import { useCallback } from "react"

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null)
  const [isCameraStarted, setIsCameraStarted] = useState(false)

  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      let ticketCode = ""
      // Thử parse JSON nếu là QR object, nếu không thì lấy text thô
      try {
        const data = JSON.parse(decodedText)
        ticketCode = data.code || decodedText
      } catch {
        ticketCode = decodedText
      }

      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode })
      })

      const data = await res.json()

      if (res.ok) {
        setScanResult(data.booking)
        toast.success("Check-in thành công!")
        // Tự động reset sau 5 giây để quét vé tiếp theo
        setTimeout(() => resetScanner(), 5000)
      } else {
        setError(data.error)
        setScanResult(data.booking || null)
        toast.error(data.error)
      }
    } catch (err) {
      setError("Lỗi kết nối server")
      toast.error("Lỗi kết nối server")
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  const onScanFailure = useCallback((error: any) => {
    // Không cần log lỗi này vì nó quét liên tục
  }, [])

  useEffect(() => {
    let isMounted = true;
    const scanner = new Html5Qrcode("reader")
    setHtml5QrCode(scanner)

    const startCamera = async () => {
      if (scanner.isScanning) return;
      
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0 && isMounted) {
          const cameraId = devices.length > 1 ? devices[1].id : devices[0].id
          
          await scanner.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            onScanFailure
          )
          setIsCameraStarted(true)
          setError(null)
        } else {
          setError("Không tìm thấy camera trên thiết bị này.")
        }
      } catch (err) {
        console.error("Camera access error:", err)
        if (isMounted) {
            setError("Không thể truy cập camera. Có thể thiết bị đang bận hoặc quyền truy cập bị từ chối.")
        }
      }
    }

    // startCamera() // Tắt tự động khởi động để tránh lỗi NotReadableError khi dev reload mạnh
    // Thay vào đó, chúng ta sẽ để người dùng nhấn nút hoặc khởi động sau một khoảng nghỉ ngắn
    const timer = setTimeout(() => {
        if (isMounted) startCamera()
    }, 1000)

    return () => {
      isMounted = false;
      clearTimeout(timer)
      if (scanner.isScanning) {
        scanner.stop().then(() => {
            scanner.clear();
        }).catch(err => console.error("Failed to stop scanner", err))
      }
    }
  }, [onScanSuccess, onScanFailure])

  function resetScanner() {
    setScanResult(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Soát vé (Check-in)</h1>
          <p className="text-muted-foreground text-sm">Sử dụng Camera để quét mã QR trên vé khách hàng.</p>
        </div>
        <Badge variant="outline" className="h-8 gap-1.5 px-3">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Scanner
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Section */}
        <Card className="overflow-hidden border-2 border-primary/10">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Camera Quét Mã
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div id="reader" className="w-full"></div>
            {isProcessing && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-bold">Đang xác thực vé...</span>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
            {!scanResult && !error && (
                <Card className="h-full border-dashed flex items-center justify-center p-12 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                            <Ticket className="h-8 w-8 text-muted-foreground opacity-30" />
                        </div>
                        <p className="text-muted-foreground font-medium">Vui lòng đưa mã QR vào vùng nhận diện</p>
                    </div>
                </Card>
            )}

            {error && (
                <Card className="border-destructive bg-destructive/5 animate-in slide-in-from-right duration-300">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3 text-destructive">
                            <XCircle className="h-8 w-8" />
                            <h3 className="text-xl font-bold">Xác thực thất bại</h3>
                        </div>
                        <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="font-medium text-destructive">{error}</p>
                        </div>
                        <Button onClick={resetScanner} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/10">
                            Quét lại
                        </Button>
                    </CardContent>
                </Card>
            )}

            {scanResult && !error && (
                <Card className="border-green-500 bg-green-500/5 border-2 animate-in slide-in-from-right duration-500">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-3 text-green-600">
                            <CheckCircle2 className="h-8 w-8" />
                            <h3 className="text-xl font-black">VÉ HỢP LỆ</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-green-500/10 pb-3">
                                <Film className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-green-700/50">Phim</p>
                                    <p className="font-black text-lg text-green-900">{scanResult.movie}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-green-700/50">Suất chiếu</p>
                                        <p className="font-bold text-green-900">{scanResult.time} | {scanResult.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Ticket className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-green-700/50">Ghế</p>
                                        <p className="font-black text-green-600 text-xl">{scanResult.seats.join(', ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-green-500/10">
                                <User className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-green-700/50">Khách hàng</p>
                                    <p className="font-bold text-green-900">{scanResult.customerName}</p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={resetScanner} className="w-full bg-green-600 hover:bg-green-700 gap-2">
                            <RefreshCcw className="h-4 w-4" />
                            Tiếp tục quét vé mới
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  )
}
