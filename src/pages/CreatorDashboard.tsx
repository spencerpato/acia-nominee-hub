import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Loader2, Save, LogOut, Trophy, TrendingUp, Share2, Copy, Instagram, Twitter, Youtube, Globe, Music } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);
  const { data: categories } = useCategories();
  const { data: allCreators } = useCreators();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  // Calculate rank
  const rank = profile && allCreators 
    ? allCreators.findIndex(c => c.id === profile.id) + 1 
    : 0;

  const votingLink = profile ? `${window.location.origin}/nominees/${profile.id}` : "";

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
    
    const { error: updateError } = await supabase
      .from("creators")
      .update({ profile_photo_url: urlData.publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      setProfile({ ...profile, profile_photo_url: urlData.publicUrl });
      toast({ title: "Success", description: "Photo uploaded!" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("creators")
      .update({
        full_name: profile.full_name,
        alias: profile.alias,
        phone: profile.phone || null,
        bio: profile.bio || null,
        category_id: profile.category_id || null,
        instagram_url: profile.instagram_url || null,
        twitter_url: profile.twitter_url || null,
        youtube_url: profile.youtube_url || null,
        tiktok_url: profile.tiktok_url || null,
        website_url: profile.website_url || null,
      })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const copyVotingLink = () => {
    navigator.clipboard.writeText(votingLink);
    toast({ title: "Copied!", description: "Voting link copied to clipboard" });
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
      <div className="min-h-screen flex flex-col bg-muted">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Nominee Profile</CardTitle>
              <CardDescription>Complete your nominee profile to appear on the nominees list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/creator/register")} className="btn-gold">
                Complete Registration
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = categories?.find(c => c.id === profile.category_id)?.name || "Uncategorized";

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="bg-gradient-navy rounded-2xl p-6 md:p-8 mb-8 text-primary-foreground">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Profile Photo */}
              <div className="relative group">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-secondary shadow-gold">
                  <AvatarImage src={profile.profile_photo_url} />
                  <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">
                    {profile.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-1 right-1 p-2 bg-secondary rounded-full cursor-pointer hover:bg-secondary/80 transition-colors shadow-lg">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-secondary-foreground" />
                  ) : (
                    <Camera className="h-5 w-5 text-secondary-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1">{profile.full_name}</h1>
                <p className="text-secondary text-lg mb-2">@{profile.alias}</p>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">
                  {categoryName}
                </Badge>
                
                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{profile.vote_count}</p>
                    <p className="text-sm text-primary-foreground/70">Total Votes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">#{rank || "-"}</p>
                    <p className="text-sm text-primary-foreground/70">Current Rank</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={handleSignOut} className="border-secondary/30 text-secondary hover:bg-secondary/10">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full border-secondary/30 text-secondary hover:bg-secondary/10">
                    <Trophy className="h-4 w-4 mr-2" /> Leaderboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Voting Link Section */}
            <div className="mt-6 p-4 bg-primary/30 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Share2 className="h-5 w-5 text-secondary shrink-0" />
                <p className="text-sm text-primary-foreground/80">Share your voting link:</p>
                <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
                  <Input 
                    value={votingLink} 
                    readOnly 
                    className="bg-primary/30 border-secondary/20 text-primary-foreground text-sm"
                  />
                  <Button size="icon" variant="secondary" onClick={copyVotingLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="social">Social Links</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your public profile details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alias">Alias</Label>
                      <Input
                        id="alias"
                        value={profile.alias}
                        onChange={(e) => setProfile({ ...profile, alias: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={profile.category_id}
                        onValueChange={(v) => setProfile({ ...profile, category_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-secondary" />
                    Social Links
                  </CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-500" /> Instagram
                      </Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/username"
                        value={profile.instagram_url}
                        onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-sky-500" /> Twitter / X
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/username"
                        value={profile.twitter_url}
                        onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube" className="flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-500" /> YouTube
                      </Label>
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/@channel"
                        value={profile.youtube_url}
                        onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="flex items-center gap-2">
                        <Music className="h-4 w-4" /> TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        placeholder="https://tiktok.com/@username"
                        value={profile.tiktok_url}
                        onChange={(e) => setProfile({ ...profile, tiktok_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-secondary" /> Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={profile.website_url}
                        onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="btn-gold" disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Changes</>
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorDashboard;