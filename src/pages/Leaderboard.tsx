import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCreators, useCategories } from "@/hooks/useCreators";

const Leaderboard = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: creators } = useCreators(categoryFilter === "all" ? undefined : categoryFilter);
  const { data: categories } = useCategories();

  const canonicalUrl = useMemo(() => `${window.location.origin}/leaderboard`, []);

  const sortedCreators = useMemo(() => {
    if (!creators) return [];
    return [...creators].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  }, [creators]);

  const topThree = sortedCreators.slice(0, 3);
  const rest = sortedCreators.slice(3);

  const totalVotes = useMemo(() => {
    return sortedCreators.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  }, [sortedCreators]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-8 w-8 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-7 w-7 text-gray-300" />;
    if (rank === 3) return <Award className="h-7 w-7 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Voting Leaderboard | ACIA Awards</title>
        <meta
          name="description"
          content="See the top-voted African creators in the ACIA Awards. Check rankings by category and support your favorites."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-navy py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center text-primary-foreground">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="h-10 w-10 md:h-12 md:w-12 text-secondary" />
                <h1 className="font-serif text-4xl md:text-5xl font-bold">Leaderboard</h1>
              </div>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                Real-time rankings of Africa's most impactful content creators
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <Users className="h-5 w-5" />
                  <span className="text-2xl font-bold">{sortedCreators.length}</span>
                </div>
                <p className="text-primary-foreground/60 text-sm">Nominees</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-2xl font-bold">{totalVotes.toLocaleString()}</span>
                </div>
                <p className="text-primary-foreground/60 text-sm">Total Votes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="container mx-auto px-4 -mt-8">
            <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="order-1 md:pt-8">
                <Link to={`/nominees/${topThree[1].id}`}>
                  <Card className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700 hover:shadow-lg transition-all text-center p-4 md:p-6">
                    <div className="flex justify-center mb-3">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                    <Avatar className="h-16 w-16 md:h-24 md:w-24 mx-auto border-4 border-gray-300">
                      <AvatarImage src={topThree[1].profile_photo_url || undefined} />
                      <AvatarFallback className="text-xl md:text-2xl bg-gray-200 text-gray-600">
                        {topThree[1].full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold mt-3 truncate text-sm md:text-base">{topThree[1].full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{topThree[1].alias}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-600 mt-2">{topThree[1].vote_count || 0}</p>
                    <p className="text-xs text-muted-foreground">votes</p>
                  </Card>
                </Link>
              </div>

              {/* 1st Place */}
              <div className="order-2">
                <Link to={`/nominees/${topThree[0].id}`}>
                  <Card className="bg-gradient-to-b from-secondary/30 to-secondary/10 border-secondary/50 hover:shadow-xl shadow-gold transition-all text-center p-4 md:p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown className="h-10 w-10 text-secondary drop-shadow-lg" />
                    </div>
                    <div className="mt-4">
                      <Avatar className="h-20 w-20 md:h-28 md:w-28 mx-auto border-4 border-secondary shadow-gold">
                        <AvatarImage src={topThree[0].profile_photo_url || undefined} />
                        <AvatarFallback className="text-2xl md:text-3xl bg-secondary/20 text-secondary">
                          {topThree[0].full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="font-semibold mt-3 truncate text-sm md:text-lg">{topThree[0].full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{topThree[0].alias}</p>
                    <Badge className="mt-2 bg-secondary text-secondary-foreground text-xs">
                      {topThree[0].category?.name || "Uncategorized"}
                    </Badge>
                    <p className="text-2xl md:text-3xl font-bold text-secondary mt-2">{topThree[0].vote_count || 0}</p>
                    <p className="text-xs text-muted-foreground">votes</p>
                  </Card>
                </Link>
              </div>

              {/* 3rd Place */}
              <div className="order-3 md:pt-12">
                <Link to={`/nominees/${topThree[2].id}`}>
                  <Card className="bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20 border-amber-400/50 hover:shadow-lg transition-all text-center p-4 md:p-6">
                    <div className="flex justify-center mb-3">
                      <Award className="h-8 w-8 text-amber-600" />
                    </div>
                    <Avatar className="h-16 w-16 md:h-24 md:w-24 mx-auto border-4 border-amber-500">
                      <AvatarImage src={topThree[2].profile_photo_url || undefined} />
                      <AvatarFallback className="text-xl md:text-2xl bg-amber-200 text-amber-700">
                        {topThree[2].full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold mt-3 truncate text-sm md:text-base">{topThree[2].full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{topThree[2].alias}</p>
                    <p className="text-xl md:text-2xl font-bold text-amber-600 mt-2">{topThree[2].vote_count || 0}</p>
                    <p className="text-xs text-muted-foreground">votes</p>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Filter & List */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="font-serif text-2xl font-bold">All Rankings</h2>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
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
          </div>

          {sortedCreators.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No nominees found in this category.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-3">
              {sortedCreators.map((creator, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                return (
                  <Link key={creator.id} to={`/nominees/${creator.id}`}>
                    <Card className={`transition-all hover:shadow-md hover:-translate-y-0.5 ${
                      isTopThree 
                        ? rank === 1 
                          ? "border-secondary/40 bg-secondary/5" 
                          : rank === 2 
                            ? "border-gray-300 bg-gray-50 dark:bg-gray-900/30" 
                            : "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20"
                        : ""
                    }`}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-10 flex items-center justify-center shrink-0">
                          {getRankIcon(rank)}
                        </div>
                        <Avatar className="h-12 w-12 md:h-14 md:w-14 shrink-0">
                          <AvatarImage src={creator.profile_photo_url || undefined} />
                          <AvatarFallback className="text-lg bg-secondary/20 text-secondary">
                            {creator.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{creator.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">@{creator.alias}</p>
                        </div>
                        <Badge variant="secondary" className="hidden sm:flex shrink-0">
                          {creator.category?.name || "Uncategorized"}
                        </Badge>
                        <div className="text-right shrink-0">
                          <p className="text-xl md:text-2xl font-bold text-secondary">{creator.vote_count || 0}</p>
                          <p className="text-xs text-muted-foreground">votes</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/nominees">
              <Button className="btn-gold">
                Vote for Your Favorite
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;