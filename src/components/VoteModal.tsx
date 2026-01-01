import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle, AlertCircle, Lock, Smartphone, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    // Remove spaces and validate Kenyan phone format
    const cleaned = phone.replace(/\s+/g, "");
    // Accept formats: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX
    const kenyanRegex = /^(0[17]\d{8}|254[17]\d{8})$/;
    return kenyanRegex.test(cleaned);
  };

  const pollPaymentStatus = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max (2s intervals)

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
            title: "Vote recorded!",
            description: `Thank you for supporting @${creatorAlias}!`,
          });
          onVoteSuccess?.();
          
          // Auto close after success
          setTimeout(() => {
            handleClose();
          }, 3000);
        } else if (result.status === "failed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setPaymentState("failed");
          setErrorMessage(result.reason === "timeout" ? "Payment timed out" : "Payment was not completed");
        }
        // If status is "pending", continue polling
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

    setPaymentState("initiating");
    setErrorMessage("");

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
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to initiate payment");
      }

      // Start polling for payment status
      setPaymentState("polling");
      pollPaymentStatus(result.payment_id);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative pt-8 pb-4 px-6 text-center bg-background">
          {/* Drag indicator */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />
          
          <h2 className="text-2xl font-bold text-foreground">Cast Your Vote</h2>
          <p className="text-sm text-primary font-semibold tracking-wide mt-1">
            AFRICAN CREATOR IMPACT AWARDS
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex flex-col items-center px-6 py-6 bg-background">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
              <AvatarImage src={creatorPhoto} alt={creatorName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-serif">
                {getInitials(creatorName)}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-3 py-1">
              <Star className="h-3 w-3 mr-1" />
              Nominee
            </Badge>
          </div>

          <h3 className="font-bold text-xl text-foreground mt-6">{creatorName}</h3>
          <p className="text-primary font-medium">@{creatorAlias}</p>
          {creatorCategory && (
            <Badge variant="outline" className="mt-2 text-muted-foreground">
              {creatorCategory}
            </Badge>
          )}
        </div>

        {/* Content based on state */}
        <div className="px-6 pb-6 bg-background">
          {paymentState === "success" ? (
            <div className="flex flex-col items-center py-6 animate-fade-in">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground text-center">
                Your vote for @{creatorAlias} has been recorded!
              </p>
            </div>
          ) : paymentState === "failed" ? (
            <div className="flex flex-col items-center py-6">
              <div className="bg-destructive/10 rounded-full p-4 mb-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Payment Failed</h3>
              <p className="text-muted-foreground text-center mb-4">{errorMessage}</p>
              <Button onClick={resetState} className="w-full">
                Try Again
              </Button>
            </div>
          ) : paymentState === "polling" ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Waiting for payment...
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                Please enter your M-Pesa PIN on your phone
              </p>
            </div>
          ) : (
            <>
              {/* Info box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    Each vote costs <span className="font-bold text-primary">10 KES</span> and directly supports this creator.
                  </p>
                </div>
              </div>

              {/* Phone input */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-foreground">
                  M-Pesa Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="0712 345 678"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setErrorMessage("");
                    }}
                    className="pl-10 h-12 text-lg"
                    disabled={paymentState === "initiating"}
                  />
                </div>
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={paymentState === "initiating" || !phoneNumber}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
              >
                {paymentState === "initiating" ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Support @{creatorAlias}
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-green-600" />
                <span>Secure payment via M-Pesa</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteModal;
