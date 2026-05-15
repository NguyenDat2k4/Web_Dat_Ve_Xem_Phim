"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, MeshReflectorMaterial, Stars } from "@react-three/drei"
import { useMemo, useState, useEffect } from "react"
import * as THREE from "three"

interface TheaterPreviewProps {
  selectedSeats: { row: string; number: number }[]
  moviePoster: string
  movieTitle: string
  dbSeats: any[]
}

function Screen({ moviePoster, movieTitle }: { moviePoster: string; movieTitle: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    // Tạo mẫu màu "Test Pattern" theo yêu cầu của người dùng
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Định nghĩa bảng màu dựa trên ảnh người dùng gửi
      const colors = [
        ['#e2d715', '#15e2d7', '#15e215', '#e215e2', '#e21515'], // Hàng 1
        ['#333333', '#e215e2', '#666666', '#15e2d7', '#333333'], // Hàng 2
        ['#004444', '#ffffff', '#000066', '#666666', '#999999']  // Hàng 3
      ]
      
      const rows = colors.length
      const cols = colors[0].length
      const cellW = canvas.width / cols
      const cellH = canvas.height / rows
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = colors[r][c]
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH)
        }
      }
      
      // Thêm logo CineMax đè lên mẫu màu để giữ thương hiệu
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(canvas.width/2 - 250, canvas.height/2 - 60, 500, 120)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 80px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 10
      ctx.fillText('CineMax', canvas.width / 2, canvas.height / 2)
    }
    
    const logoTexture = new THREE.CanvasTexture(canvas)
    setTexture(logoTexture)
  }, [])

  return (
    <group position={[0, 4, 0]}>
      {/* Khung viền màn hình */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[16.4, 9.4]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Màn hình chính */}
      <mesh key={texture ? 'logo-ready' : 'logo-loading'}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial 
          map={texture}
          color={texture ? "white" : "#000"}
        />
      </mesh>
      
      {/* Ánh sáng hắt ra từ màn hình */}
      {texture && <pointLight position={[0, 0, 1]} intensity={0.8} color="#00ffff" distance={12} />}
    </group>
  )
}
function CinemaRoom({ selectedSeats, moviePoster, movieTitle, dbSeats }: TheaterPreviewProps) {
  // Dữ liệu ghế để hiển thị: dùng dbSeats nếu có, không thì tạo grid mặc định
  const seatsToRender = useMemo(() => {
    if (dbSeats && dbSeats.length > 0) return dbSeats
    
    // Tạo grid mặc định 8 hàng x 12 cột nếu không có dữ liệu từ DB
    const fallbackSeats = []
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < 12; x++) {
        fallbackSeats.push({
          row: rows[y],
          number: x + 1,
          x: x,
          y: y,
          type: 'standard'
        })
      }
    }
    return fallbackSeats
  }, [dbSeats])

  const seatPosition = useMemo(() => {
    if (selectedSeats.length === 0) return new THREE.Vector3(0, 5, 20)
    
    const firstSeat = selectedSeats[0]
    const seat = seatsToRender.find(s => s.row === firstSeat.row && s.number === firstSeat.number)
    const x = seat ? (seat.x - 6) * 1.5 : (firstSeat.number - 6) * 1.5
    const z = seat ? (seat.y + 5) * 2.5 : (firstSeat.row.charCodeAt(0) - 64 + 5) * 2.5
    return new THREE.Vector3(x, 1.2, z)
  }, [selectedSeats, seatsToRender])

  return (
    <>
      <PerspectiveCamera makeDefault position={seatPosition} fov={60} />
      <OrbitControls 
        target={[0, 3, 0]} 
        maxPolarAngle={Math.PI / 2} 
        enablePan={false}
      />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 10, 0]} intensity={1} />
      <spotLight position={[0, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
      
      <gridHelper args={[50, 50, "#222", "#111"]} position={[0, 0.01, 0]} />

      <Screen moviePoster={moviePoster} movieTitle={movieTitle} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Seats */}
      {seatsToRender.map((seat, i) => {
        const isSelected = selectedSeats.some(s => s.row === seat.row && s.number === seat.number)
        const x = (seat.x - 6) * 1.5
        const z = (seat.y + 5) * 2.5
        
        return (
          <group key={i} position={[x, 0.4, z]}>
            {/* Đệm ngồi */}
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.2, 0.8]} />
              <meshStandardMaterial color={isSelected ? "#00ffff" : "#880000"} />
            </mesh>
            {/* Tựa lưng */}
            <mesh position={[0, 0.5, 0.35]} rotation={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.9, 1.2, 0.15]} />
              <meshStandardMaterial color={isSelected ? "#00ffff" : "#aa0000"} />
            </mesh>
            {/* Tay vịn trái */}
            <mesh position={[-0.5, 0.3, 0]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.7]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {/* Tay vịn phải */}
            <mesh position={[0.5, 0.3, 0]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.7]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export function TheaterPreview({ selectedSeats, moviePoster, movieTitle, dbSeats }: TheaterPreviewProps) {
  return (
    <div className="w-full h-full bg-black rounded-3xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
        Góc nhìn từ ghế: {selectedSeats.length > 0 ? selectedSeats.map(s => `${s.row}${s.number}`).join(', ') : "Chưa chọn"}
      </div>
      
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#050505"]} />
        <CinemaRoom selectedSeats={selectedSeats} moviePoster={moviePoster} movieTitle={movieTitle} dbSeats={dbSeats} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end pointer-events-none">
        <div className="text-[10px] text-white/40 max-w-[200px]">
          Sử dụng chuột để xoay và phóng to góc nhìn.
        </div>
      </div>
    </div>
  )
}
