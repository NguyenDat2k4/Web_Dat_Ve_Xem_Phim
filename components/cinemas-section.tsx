import { Button } from "@/components/ui/button"
import { MapPin, Star, ChevronRight } from "lucide-react"
import Image from "next/image"

interface CinemasSectionProps {
  cinemas: any[]
}

export function CinemasSection({ cinemas = [] }: CinemasSectionProps) {
  return (
    <section id="cinemas" className="py-16 md:py-24 bg-background">

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Hệ thống rạp chiếu
            </h2>
            <p className="text-muted-foreground">
              Trải nghiệm điện ảnh đẳng cấp tại các rạp CineMax
            </p>
          </div>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10">
            Tất cả rạp
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cinema Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <div 
              key={cinema._id || cinema.id}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={cinema.image}
                  alt={cinema.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                  <span className="text-sm font-semibold text-foreground">{cinema.rating}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {cinema.name}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-sm line-clamp-2">{cinema.address}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {cinema.screens} phòng chiếu
                  </span>
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary">
                    Xem lịch chiếu
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
            Xem tất cả rạp
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
