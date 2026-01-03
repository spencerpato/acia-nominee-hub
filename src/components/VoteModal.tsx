import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, AlertCircle, Lock, Smartphone, Star, Vote, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAlias: string;
  creatorPhoto?: string;
  creatorCategory?: string;
  onVoteSuccess?: () => void;
}

type PaymentState = "idle" | "initiating" | "polling" | "success" | "failed";

const VOTE_PRICE = 10; // KES per vote

const VoteModal = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAlias,
  creatorPhoto,
  creatorCategory,
  onVoteSuccess,
}: VoteModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [votes, setVotes] = useState(1);
  const [amount, setAmount] = useState(10);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle votes input change
  const handleVotesChange = (value: string) => {
    const numVotes = parseInt(value) || 0;
    setVotes(Math.max(0, numVotes));
    setAmount(Math.max(0, numVotes) * VOTE_PRICE);
    setErrorMessage("");
  };

  // Handle amount input change with truncation (not rounding)
  const handleAmountChange = (value: string) => {
    const numAmount = parseInt(value) || 0;
    setAmount(Math.max(0, numAmount));
    // Truncate to nearest whole number below (floor division)
    setVotes(Math.floor(Math.max(0, numAmount) / VOTE_PRICE));
    setErrorMessage("");
  };

  // Clean up polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const resetState = () => {
    setPaymentState("idle");
    setErrorMessage("");
    setVotes(1);
    setAmount(10);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleClose = () => {
    if (paymentState !== "initiating" && paymentState !== "polling") {
      resetState();
      setPhoneNumber("");
      onClose();
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, "");
    const kenyanRegex = /^(0[17]\d{8}|254[17]\d{8})$/;
    return kenyanRegex.test(cleaned);
  };

  const pollPaymentStatus = (paymentId: string, expectedVotes: number) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    pollingRef.current = setInterval(async () => {
      attempts++;
      
      try {
        console.log(`Polling attempt ${attempts} for payment ${paymentId}`);
        
        const response = await fetch(
          `https://qprtljmxfulproevgydc.supabase.co/functions/v1/check-payment-status?payment_id=${paymentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Poll response not ok:", response.status);
          return;
        }

        const result = await response.json();
        console.log("Poll result:", result);

        if (result.status === "success") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setPaymentState("success");
          toast({
            title: "Votes recorded!",
            description: `Thank you for supporting @${creatorAlias} with ${expectedVotes} vote${expectedVotes > 1 ? 's' : ''}!`,
          });
          onVoteSuccess?.();
          
          setTimeout(() => {
            handleClose();
          }, 3000);
        } else if (result.status === "failed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setPaymentState("failed");
          setErrorMessage(result.reason === "timeout" ? "Payment timed out" : "Payment was not completed");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
        setPaymentState("failed");
        setErrorMessage("Payment verification timed out");
      }
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid M-Pesa number");
      return;
    }

    if (votes < 1 || amount < VOTE_PRICE) {
      setErrorMessage("Minimum is 1 vote (KES 10)");
      return;
    }

    setPaymentState("initiating");
    setErrorMessage("");

    // Calculate final amount based on votes (to ensure consistency)
    const finalAmount = votes * VOTE_PRICE;

    try {
      const response = await fetch(
        "https://qprtljmxfulproevgydc.supabase.co/functions/v1/initiate-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creator_id: creatorId,
            phone_number: phoneNumber.replace(/\s+/g, ""),
            amount: finalAmount,
            votes_expected: votes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to initiate payment");
      }

      setPaymentState("polling");
      pollPaymentStatus(result.payment_id, votes);
      
      toast({
        title: "STK Push sent",
        description: "Please check your phone and enter your M-Pesa PIN",
      });
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentState("failed");
      setErrorMessage(error instanceof Error ? error.message : "Failed to initiate payment");
    }
  };

  const isPaymentDisabled = paymentState === "initiating" || !phoneNumber || votes < 1 || amount < VOTE_PRICE;

  const shareUrl = `${window.location.origin}/nominee/${creatorId}`;
  const shareText = `Support @${creatorAlias} at the African Creator Impact Awards! Vote now:`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share it with friends!" });
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden max-h-[85vh]">
        <ScrollArea className="max-h-[85vh]">
          {/* Header */}
          <div className="relative pt-6 pb-3 px-5 text-center bg-background">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted rounded-full" />
            
            <h2 className="text-xl font-bold text-foreground">Support Creator</h2>
            <p className="text-xs text-primary font-semibold tracking-wide mt-0.5">
              AFRICAN CREATOR IMPACT AWARDS
            </p>
          </div>

          {/* Creator Info */}
          <div className="flex flex-col items-center px-5 py-3 bg-background">
            <div className="relative">
              <Avatar className="h-16 w-16 border-3 border-background shadow-lg">
                <AvatarImage src={creatorPhoto} alt={creatorName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-serif">
                  {getInitials(creatorName)}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-1.5 py-0 text-[10px]">
                <Star className="h-2.5 w-2.5 mr-0.5" />
                Nominee
              </Badge>
            </div>

            <h3 className="font-bold text-base text-foreground mt-3">{creatorName}</h3>
            <p className="text-primary font-medium text-xs">@{creatorAlias}</p>
            {creatorCategory && (
              <Badge variant="outline" className="mt-1 text-muted-foreground text-[10px] px-2 py-0">
                {creatorCategory}
              </Badge>
            )}
          </div>

          {/* Content based on state */}
          <div className="px-5 pb-5 bg-background">
            {paymentState === "success" ? (
              <div className="flex flex-col items-center py-4 animate-fade-in">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-3">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Thank You!</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Your {votes} vote{votes > 1 ? 's' : ''} for @{creatorAlias} {votes > 1 ? 'have' : 'has'} been recorded!
                </p>
                
                {/* Social Share after success */}
                <div className="mt-4 w-full">
                  <p className="text-xs text-muted-foreground text-center mb-2">Share with friends</p>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleShareWhatsApp} className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShareTwitter} className="h-8 w-8 p-0">
                      <Twitter className="h-4 w-4 text-blue-400" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShareFacebook} className="h-8 w-8 p-0">
                      <Facebook className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-8 w-8 p-0">
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : paymentState === "failed" ? (
              <div className="flex flex-col items-center py-4">
                <div className="bg-destructive/10 rounded-full p-3 mb-3">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Payment Failed</h3>
                <p className="text-muted-foreground text-center text-sm mb-3">{errorMessage}</p>
                <Button onClick={resetState} className="w-full h-10" size="sm">
                  Try Again
                </Button>
              </div>
            ) : paymentState === "polling" ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Waiting for payment...
                </h3>
                <p className="text-muted-foreground text-center text-xs">
                  Please enter your M-Pesa PIN on your phone
                </p>
                <div className="mt-3 px-3 py-1.5 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-foreground">
                    {votes} vote{votes > 1 ? 's' : ''} • KES {votes * VOTE_PRICE}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Vote/Amount info */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-2 mb-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary">
                    <Vote className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">1 Vote = KES 10</span>
                  </div>
                </div>

                {/* Votes and Amount inputs */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-medium text-muted-foreground">
                      Number of Votes
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={votes || ""}
                      onChange={(e) => handleVotesChange(e.target.value)}
                      className="h-10 text-center text-base font-semibold"
                      disabled={paymentState === "initiating"}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-medium text-muted-foreground">
                      Amount (KES)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      step="10"
                      value={amount || ""}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="h-10 text-center text-base font-semibold"
                      disabled={paymentState === "initiating"}
                    />
                  </div>
                </div>

                {/* Summary */}
                {votes > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 mb-3">
                    <p className="text-xs text-foreground text-center">
                      Supporting <span className="font-bold text-primary">@{creatorAlias}</span> with{" "}
                      <span className="font-bold">{votes} vote{votes > 1 ? 's' : ''}</span> (
                      <span className="font-bold text-secondary">KES {votes * VOTE_PRICE}</span>)
                    </p>
                  </div>
                )}

                {votes < 1 && amount > 0 && amount < VOTE_PRICE && (
                  <p className="text-[10px] text-destructive text-center mb-2">
                    Minimum amount is KES 10 for 1 vote
                  </p>
                )}

                {/* Phone input */}
                <div className="space-y-0.5 mb-3">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="0712 345 678"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setErrorMessage("");
                      }}
                      className="pl-9 h-10 text-sm"
                      disabled={paymentState === "initiating"}
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-[10px] text-destructive">{errorMessage}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isPaymentDisabled}
                  className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90"
                >
                  {paymentState === "initiating" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay KES {votes * VOTE_PRICE} for {votes} Vote{votes > 1 ? 's' : ''}
                    </>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5 text-green-600" />
                  <span>Secure payment via M-Pesa</span>
                </div>

                {/* Social Share */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground text-center mb-2">Share this creator</p>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={handleShareWhatsApp} className="h-7 w-7 p-0">
                      <Share2 className="h-3.5 w-3.5 text-green-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleShareTwitter} className="h-7 w-7 p-0">
                      <Twitter className="h-3.5 w-3.5 text-blue-400" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleShareFacebook} className="h-7 w-7 p-0">
                      <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCopyLink} className="h-7 w-7 p-0">
                      <Link2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
