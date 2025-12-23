import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Trophy, Medal, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
    return "";
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
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Trophy className="h-10 w-10 text-secondary" />
              Voting Leaderboard
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time rankings of Africa's top content creators
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[220px]">
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
            <div className="max-w-3xl mx-auto space-y-4">
              {sortedCreators.map((creator, index) => {
                const rank = index + 1;
                return (
                  <Card
                    key={creator.id}
                    className={`transition-all hover:shadow-lg ${getRankBg(rank)}`}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-12 flex items-center justify-center">{getRankIcon(rank)}</div>
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={creator.profile_photo_url || undefined} />
                        <AvatarFallback className="text-xl bg-secondary/20 text-secondary">
                          {creator.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{creator.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{creator.alias}</p>
                      </div>
                      <Badge variant="secondary" className="hidden sm:flex">
                        {creator.category?.name || "Uncategorized"}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary">{creator.vote_count || 0}</p>
                        <p className="text-xs text-muted-foreground">votes</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
