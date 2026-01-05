import { useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Menu, Bell, Trophy, Medal, Award, Crown,
  LayoutGrid, BarChart3, Lightbulb, User, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { useCategories, useCreators } from "@/hooks/useCreators";
import { Loader2 } from "lucide-react";

const DashboardRankings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);
  const { data: categories } = useCategories();
  
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: creators } = useCreators(categoryFilter === "all" ? undefined : categoryFilter);

  const sortedCreators = useMemo(() => {
    if (!creators) return [];
    let filtered = [...creators].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.alias.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [creators, searchQuery]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

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
              <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <LayoutGrid className="h-5 w-5" /> Dashboard
              </Link>
              <Link to="/dashboard/rankings" className="flex items-center gap-3 p-2 rounded-lg bg-muted">
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

        <h1 className="font-serif text-lg font-bold">Rankings</h1>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Search & Filter */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nominees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <Trophy className="h-6 w-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{sortedCreators.length}</p>
              <p className="text-xs text-muted-foreground">Nominees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {sortedCreators.reduce((sum, c) => sum + (c.vote_count || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Votes</p>
            </CardContent>
          </Card>
        </div>

        {/* Rankings List */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold">All Nominees</h3>
          
          {sortedCreators.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No nominees found.</p>
              </CardContent>
            </Card>
          ) : (
            sortedCreators.map((creator, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <Link key={creator.id} to={`/nominees/${creator.id}`}>
                  <Card className={`transition-all hover:shadow-md ${
                    isTopThree 
                      ? rank === 1 
                        ? "border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20" 
                        : rank === 2 
                          ? "border-gray-300/50 bg-gray-50/50 dark:bg-gray-900/20" 
                          : "border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20"
                      : ""
                  }`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex items-center justify-center shrink-0">
                          {getRankIcon(rank)}
                        </div>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={creator.profile_photo_url || undefined} />
                          <AvatarFallback className="text-sm bg-secondary/20 text-secondary">
                            {creator.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{creator.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {creator.category?.name || "Uncategorized"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-secondary">{creator.vote_count || 0}</p>
                          <p className="text-xs text-muted-foreground">votes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
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
            to="/dashboard/rankings" 
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard/rankings' ? 'text-blue-600' : 'text-muted-foreground'}`}
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

export default DashboardRankings;
