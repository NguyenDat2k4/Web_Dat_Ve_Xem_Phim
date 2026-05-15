"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Chào bạn! Mình là **Hibiki Cine**, trợ lý ảo của CineMax. Mình có thể giúp gì cho bạn hôm nay?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const quickActions = [
    { label: "🍿 Phim đang chiếu", value: "Hiện tại có phim gì đang chiếu?" },
    { label: "📅 Lịch chiếu", value: "Cho mình xem lịch chiếu phim." },
    { label: "📍 Tìm rạp", value: "Địa chỉ các rạp CineMax ở đâu?" },
    { label: "🎟️ Cách đặt vé", value: "Hướng dẫn mình cách đặt vé." },
  ]

  // Khởi tạo Speech Synthesis và nạp giọng nói
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  // Ngừng nói khi đóng chat
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [isOpen])

  // Khởi tạo Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.lang = "vi-VN"
        recognitionRef.current.interimResults = false

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
          handleSend(transcript)
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setIsListening(true)
      recognitionRef.current?.start()
    }
  }

  const speak = (text: string) => {
    if (!isVoiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    // Xử lý văn bản để tạo nhịp điệu ngọt ngào (thêm khoảng nghỉ nhẹ)
    const processedText = text
      .replace(/\*\*/g, "")
      .replace(/- /g, "")
      .replace(/\. /g, "... ") // Nghỉ dài một chút sau dấu chấm
      .replace(/, /g, ", ")    // Nghỉ nhẹ sau dấu phẩy

    const utterance = new SpeechSynthesisUtterance(processedText)
    utterance.lang = "vi-VN"

    // Tìm giọng tiếng Việt, ưu tiên giọng nữ và tránh giọng nam (An)
    const voices = window.speechSynthesis.getVoices()
    const viVoices = voices.filter(v => v.lang.startsWith("vi"))

    const femaleVoice = viVoices.find(v =>
      v.name.includes("Lan") ||
      v.name.includes("Linh") ||
      v.name.includes("Google") ||
      v.name.toLowerCase().includes("female")
    ) || viVoices.find(v => !v.name.includes("An")) || viVoices[0]

    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    // Cấu hình theo style "Anime - Kawaii - Năng động"
    utterance.rate = 1.1   // Nhanh và năng động hơn
    utterance.pitch = 1.6  // Cao vút kiểu anime
    utterance.volume = 1.0 // To rõ, tràn đầy năng lượng
    
    window.speechSynthesis.speak(utterance)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Chỉ tự động cuộn khi số lượng tin nhắn thay đổi (có tin mới)
  useEffect(() => {
    scrollToBottom()
  }, [messages.length, isLoading])

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input
    if (!messageText.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: messageText }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // Mở khóa âm thanh nếu đang bật voice (quan trọng để vượt qua autoplay policy)
    if (isVoiceEnabled && typeof window !== "undefined") {
      const silent = new SpeechSynthesisUtterance("")
      silent.volume = 0
      window.speechSynthesis.speak(silent)
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      const data = await res.json()
      if (data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }])
        speak(data.content.replace(/\*\*/g, "").replace(/- /g, "")) // Đọc câu trả lời (xóa markdown)
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.error || "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé!" }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Lỗi kết nối. Bạn hãy kiểm tra lại mạng nhé." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[380px] h-[550px] bg-background border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-opacity-95"
          >
            {/* Header */}
            <div className="p-4 bg-primary flex items-center justify-between text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-background rounded-full shadow-lg" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-tight">Hibiki Cine</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[10px] opacity-90 uppercase font-bold tracking-widest text-white/90">Trợ lý đang trực tuyến</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newState = !isVoiceEnabled
                    setIsVoiceEnabled(newState)
                    if (newState && typeof window !== "undefined") {
                      // Phát một thông báo ngắn để "mở khóa" âm thanh trên trình duyệt
                      const welcome = new SpeechSynthesisUtterance("Oao! Chào bạn nha! Mình là Hibiki đây nè! Hihi! Rất vui được gặp bạn!")
                      welcome.lang = "vi-VN"
                      const voices = window.speechSynthesis.getVoices()
                      const viVoices = voices.filter(v => v.lang.startsWith("vi"))
                      const femaleVoice = viVoices.find(v => 
                        v.name.includes("Lan") || 
                        v.name.includes("Linh") || 
                        v.name.includes("Google") || 
                        v.name.toLowerCase().includes("female")
                      ) || viVoices.find(v => !v.name.includes("An")) || viVoices[0]
                      
                      if (femaleVoice) welcome.voice = femaleVoice
                      welcome.pitch = 1.6
                      welcome.rate = 1.1
                      welcome.volume = 1.0
                      window.speechSynthesis.speak(welcome)
                    }
                  }}
                  className={`h-8 w-8 rounded-full hover:bg-white/10 ${isVoiceEnabled ? "text-white" : "text-white/40"}`}
                  title={isVoiceEnabled ? "Tắt giọng nói" : "Bật giọng nói"}
                >
                  {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area with Standard Scrollbar */}
            <div
              className="flex-1 p-4 bg-gradient-to-b from-muted/20 to-background overflow-y-auto custom-scrollbar"
              ref={scrollRef}
            >
              <div className="space-y-4 pb-6">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-white/10"}`}>
                        {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-card border border-white/10 rounded-tl-none text-foreground"
                        }`}>
                        <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{
                          __html: m.content
                            .replace(/\*\*(.*?)\*\*/g, '<b class="text-primary font-bold">$1</b>')
                            .replace(/\n/g, '<br/>')
                            .replace(/- (.*?)(<br\/>|$)/g, '<li class="ml-4 list-disc marker:text-primary">$1</li>')
                        }} />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Quick Actions */}
                {!isLoading && messages.length < 5 && (
                  <div className="flex flex-wrap gap-2 pt-4 px-2">
                    {quickActions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSend(action.value)}
                        className="px-4 py-2 rounded-xl bg-card border border-white/10 text-xs font-medium text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      >
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-start items-center gap-3 text-muted-foreground bg-card/40 px-4 py-3 rounded-2xl border border-white/5 text-xs w-fit ml-11"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    </div>
                    <span>Hibiki đang chuẩn bị câu trả lời...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/80 backdrop-blur-md border-t border-white/5 flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleListening}
                  className={`rounded-xl h-11 w-11 shrink-0 transition-all ${isListening
                      ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                      : "bg-muted/50 border-white/5 hover:bg-primary/10 hover:border-primary/30"
                    }`}
                >
                  {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 opacity-60" />}
                </Button>
                <Input
                  placeholder={isListening ? "Đang lắng nghe..." : "Nhập câu hỏi của bạn..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="bg-muted/50 border-white/5 rounded-xl focus-visible:ring-primary h-11"
                  disabled={isListening}
                />
                <Button size="icon" onClick={() => handleSend()} disabled={isLoading || isListening} className="rounded-xl h-11 w-11 shadow-lg shadow-primary/20 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isListening && (
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 16, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
      </motion.button>
    </div>
  )
}
