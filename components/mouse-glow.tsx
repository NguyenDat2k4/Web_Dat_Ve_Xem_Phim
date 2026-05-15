"use client"

import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"

export function MouseGlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
    const updatePosition = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`)
        containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`)
      }
    }

    window.addEventListener("mousemove", updatePosition)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
    }
  }, [])

  if (!isMounted) return null

  // Chỉ bật hiệu ứng glow sáng nếu đang ở Dark Mode
  if (theme !== "dark") return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 mouse-glow-effect"
    />
  )
}
