import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Menu, Bell, ArrowLeft, CreditCard, Building2, Phone, Mail,
  LayoutGrid, BarChart3, Lightbulb, User, AlertTriangle, Check,
  Loader2, Wallet, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { africanCountries, getEmojiFlag } from "@/lib/africanCountries";

type PayoutMethod = "mpesa" | "bank_transfer" | "card_payout" | "mailed_check";

interface PayoutData {
  payout_method: PayoutMethod;
  mpesa_name: string;
  mpesa_number: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  cardholder_name: string;
  card_type: "visa" | "mastercard" | "";
  card_number: string;
  card_expiry: string;
  mailing_name: string;
  mailing_address: string;
  city: string;
  postal_code: string;
  country: string;
  confirmed: boolean;
  updated_at?: string;
}

const initialPayoutData: PayoutData = {
  payout_method: "mpesa",
  mpesa_name: "",
  mpesa_number: "",
  bank_name: "",
  bank_account_name: "",
  bank_account_number: "",
  bank_branch: "",
  cardholder_name: "",
  card_type: "",
  card_number: "",
  card_expiry: "",
  mailing_name: "",
  mailing_address: "",
  city: "",
  postal_code: "",
  country: "Kenya",
  confirmed: false,
};

const PayoutPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData>(initialPayoutData);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; alias: string; profile_photo_url: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user || roleLoading) return;
    if (isAdmin || isSuperAdmin) {
      navigate("/admin");
    }
  }, [user, authLoading, isAdmin, isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("creators")
        .select("full_name, alias, profile_photo_url")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch existing payout preferences
      const { data: payoutPref, error } = await supabase
        .from("payout_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching payout preferences:", error);
      }

      if (payoutPref) {
        setExistingId(payoutPref.id);
        setPayoutData({
          payout_method: payoutPref.payout_method as PayoutMethod,
          mpesa_name: payoutPref.mpesa_name || "",
          mpesa_number: payoutPref.mpesa_number || "",
          bank_name: payoutPref.bank_name || "",
          bank_account_name: payoutPref.bank_account_name || "",
          bank_account_number: payoutPref.bank_account_number || "",
          bank_branch: payoutPref.bank_branch || "",
          cardholder_name: payoutPref.cardholder_name || "",
          card_type: (payoutPref.card_type as "visa" | "mastercard") || "",
          card_number: payoutPref.card_number || "",
          card_expiry: payoutPref.card_expiry || "",
          mailing_name: payoutPref.mailing_name || "",
          mailing_address: payoutPref.mailing_address || "",
          city: payoutPref.city || "",
          postal_code: payoutPref.postal_code || "",
          country: payoutPref.country || "Kenya",
          confirmed: payoutPref.confirmed || false,
          updated_at: payoutPref.updated_at,
        });
        setConfirmChecked(payoutPref.confirmed || false);
      }

      setLoading(false);
    };

    if (user) fetchData();
  }, [user]);

  const handleInputChange = (field: keyof PayoutData, value: string | boolean) => {
    setPayoutData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const method = payoutData.payout_method;

    if (method === "mpesa") {
      if (!payoutData.mpesa_name.trim()) {
        toast({ title: "Validation Error", description: "M-Pesa Full Name is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.mpesa_number.trim() || !/^(\+?[0-9]{10,15})$/.test(payoutData.mpesa_number.replace(/\s/g, ""))) {
        toast({ title: "Validation Error", description: "Valid M-Pesa Phone Number is required", variant: "destructive" });
        return false;
      }
    }

    if (method === "bank_transfer") {
      if (!payoutData.bank_account_name.trim()) {
        toast({ title: "Validation Error", description: "Account Holder Name is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.bank_name.trim()) {
        toast({ title: "Validation Error", description: "Bank Name is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.bank_account_number.trim() || !/^[0-9]{6,20}$/.test(payoutData.bank_account_number)) {
        toast({ title: "Validation Error", description: "Valid Account Number is required (6-20 digits)", variant: "destructive" });
        return false;
      }
      if (!payoutData.country) {
        toast({ title: "Validation Error", description: "Country is required", variant: "destructive" });
        return false;
      }
    }

    if (method === "card_payout") {
      if (!payoutData.cardholder_name.trim()) {
        toast({ title: "Validation Error", description: "Cardholder Name is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.card_type) {
        toast({ title: "Validation Error", description: "Card Type is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.card_number.trim() || !/^[0-9]{13,19}$/.test(payoutData.card_number.replace(/\s/g, ""))) {
        toast({ title: "Validation Error", description: "Valid Card Number is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.card_expiry.trim() || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(payoutData.card_expiry)) {
        toast({ title: "Validation Error", description: "Valid Expiry Date is required (MM/YY)", variant: "destructive" });
        return false;
      }
      if (!payoutData.country) {
        toast({ title: "Validation Error", description: "Country is required", variant: "destructive" });
        return false;
      }
    }

    if (method === "mailed_check") {
      if (!payoutData.mailing_name.trim()) {
        toast({ title: "Validation Error", description: "Full Legal Name is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.mailing_address.trim()) {
        toast({ title: "Validation Error", description: "Mailing Address is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.city.trim()) {
        toast({ title: "Validation Error", description: "City is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.postal_code.trim()) {
        toast({ title: "Validation Error", description: "Postal Code is required", variant: "destructive" });
        return false;
      }
      if (!payoutData.country) {
        toast({ title: "Validation Error", description: "Country is required", variant: "destructive" });
        return false;
      }
    }

    if (!confirmChecked) {
      toast({ title: "Confirmation Required", description: "Please confirm the accuracy of your payout details", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setSaving(true);

    const payload = {
      user_id: user.id,
      payout_method: payoutData.payout_method,
      mpesa_name: payoutData.payout_method === "mpesa" ? payoutData.mpesa_name : null,
      mpesa_number: payoutData.payout_method === "mpesa" ? payoutData.mpesa_number : null,
      bank_name: payoutData.payout_method === "bank_transfer" ? payoutData.bank_name : null,
      bank_account_name: payoutData.payout_method === "bank_transfer" ? payoutData.bank_account_name : null,
      bank_account_number: payoutData.payout_method === "bank_transfer" ? payoutData.bank_account_number : null,
      bank_branch: payoutData.payout_method === "bank_transfer" ? payoutData.bank_branch : null,
      cardholder_name: payoutData.payout_method === "card_payout" ? payoutData.cardholder_name : null,
      card_type: payoutData.payout_method === "card_payout" ? payoutData.card_type : null,
      card_number: payoutData.payout_method === "card_payout" ? payoutData.card_number : null,
      card_expiry: payoutData.payout_method === "card_payout" ? payoutData.card_expiry : null,
      mailing_name: payoutData.payout_method === "mailed_check" ? payoutData.mailing_name : null,
      mailing_address: payoutData.payout_method === "mailed_check" ? payoutData.mailing_address : null,
      city: payoutData.payout_method === "mailed_check" ? payoutData.city : null,
      postal_code: payoutData.payout_method === "mailed_check" ? payoutData.postal_code : null,
      country: payoutData.country,
      confirmed: confirmChecked,
    };

    try {
      if (existingId) {
        const { error } = await supabase
          .from("payout_preferences")
          .update(payload)
          .eq("id", existingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("payout_preferences")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setExistingId(data.id);
      }

      toast({
        title: "Success!",
        description: "Payout preferences saved successfully. You may update these details until the voting period closes.",
      });
    } catch (error: any) {
      console.error("Error saving payout preferences:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payout preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const payoutMethodLabels: Record<PayoutMethod, { label: string; icon: React.ReactNode }> = {
    mpesa: { label: "M-Pesa", icon: <Phone className="h-4 w-4" /> },
    bank_transfer: { label: "Bank Transfer", icon: <Building2 className="h-4 w-4" /> },
    card_payout: { label: "Card Payout", icon: <CreditCard className="h-4 w-4" /> },
    mailed_check: { label: "Mailed Check", icon: <Mail className="h-4 w-4" /> },
  };

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex flex-col gap-4 mt-6">
              {profile && (
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.profile_photo_url} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{profile.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{profile.alias}</p>
                  </div>
                </div>
              )}
              <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <LayoutGrid className="h-5 w-5" /> Dashboard
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <BarChart3 className="h-5 w-5" /> Rankings
              </Link>
              <Link to="/dashboard/tips" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <Lightbulb className="h-5 w-5" /> Tips
              </Link>
              <Link to="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <User className="h-5 w-5" /> Profile
              </Link>
              <Link to="/dashboard/payout" className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                <Wallet className="h-5 w-5" /> Payout
              </Link>
              <hr className="my-2" />
              <Button variant="ghost" onClick={handleSignOut} className="justify-start text-destructive">
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="font-serif text-lg font-bold">Payout Preferences</h1>

        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            Payouts are processed only after voting ends and verification is complete.
          </AlertDescription>
        </Alert>

        {/* Payout Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-secondary" />
              Select Payout Method
            </CardTitle>
            <CardDescription>
              Choose how you would like to receive your earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={payoutData.payout_method}
              onValueChange={(value) => handleInputChange("payout_method", value)}
              className="grid grid-cols-2 gap-3"
            >
              {(Object.keys(payoutMethodLabels) as PayoutMethod[]).map((method) => (
                <div key={method} className="relative">
                  <RadioGroupItem
                    value={method}
                    id={method}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="mb-2">{payoutMethodLabels[method].icon}</div>
                    <span className="text-sm font-medium">{payoutMethodLabels[method].label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dynamic Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {payoutMethodLabels[payoutData.payout_method].label} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* M-Pesa Fields */}
            {payoutData.payout_method === "mpesa" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_name">M-Pesa Full Name *</Label>
                  <Input
                    id="mpesa_name"
                    placeholder="As registered on M-Pesa"
                    value={payoutData.mpesa_name}
                    onChange={(e) => handleInputChange("mpesa_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_number">M-Pesa Phone Number *</Label>
                  <Input
                    id="mpesa_number"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={payoutData.mpesa_number}
                    onChange={(e) => handleInputChange("mpesa_number", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Bank Transfer Fields */}
            {payoutData.payout_method === "bank_transfer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Holder Name *</Label>
                  <Input
                    id="bank_account_name"
                    placeholder="Full name on bank account"
                    value={payoutData.bank_account_name}
                    onChange={(e) => handleInputChange("bank_account_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name *</Label>
                  <Input
                    id="bank_name"
                    placeholder="e.g., Equity Bank, GTBank"
                    value={payoutData.bank_name}
                    onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number *</Label>
                  <Input
                    id="bank_account_number"
                    placeholder="Your bank account number"
                    value={payoutData.bank_account_number}
                    onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_branch">Branch Name (Optional)</Label>
                  <Input
                    id="bank_branch"
                    placeholder="e.g., Westlands Branch"
                    value={payoutData.bank_branch}
                    onChange={(e) => handleInputChange("bank_branch", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={payoutData.country}
                    onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <span className="flex items-center gap-2">
                            <span>{getEmojiFlag(country.code)}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Card Payout Fields */}
            {payoutData.payout_method === "card_payout" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardholder_name">Cardholder Name *</Label>
                  <Input
                    id="cardholder_name"
                    placeholder="Name as it appears on card"
                    value={payoutData.cardholder_name}
                    onChange={(e) => handleInputChange("cardholder_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card Type *</Label>
                  <RadioGroup
                    value={payoutData.card_type}
                    onValueChange={(value) => handleInputChange("card_type", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visa" id="visa" />
                      <Label htmlFor="visa">Visa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mastercard" id="mastercard" />
                      <Label htmlFor="mastercard">Mastercard</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_number">Card Number *</Label>
                  <Input
                    id="card_number"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={payoutData.card_number}
                    onChange={(e) => handleInputChange("card_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card_expiry">Expiry Date *</Label>
                  <Input
                    id="card_expiry"
                    placeholder="MM/YY"
                    value={payoutData.card_expiry}
                    onChange={(e) => handleInputChange("card_expiry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_card">Country *</Label>
                  <Select
                    value={payoutData.country}
                    onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <span className="flex items-center gap-2">
                            <span>{getEmojiFlag(country.code)}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Mailed Check Fields */}
            {payoutData.payout_method === "mailed_check" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mailing_name">Full Legal Name *</Label>
                  <Input
                    id="mailing_name"
                    placeholder="Name as it should appear on the check"
                    value={payoutData.mailing_name}
                    onChange={(e) => handleInputChange("mailing_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mailing_address">Mailing Address *</Label>
                  <Input
                    id="mailing_address"
                    placeholder="Street address, P.O. Box"
                    value={payoutData.mailing_address}
                    onChange={(e) => handleInputChange("mailing_address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={payoutData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      placeholder="Postal code"
                      value={payoutData.postal_code}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_check">Country *</Label>
                  <Select
                    value={payoutData.country}
                    onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <span className="flex items-center gap-2">
                            <span>{getEmojiFlag(country.code)}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Warning & Confirmation */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>
                  Please double-check all information before saving. Incorrect payout details may result in failed or delayed payments.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-background rounded-lg border">
              <Checkbox
                id="confirm"
                checked={confirmChecked}
                onCheckedChange={(checked) => setConfirmChecked(checked === true)}
              />
              <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                I confirm that the payout details provided are accurate and belong to me. I understand that ACIA is not responsible for losses resulting from incorrect payout information, and no refunds will be issued.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className="w-full btn-gold"
          size="lg"
          onClick={handleSubmit}
          disabled={saving || !confirmChecked}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Payout Preferences
            </>
          )}
        </Button>

        {/* Last Updated */}
        {payoutData.updated_at && (
          <p className="text-center text-xs text-muted-foreground">
            Last updated: {new Date(payoutData.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link 
            to="/dashboard/rankings" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Rankings</span>
          </Link>
          <Link 
            to="/dashboard/tips" 
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground"
          >
            <div className="h-12 w-12 -mt-6 rounded-full bg-secondary flex items-center justify-center shadow-gold">
              <Lightbulb className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-xs">Tips</span>
          </Link>
          <Link 
            to="/dashboard/payout" 
            className="flex flex-col items-center gap-1 p-2 text-blue-600"
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Payout</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default PayoutPreferences;
