"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette, Zap, Ghost, Eye } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, theme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-secondary/50 border border-border/50">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const themes = [
    { id: "light", name: "Sáng", icon: Sun },
    { id: "dark", name: "Tối", icon: Moon },
    { id: "system", name: "Hệ thống", icon: Monitor },
    { id: "marvel-theme", name: "Marvel Edition", icon: Zap, color: "text-red-500" },
    { id: "avatar-theme", name: "Avatar Edition", icon: Eye, color: "text-teal-500" },
    { id: "horror-theme", name: "Horror Edition", icon: Ghost, color: "text-gray-400" },
  ]

  const currentTheme = themes.find(t => t.id === theme) || themes[1]
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-secondary/50 border border-border/50 hover:bg-secondary transition-all">
          <Palette className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Đổi giao diện</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-card/95 backdrop-blur-xl border-border shadow-2xl">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground">Chọn Giao Diện</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="grid grid-cols-1 gap-1">
          {themes.map((t) => {
            const TIcon = t.icon
            return (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  theme === t.id ? "bg-primary text-primary-foreground font-bold" : "hover:bg-secondary"
                }`}
              >
                <TIcon className={`h-4 w-4 ${theme === t.id ? "" : t.color || ""}`} />
                <span className="text-sm">{t.name}</span>
                {theme === t.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
