import { useState } from "react";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAlias: string;
  creatorPhoto?: string;
  onVoteSuccess?: () => void;
}

const VoteModal = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAlias,
  creatorPhoto,
  onVoteSuccess,
}: VoteModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleVote = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("votes").insert({
        creator_id: creatorId,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Vote submitted!",
        description: `You've successfully voted for @${creatorAlias}`,
      });

      onVoteSuccess?.();

      // Auto close after success animation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Vote error:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            {isSuccess ? "Thank You!" : "Cast Your Vote"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSuccess
              ? "Your vote has been recorded successfully!"
              : "Show your support by voting for this creator"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {/* Creator Info */}
          <Avatar className="h-20 w-20 mb-4 border-4 border-secondary/20">
            <AvatarImage src={creatorPhoto} alt={creatorName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-serif">
              {getInitials(creatorName)}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
            {creatorName}
          </h3>
          <p className="text-secondary font-medium mb-6">@{creatorAlias}</p>

          {/* Success State */}
          {isSuccess ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-muted-foreground text-center">
                Thank you for supporting @{creatorAlias}!
              </p>
            </div>
          ) : (
            <>
              {/* Vote Info */}
              <div className="bg-muted rounded-lg p-4 w-full mb-6">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <Heart className="h-5 w-5 text-destructive" />
                  <span className="font-medium">1 Free Vote</span>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Voting is completely free during this period
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 btn-gold"
                  onClick={handleVote}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Voting...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Vote Now
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
