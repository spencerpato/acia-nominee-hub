import { Link } from "react-router-dom";
import { ArrowRight, Award, Users, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero min-h-[600px] flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Award className="h-4 w-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">
              2026 Awards Season Now Open
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
            Celebrating Africa's Most{" "}
            <span className="text-gradient-gold">Impactful</span> Creators
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Join us in recognizing the digital pioneers who are shaping culture, 
            inspiring communities, and making a lasting impact across Africa.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild size="lg" className="btn-gold text-lg px-8">
              <Link to="/nominees">
                Vote Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
            >
              <Link to="/auth?mode=signup">
                Become a Nominee
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-white/60">Creators</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Vote className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-white/60">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">8</div>
              <div className="text-sm text-white/60">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
