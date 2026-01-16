import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoteModal from "@/components/VoteModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft,
  TrendingUp,
  Award,
  Users,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Music
} from "lucide-react";
import { toast } from "sonner";
import { Creator } from "@/hooks/useCreators";
import { VOTE_PRICE_KES_KENYA, VOTE_PRICE_KES_INTERNATIONAL, getCountryByName, formatCurrency, convertFromKES } from "@/lib/africanCountries";

const SUPERADMIN_EMAIL = "awardsacia@gmail.com";

const NomineeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch the specific creator
  const { data: creator, isLoading, refetch } = useQuery({
    queryKey: ["creator-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("creators")
        .select(`*, category:categories(id, name)`)
        .eq("id", id)
        .eq("is_approved", true)
        .eq("is_active", true)
        .neq("email", SUPERADMIN_EMAIL)
        .maybeSingle();
      
      if (error) throw error;
      return data as Creator | null;
    },
    enabled: !!id,
  });

  // Fetch rank
  const { data: rank } = useQuery({
    queryKey: ["creator-rank", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("creators")
        .select("id, vote_count")
        .eq("is_approved", true)
        .eq("is_active", true)
        .neq("email", SUPERADMIN_EMAIL)
        .order("vote_count", { ascending: false });
      
      if (error) throw error;
      const index = data?.findIndex(c => c.id === id);
      return index !== undefined && index !== -1 ? index + 1 : null;
    },
    enabled: !!id,
  });

  // Fetch total nominees count
  const { data: totalNominees } = useQuery({
    queryKey: ["total-nominees"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("creators")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .eq("is_active", true)
        .neq("email", SUPERADMIN_EMAIL);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const shareLink = `${window.location.origin}/nominee/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${creator?.full_name} - ACIA`,
          text: `Support ${creator?.alias} in the African Creator Impact Awards!`,
          url: shareLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-secondary" />;
    if (rank === 2) return <Award className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
          <p className="text-muted-foreground">Nominee not found</p>
          <Link to="/nominees">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Nominees
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-6 px-4">
        <div className="container mx-auto max-w-lg">
          {/* Back Button */}
          <Link to="/nominees" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Nominees
          </Link>

          {/* Profile Header Card */}
          <Card className="mb-4 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-hero p-6 pb-20 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-20 h-20 border border-secondary/30 rounded-full" />
                <div className="absolute bottom-4 right-4 w-32 h-32 border border-secondary/20 rounded-full" />
              </div>
            </div>
            <CardContent className="relative -mt-16 text-center pb-6">
              <div className="relative inline-block">
                <Avatar className="h-28 w-28 border-4 border-card shadow-lg mx-auto">
                  <AvatarImage src={creator.profile_photo_url || undefined} alt={creator.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-serif">
                    {getInitials(creator.full_name)}
                  </AvatarFallback>
                </Avatar>
                {rank && rank <= 3 && (
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground rounded-full p-1.5 shadow-gold">
                    <span className="text-xs font-bold">#{rank}</span>
                  </div>
                )}
              </div>
              
              <h1 className="font-serif text-2xl font-bold text-foreground mt-4">
                {creator.full_name}
              </h1>
              <p className="text-secondary font-medium">@{creator.alias}</p>
              
              <Badge className="mt-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Award className="h-3 w-3 mr-1" />
                Nominee: {creator.category?.name || "Uncategorized"}
              </Badge>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mb-4 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">Total Votes</span>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-primary">
                  {(creator.vote_count ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-secondary text-sm mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Growing with community support</span>
              </div>
            </CardContent>
          </Card>

          {/* Rank & Category Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground text-sm">Current Rank</span>
                </div>
                <div className="flex items-center gap-1">
                  {rank && getRankIcon(rank)}
                  <span className="font-serif text-2xl font-bold text-foreground">
                    #{rank || "—"}
                  </span>
                  <span className="text-muted-foreground text-sm">/ {totalNominees}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-secondary" />
                  <span className="text-muted-foreground text-sm">Category</span>
                </div>
                <span className="font-serif text-lg font-semibold text-foreground line-clamp-1">
                  {creator.category?.name || "—"}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Bio Section */}
          {creator.bio && (
            <Card className="mb-4 border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-foreground mb-2">About</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {creator.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {(creator.instagram_url || creator.twitter_url || creator.youtube_url || creator.tiktok_url || creator.website_url) && (
            <Card className="mb-4 border-0 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-serif font-semibold text-foreground mb-4">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {creator.instagram_url && (
                    <a
                      href={creator.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                  {creator.twitter_url && (
                    <a
                      href={creator.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm font-medium">Twitter</span>
                    </a>
                  )}
                  {creator.youtube_url && (
                    <a
                      href={creator.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Youtube className="h-4 w-4" />
                      <span className="text-sm font-medium">YouTube</span>
                    </a>
                  )}
                  {creator.tiktok_url && (
                    <a
                      href={creator.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                      <Music className="h-4 w-4" />
                      <span className="text-sm font-medium">TikTok</span>
                    </a>
                  )}
                  {creator.website_url && (
                    <a
                      href={creator.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium">Website</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Voting Link */}
          <Card className="mb-4 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-secondary" />
                <h3 className="font-serif font-semibold text-foreground">Share Voting Link</h3>
              </div>
              
              <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {shareLink.replace(window.location.origin, "acia.awards")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleShare}
                className="w-full mt-4 btn-navy"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Vote Button */}
          <Card className="border-0 shadow-lg bg-gradient-hero text-primary-foreground">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-3 text-secondary" />
              <h3 className="font-serif text-xl font-bold mb-2">
                Support {creator.alias}
              </h3>
              <p className="text-sm opacity-80 mb-4">
                {creator.country === "Kenya" 
                  ? "1 Vote = KES 10 • You can vote multiple times"
                  : (() => {
                      const countryData = getCountryByName(creator.country);
                      const priceInLocalCurrency = countryData 
                        ? convertFromKES(VOTE_PRICE_KES_INTERNATIONAL, countryData.currency)
                        : VOTE_PRICE_KES_INTERNATIONAL;
                      const formattedPrice = countryData 
                        ? formatCurrency(priceInLocalCurrency, countryData.currency)
                        : `KES ${VOTE_PRICE_KES_INTERNATIONAL}`;
                      return `1 Vote = ${formattedPrice} • You can vote multiple times`;
                    })()
                }
              </p>
              <Button
                onClick={() => setIsVoteModalOpen(true)}
                className="w-full btn-gold text-lg py-6"
                size="lg"
              >
                Vote Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        creatorId={creator.id}
        creatorName={creator.full_name}
        creatorAlias={creator.alias}
        creatorPhoto={creator.profile_photo_url || undefined}
        creatorCategory={creator.category?.name || "Uncategorized"}
        creatorCountry={creator.country}
        onVoteSuccess={() => refetch()}
      />
    </div>
  );
};

export default NomineeProfile;
