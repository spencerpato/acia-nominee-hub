import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const VoteSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [votes, setVotes] = useState<number>(0);
  const [message, setMessage] = useState("");

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference found");
        return;
      }

      try {
        const response = await fetch(
          `https://qprtljmxfulproevgydc.supabase.co/functions/v1/verify-paystack?reference=${reference}`
        );

        const result = await response.json();

        if (result.status === "success") {
          setStatus("success");
          setVotes(result.votes || 1);
          setMessage("Thank you for your support!");
        } else if (result.status === "pending") {
          setStatus("loading");
          setMessage(result.message || "Payment is being processed...");
          // Poll again after a few seconds
          setTimeout(verifyPayment, 3000);
        } else {
          setStatus("failed");
          setMessage(result.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("Failed to verify payment");
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Helmet>
        <title>Vote Confirmation | ACIA Awards</title>
        <meta name="description" content="Your vote has been recorded for the African Creator Impact Awards." />
      </Helmet>

      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              {status === "loading" && "Processing Payment..."}
              {status === "success" && "Vote Confirmed! 🎉"}
              {status === "failed" && "Payment Issue"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your payment"}
              {status === "success" && `Your ${votes} vote${votes > 1 ? 's have' : ' has'} been recorded`}
              {status === "failed" && message}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <>
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-muted-foreground">{message}</p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => navigate("/nominees")} className="btn-gold">
                    View All Nominees
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/leaderboard")}>
                    See Leaderboard
                  </Button>
                </div>
              </>
            )}
            {status === "failed" && (
              <>
                <div className="bg-destructive/10 rounded-full p-4">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => navigate("/nominees")} variant="outline">
                    Back to Nominees
                  </Button>
                  <Button onClick={() => window.location.reload()} className="btn-gold">
                    Retry Verification
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VoteSuccess;
