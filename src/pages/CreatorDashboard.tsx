import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Menu, Bell, Trophy, Banknote, Share2, Copy, Upload, 
  LayoutGrid, BarChart3, Lightbulb, User, TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { useCategories, useCreators } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";

interface CreatorProfile {
  id: string;
  full_name: string;
  alias: string;
  email: string;
  phone: string;
  bio: string;
  category_id: string;
  profile_photo_url: string;
  vote_count: number;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  tiktok_url: string;
  website_url: string;
}

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);
  const { data: categories } = useCategories();
  const { data: allCreators } = useCreators();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  // Calculate rank
  const rank = profile && allCreators 
    ? allCreators.findIndex(c => c.id === profile.id) + 1 
    : 0;
  const totalNominees = allCreators?.length || 0;

  // Calculate earnings (votes × KES 6)
  const earnings = (profile?.vote_count || 0) * 6;

  const votingLink = profile ? `acia.awards/v/${profile.alias}` : "";
  const fullVotingLink = profile ? `${window.location.origin}/nominee/${profile.id}` : "";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user || roleLoading) return;
    if (isAdmin || isSuperAdmin) {
      navigate("/admin");
    }
  }, [user, authLoading, isAdmin, isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      }
      
      setProfile(data ? {
        id: data.id,
        full_name: data.full_name,
        alias: data.alias,
        email: data.email,
        phone: data.phone || "",
        bio: data.bio || "",
        category_id: data.category_id || "",
        profile_photo_url: data.profile_photo_url || "",
        vote_count: data.vote_count || 0,
        instagram_url: data.instagram_url || "",
        twitter_url: data.twitter_url || "",
        youtube_url: data.youtube_url || "",
        tiktok_url: data.tiktok_url || "",
        website_url: data.website_url || "",
      } : null);
      setLoading(false);
    };

    if (user) fetchProfile();
  }, [user, toast]);

  const copyVotingLink = () => {
    navigator.clipboard.writeText(fullVotingLink);
    toast({ title: "Copied!", description: "Voting link copied to clipboard" });
  };

  const shareCampaign = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${profile?.full_name} - ACIA`,
          text: `Support ${profile?.alias} in the African Creator Impact Awards!`,
          url: fullVotingLink,
        });
      } catch (err) {
        copyVotingLink();
      }
    } else {
      copyVotingLink();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="font-serif text-2xl font-bold mb-2">No Nominee Profile</h2>
            <p className="text-muted-foreground mb-4">Complete your registration to appear on the nominees list.</p>
            <Button onClick={() => navigate("/creator/register")} className="btn-gold">
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryName = categories?.find(c => c.id === profile.category_id)?.name || "Uncategorized";

  // Recent activity mock data
  const recentActivity = [
    {
      icon: TrendingUp,
      title: "Vote Surge!",
      description: "You received new votes. Keep sharing!",
      time: "Recently",
      color: "text-blue-500"
    },
    {
      icon: Trophy,
      title: "Rank Update",
      description: `You are currently ranked #${rank} in ${categoryName}.`,
      time: "Today",
      color: "text-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.profile_photo_url} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{profile.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{profile.alias}</p>
                </div>
              </div>
              <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <LayoutGrid className="h-5 w-5" /> Dashboard
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <BarChart3 className="h-5 w-5" /> Rankings
              </Link>
              <Link to="/dashboard/tips" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <Lightbulb className="h-5 w-5" /> Tips
              </Link>
              <Link to="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <User className="h-5 w-5" /> Profile
              </Link>
              <hr className="my-2" />
              <Button variant="ghost" onClick={handleSignOut} className="justify-start text-destructive">
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="font-serif text-lg font-bold">Dashboard</h1>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary/20 dark:to-primary/10 border-0 overflow-hidden">
          <CardContent className="pt-6 pb-4 text-center">
            <div className="relative inline-block mb-3">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2">
                #{rank}
              </Badge>
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">{profile.full_name}</h2>
            <p className="text-muted-foreground text-sm">@{profile.alias}</p>
            <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
              <Trophy className="h-3 w-3 mr-1" />
              Nominee: {categoryName}
            </Badge>
          </CardContent>
        </Card>

        {/* Total Votes Card */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-3xl font-bold text-blue-600">{profile.vote_count.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> Active campaign
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rank & Earnings Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">Current Rank</p>
              <p className="text-2xl font-bold">
                #{rank} <span className="text-sm font-normal text-muted-foreground">/ {totalNominees}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Banknote className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Est. Earnings</p>
              <p className="text-2xl font-bold">
                KES {earnings.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Share Voting Link */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-5 w-5 text-blue-600" />
              <p className="font-semibold">Share Voting Link</p>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Input 
                value={votingLink} 
                readOnly 
                className="text-sm bg-muted"
              />
              <Button variant="ghost" size="icon" onClick={copyVotingLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full btn-gold" onClick={shareCampaign}>
              <Upload className="h-4 w-4 mr-2" /> Share Campaign
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold">Recent Activity</h3>
          {recentActivity.map((activity, index) => (
            <Card key={index}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 ${activity.color}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-muted-foreground'}`}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            to="/dashboard/rankings" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Rankings</span>
          </Link>
          <Link 
            to="/dashboard/tips" 
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard/tips' ? 'text-blue-600' : 'text-muted-foreground'}`}
          >
            <div className="h-12 w-12 -mt-6 rounded-full bg-secondary flex items-center justify-center shadow-gold">
              <Lightbulb className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-xs">Tips</span>
          </Link>
          <Link 
            to="/dashboard/profile" 
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard/profile' ? 'text-blue-600' : 'text-muted-foreground'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CreatorDashboard;
