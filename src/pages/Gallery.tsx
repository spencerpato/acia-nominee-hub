import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary";

type GalleryItem = Tables<"gallery">;

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const canonicalUrl = useMemo(() => `${window.location.origin}/gallery`, []);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Gallery | ACIA Awards</title>
        <meta
          name="description"
          content="Browse photos from ACIA Awards events celebrating Africa's top content creators."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Gallery</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Moments from ACIA Awards events and celebrations
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No gallery images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const thumbnailUrl = isCloudinaryUrl(item.image_url)
                  ? getOptimizedUrl(item.image_url, { width: 400, height: 400, quality: "auto" })
                  : item.image_url;
                  
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover:ring-2 hover:ring-secondary transition-all"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={item.title || "Gallery image"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {item.title && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <div>
              <img
                src={isCloudinaryUrl(selectedImage.image_url)
                  ? getOptimizedUrl(selectedImage.image_url, { width: 1200, quality: "auto" })
                  : selectedImage.image_url}
                alt={selectedImage.title || "Gallery image"}
                className="w-full max-h-[80vh] object-contain"
              />
              {(selectedImage.title || selectedImage.description) && (
                <div className="p-4 bg-card">
                  {selectedImage.title && (
                    <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
