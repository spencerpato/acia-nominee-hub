import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "acia_cookie_consent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-2xl p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/10">
              <Cookie className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Cookie Consent</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your experience on the ACIA platform. Essential cookies 
                    are required for the platform to function properly, while analytics cookies help 
                    us improve our services.{" "}
                    <Link to="/privacy" className="text-secondary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
                <button
                  onClick={handleDecline}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAccept}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                >
                  Essential Only
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
