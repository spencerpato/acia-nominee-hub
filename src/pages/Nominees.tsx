import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NomineeCard from "@/components/NomineeCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreators, useCategories } from "@/hooks/useCreators";
import { Search, Users, Trophy } from "lucide-react";

const Nominees = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: creators, refetch } = useCreators(categoryFilter === "all" ? undefined : categoryFilter);
  const { data: categories } = useCategories();

  // Filter creators by search query
  const filteredCreators = useMemo(() => {
    if (!creators) return [];
    if (!searchQuery.trim()) return creators;
    
    const query = searchQuery.toLowerCase().trim();
    return creators.filter(creator => 
      creator.full_name.toLowerCase().includes(query) ||
      creator.alias.toLowerCase().includes(query) ||
      (creator.category?.name || "").toLowerCase().includes(query)
    );
  }, [creators, searchQuery]);

  const totalVotes = useMemo(() => {
    return creators?.reduce((sum, c) => sum + (c.vote_count ?? 0), 0) ?? 0;
  }, [creators]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-hero py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              All Nominees
            </h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
              Support your favorite African creators by voting for them
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Users className="h-5 w-5 text-secondary" />
                <span className="font-semibold">{creators?.length || 0}</span>
                <span className="text-sm opacity-80">Nominees</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground">
                <Trophy className="h-5 w-5 text-secondary" />
                <span className="font-semibold">{totalVotes.toLocaleString()}</span>
                <span className="text-sm opacity-80">Total Votes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nominees by name or alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-card">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <p className="text-muted-foreground text-sm mb-4">
              Found {filteredCreators.length} nominee{filteredCreators.length !== 1 ? "s" : ""} 
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {/* Nominees Grid */}
          {filteredCreators && filteredCreators.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredCreators.map((creator, index) => (
                <NomineeCard
                  key={creator.id}
                  id={creator.id}
                  fullName={creator.full_name}
                  alias={creator.alias}
                  category={creator.category?.name || "Uncategorized"}
                  profilePhotoUrl={creator.profile_photo_url || undefined}
                  voteCount={creator.vote_count ?? 0}
                  rank={index + 1}
                  onVoteSuccess={() => refetch()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No nominees found matching your search.</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-secondary font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No nominees found.</p>
                  <Link to="/auth?mode=signup" className="text-secondary font-medium hover:underline">
                    Be the first to register!
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Nominees;
