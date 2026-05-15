"use client"

import { usePathname, useRouter } from "@/i18n/routing"
import { useLocale } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useTransition } from "react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground" disabled={isPending}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">Chuyển đổi ngôn ngữ</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-card border-border">
        <DropdownMenuItem 
          className={`cursor-pointer ${locale === 'vi' ? 'bg-secondary font-bold' : ''}`}
          onClick={() => onSelectChange('vi')}
        >
          🇻🇳 Tiếng Việt
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`cursor-pointer ${locale === 'en' ? 'bg-secondary font-bold' : ''}`}
          onClick={() => onSelectChange('en')}
        >
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
