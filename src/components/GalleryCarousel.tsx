import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  description: string | null;
}

const GalleryCarousel = () => {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setGallery(data);
      setIsLoading(false);
    };
    fetchGallery();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (gallery.length <= 3) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [gallery]);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex space-x-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[220px] h-44 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (gallery.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Gallery
            </h2>
            <p className="text-muted-foreground">
              Moments from the African Creator Impact Awards
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {gallery.map((item) => {
            const optimizedUrl = isCloudinaryUrl(item.image_url)
              ? getOptimizedUrl(item.image_url, { width: 400, height: 320, quality: "auto" })
              : item.image_url;
            
            return (
              <Link
                key={item.id}
                to="/gallery"
                className="group relative min-w-[220px] md:min-w-[260px] h-44 md:h-52 rounded-xl overflow-hidden flex-shrink-0 snap-start"
              >
                <img
                  src={optimizedUrl}
                  alt={item.title || "Gallery image"}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Always visible overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Title & Description overlay - always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {item.title && (
                    <h3 className="text-white font-semibold text-sm mb-0.5 drop-shadow-md line-clamp-1">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-white/80 text-xs line-clamp-2 drop-shadow-sm">
                      {item.description}
                    </p>
                  )}
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>

        {/* View Full Gallery */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GalleryCarousel;
