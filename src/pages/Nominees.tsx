import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NomineeCard from "@/components/NomineeCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreators, useCategories } from "@/hooks/useCreators";

const Nominees = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: creators, refetch } = useCreators(categoryFilter === "all" ? undefined : categoryFilter);
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">All Nominees</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Support your favorite African creators by voting for them
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
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

          {creators && creators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creators.map((creator, index) => (
                <NomineeCard
                  key={creator.id}
                  id={creator.id}
                  fullName={creator.full_name}
                  alias={creator.alias}
                  category={creator.category?.name || "Uncategorized"}
                  profilePhotoUrl={creator.profile_photo_url || undefined}
                  voteCount={creator.vote_count}
                  rank={index + 1}
                  onVoteSuccess={() => refetch()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No nominees found.</p>
              <Link to="/auth?mode=signup" className="text-secondary font-medium hover:underline">
                Be the first to register!
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Nominees;
