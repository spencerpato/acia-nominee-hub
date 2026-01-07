import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Camera, Loader2, Save, ArrowLeft, LayoutGrid, BarChart3, 
  Lightbulb, User, Instagram, Twitter, Youtube, Globe, Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface CreatorProfile {
  id: string;
  full_name: string;
  alias: string;
  email: string;
  phone: string;
  bio: string;
  category_id: string;
  profile_photo_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  tiktok_url: string;
  website_url: string;
}

const CreatorProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { data: categories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

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

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, "acia/profile-photos");
      
      // Update profile in Supabase with Cloudinary URL
      const { error: updateError } = await supabase
        .from("creators")
        .update({ profile_photo_url: result.secure_url })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }
      
      setProfile({ ...profile, profile_photo_url: result.secure_url });
      toast({ title: "Success", description: "Photo uploaded!" });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to upload photo", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
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

  if (authLoading || loading) {
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
            <h2 className="font-serif text-2xl font-bold mb-2">No Profile Found</h2>
            <p className="text-muted-foreground mb-4">Please complete your registration first.</p>
            <Button onClick={() => navigate("/creator/register")} className="btn-gold">
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-serif text-lg font-bold flex-1">Edit Profile</h1>
        <Button onClick={handleSave} disabled={saving} className="btn-gold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Save</span>
        </Button>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile Photo */}
        <Card>
          <CardContent className="py-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-28 w-28 border-4 border-secondary shadow-lg">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 bg-secondary rounded-full cursor-pointer hover:bg-secondary/80 transition-colors shadow-lg">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-secondary-foreground" />
                ) : (
                  <Camera className="h-5 w-5 text-secondary-foreground" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">Tap to change photo</p>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Update your public profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias / Username</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="space-y-2">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            to="/leaderboard" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Rankings</span>
          </Link>
          <Link 
            to="/dashboard/tips" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground"
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

export default CreatorProfilePage;
