import { useState } from "react";
import { Heart, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VoteModal from "./VoteModal";

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

  return (
    <>
      <Card className="group relative overflow-hidden card-hover bg-card border-border">
        {getRankBadge(rank)}
        
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-secondary/20 group-hover:border-secondary transition-colors">
                <AvatarImage src={profilePhotoUrl} alt={fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-serif">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              {rank <= 3 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  #{rank}
                </div>
              )}
            </div>

            {/* Info */}
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              {fullName}
            </h3>
            <p className="text-secondary font-medium text-sm mb-2">@{alias}</p>
            <Badge variant="secondary" className="mb-4">
              {category}
            </Badge>

            {/* Vote Count */}
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">
                {voteCount.toLocaleString()} votes
              </span>
            </div>

            {/* Vote Button */}
            <Button
              onClick={() => setIsVoteModalOpen(true)}
              className="w-full btn-gold"
            >
              Support @{alias}
            </Button>
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
