import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import NomineeCard from "@/components/NomineeCard";
import HowItWorks from "@/components/HowItWorks";
import GalleryCarousel from "@/components/GalleryCarousel";
import PartnersSection from "@/components/PartnersSection";
import { Button } from "@/components/ui/button";
import { useCreators } from "@/hooks/useCreators";

const Index = () => {
  const { data: creators, refetch: refetchCreators } = useCreators();
  
  // Randomly select up to 4 nominees on each page load
  const randomNominees = useMemo(() => {
    if (!creators || creators.length === 0) return [];
    const shuffled = [...creators].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [creators]);

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

            {randomNominees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
                {randomNominees.map((creator, index) => (
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
              <Button asChild size="lg" className="btn-gold">
                <Link to="/nominees">
                  View All Nominees
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Gallery Carousel */}
        <GalleryCarousel />

        {/* Partners Section */}
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
