import { Button } from "@/components/ui/button"
import { Ticket, Gift, CreditCard, ChevronRight, HelpCircle } from "lucide-react"

const iconMap: { [key: string]: any } = {
  Ticket,
  Gift,
  CreditCard
}

interface PromotionsSectionProps {
  promotions: any[]
}

export function PromotionsSection({ promotions = [] }: PromotionsSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Ưu đãi đặc biệt
            </h2>
            <p className="text-muted-foreground">
              Nhiều khuyến mãi hấp dẫn đang chờ bạn
            </p>
          </div>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10">
            Tất cả ưu đãi
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const Icon = iconMap[promo.iconName] || HelpCircle
            return (
              <div 
                key={promo._id || promo.id}
                className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${promo.colorClass} mb-5`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {promo.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {promo.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
            Xem tất cả ưu đãi
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
