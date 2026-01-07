import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trophy, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VoteModal from "./VoteModal";
import { getOptimizedUrl, isCloudinaryUrl } from "@/lib/cloudinary";

interface NomineeCardProps {
  id: string;
  fullName: string;
  alias: string;
  category: string;
  profilePhotoUrl?: string;
  voteCount: number;
  rank: number;
  onVoteSuccess?: () => void;
}

const NomineeCard = ({
  id,
  fullName,
  alias,
  category,
  profilePhotoUrl,
  voteCount,
  rank,
  onVoteSuccess,
}: NomineeCardProps) => {
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full p-2 shadow-gold">
          <Trophy className="h-4 w-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground rounded-full p-2 shadow-sm">
          <Star className="h-4 w-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-600 rounded-full p-2 shadow-sm">
          <Star className="h-4 w-4" />
        </div>
      );
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Optimize profile photo URL if it's from Cloudinary
  const optimizedPhotoUrl = profilePhotoUrl && isCloudinaryUrl(profilePhotoUrl)
    ? getOptimizedUrl(profilePhotoUrl, { width: 200, height: 200, quality: "auto" })
    : profilePhotoUrl;

  return (
    <>
      <Card className="group relative overflow-hidden card-hover bg-card border-border">
        {getRankBadge(rank)}
        
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center text-center">
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              #{rank}
            </div>

            {/* View Profile Link */}
            <Link 
              to={`/nominee/${id}`}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>

            {/* Avatar - Clickable */}
            <Link to={`/nominee/${id}`} className="relative mb-3 mt-2 cursor-pointer">
              <Avatar className="h-16 w-16 md:h-24 md:w-24 border-4 border-secondary/20 group-hover:border-secondary transition-colors">
                <AvatarImage src={optimizedPhotoUrl} alt={fullName} loading="lazy" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg md:text-xl font-serif">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Info - Clickable */}
            <Link to={`/nominee/${id}`} className="hover:opacity-80 transition-opacity">
              <h3 className="font-serif text-sm md:text-lg font-semibold text-foreground mb-1 line-clamp-1">
                {fullName}
              </h3>
            </Link>
            <p className="text-secondary font-medium text-xs md:text-sm mb-2">@{alias}</p>
            <Badge variant="secondary" className="mb-3 text-xs">
              {category}
            </Badge>

            {/* Vote Count */}
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Heart className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
              <span className="text-xs md:text-sm font-medium">
                {voteCount.toLocaleString()} votes
              </span>
            </div>

            {/* Vote Button */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVoteModalOpen(true);
              }}
              className="w-full btn-gold text-xs md:text-sm"
              size="sm"
            >
              Support
            </Button>

            {/* Voting Notice */}
            <p className="text-[10px] md:text-xs text-muted-foreground mt-2 leading-tight">
              Support with multiple votes in the vote window
            </p>
          </div>
        </CardContent>
      </Card>

      <VoteModal
        isOpen={isVoteModalOpen}
        onClose={() => setIsVoteModalOpen(false)}
        creatorId={id}
        creatorName={fullName}
        creatorAlias={alias}
        creatorPhoto={profilePhotoUrl}
        creatorCategory={category}
        onVoteSuccess={onVoteSuccess}
      />
    </>
  );
};

export default NomineeCard;
