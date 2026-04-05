"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  name: string
  email: string
  role: string
  points?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const refreshUser = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isMounted) {
      refreshUser()
    }
  }, [isMounted])

  const login = (userData: User) => {
    setUser(userData)
    router.refresh()
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
