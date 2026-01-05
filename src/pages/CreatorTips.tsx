import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, BarChart3, Lightbulb, User, ArrowLeft,
  Share2, Users, MessageCircle, Camera, Clock, Target, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const tips = [
  {
    icon: Share2,
    title: "Share on Social Media",
    description: "Post your voting link on Instagram, Twitter, Facebook, and TikTok stories. The more you share, the more votes you get!",
    color: "bg-pink-100 text-pink-600"
  },
  {
    icon: Users,
    title: "Engage Your Community",
    description: "Ask your fans, friends, and family to vote. Personal requests are more effective than generic posts.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Use WhatsApp Groups",
    description: "Share your voting link in relevant WhatsApp groups and ask members to support your campaign.",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Camera,
    title: "Create Voting Content",
    description: "Make short videos or graphics encouraging people to vote. Visual content gets more engagement!",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: Clock,
    title: "Post at Peak Times",
    description: "Share during lunch hours (12-2 PM) and evenings (7-10 PM) when most people are online.",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: Target,
    title: "Set Daily Goals",
    description: "Aim for a specific number of new votes each day. Consistent effort beats one-time campaigns.",
    color: "bg-cyan-100 text-cyan-600"
  }
];

const CreatorTips = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
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
        <h1 className="font-serif text-lg font-bold">Campaign Tips</h1>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        <Card className="bg-gradient-navy text-primary-foreground border-0">
          <CardContent className="py-6 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 text-secondary" />
            <h2 className="font-serif text-xl font-bold mb-2">Boost Your Votes</h2>
            <p className="text-sm text-primary-foreground/80">
              Follow these proven strategies to maximize your vote count and climb the leaderboard!
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl ${tip.color} flex items-center justify-center shrink-0`}>
                    <tip.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
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
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard/tips' ? 'text-blue-600' : 'text-muted-foreground'}`}
          >
            <div className="h-12 w-12 -mt-6 rounded-full bg-secondary flex items-center justify-center shadow-gold">
              <Lightbulb className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-xs">Tips</span>
          </Link>
          <Link 
            to="/dashboard/profile" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CreatorTips;
