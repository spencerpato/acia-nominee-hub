import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import NomineeCard from "@/components/NomineeCard";
import { Button } from "@/components/ui/button";
import { useCreators } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  description: string | null;
}

const Index = () => {
  const { data: creators, refetch: refetchCreators } = useCreators();
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const topNominees = creators?.slice(0, 6) || [];

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .limit(6);
      if (data) setGallery(data);
    };
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Nominees Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Nominees
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Meet the talented creators making waves across Africa.
              </p>
            </div>

            {topNominees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {topNominees.map((creator, index) => (
                  <NomineeCard
                    key={creator.id}
                    id={creator.id}
                    fullName={creator.full_name}
                    alias={creator.alias}
                    category={creator.category?.name || "Uncategorized"}
                    profilePhotoUrl={creator.profile_photo_url || undefined}
                    voteCount={creator.vote_count}
                    rank={index + 1}
                    onVoteSuccess={() => refetchCreators()}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No nominees yet. Be the first to register!</p>
              </div>
            )}

            <div className="text-center">
              <Button asChild size="lg" variant="outline">
                <Link to="/nominees">
                  View All Nominees
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Browse Nominees", desc: "Explore talented creators across categories" },
                { step: "2", title: "Cast Your Vote", desc: "Support your favorites with free votes" },
                { step: "3", title: "Celebrate Winners", desc: "Join us to honor the winners" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
