import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Loader2, LogOut, Search, Filter, RefreshCw, 
  CheckCircle, AlertCircle, Phone, Building2, CreditCard, Mail as MailIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PayoutPreference = Tables<"payout_preferences">;
type Creator = Tables<"creators"> & {
  category?: { id: string; name: string } | null;
};

type PayoutWithCreator = PayoutPreference & {
  creator?: Creator | null;
};

const AdminPayouts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);

  const [payouts, setPayouts] = useState<PayoutWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [confirmationFilter, setConfirmationFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user || roleLoading) return;

    if (!isAdmin && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, isSuperAdmin, roleLoading, navigate]);

  const fetchPayouts = async () => {
    setRefreshing(true);
    try {
      // First fetch all payout preferences
      const { data: payoutData, error: payoutError } = await supabase
        .from("payout_preferences")
        .select("*")
        .order("updated_at", { ascending: false });

      if (payoutError) throw payoutError;

      // Then fetch all creators to join manually
      const { data: creatorsData, error: creatorsError } = await supabase
        .from("creators")
        .select("*, category:categories(id, name)");

      if (creatorsError) throw creatorsError;

      // Join payouts with creators by user_id
      const payoutsWithCreators: PayoutWithCreator[] = (payoutData || []).map(payout => {
        const creator = creatorsData?.find(c => c.user_id === payout.user_id) || null;
        return { ...payout, creator };
      });

      setPayouts(payoutsWithCreators);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      fetchPayouts();
    }
  }, [user, isAdmin, isSuperAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return <Phone className="h-4 w-4" />;
      case "bank":
        return <Building2 className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <MailIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "mpesa":
        return "M-Pesa";
      case "bank":
        return "Bank Transfer";
      case "card":
        return "Card Payout";
      case "check":
        return "Mailed Check";
      default:
        return method;
    }
  };

  const renderPayoutDetails = (payout: PayoutWithCreator) => {
    switch (payout.payout_method) {
      case "mpesa":
        return (
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Name:</span> {payout.mpesa_name || "-"}</p>
            <p><span className="text-muted-foreground">Phone:</span> {payout.mpesa_number || "-"}</p>
          </div>
        );
      case "bank":
        return (
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Bank:</span> {payout.bank_name || "-"}</p>
            <p><span className="text-muted-foreground">Account:</span> {payout.bank_account_name || "-"}</p>
            <p><span className="text-muted-foreground">Number:</span> {payout.bank_account_number || "-"}</p>
            {payout.bank_branch && (
              <p><span className="text-muted-foreground">Branch:</span> {payout.bank_branch}</p>
            )}
          </div>
        );
      case "card":
        return (
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Holder:</span> {payout.cardholder_name || "-"}</p>
            <p><span className="text-muted-foreground">Type:</span> {payout.card_type || "-"}</p>
            <p>
              <span className="text-muted-foreground">Card:</span>{" "}
              {payout.card_number ? `•••• •••• •••• ${payout.card_number.slice(-4)}` : "-"}
            </p>
            {payout.card_expiry && (
              <p><span className="text-muted-foreground">Expiry:</span> {payout.card_expiry}</p>
            )}
          </div>
        );
      case "check":
        return (
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Name:</span> {payout.mailing_name || "-"}</p>
            <p><span className="text-muted-foreground">Address:</span> {payout.mailing_address || "-"}</p>
            <p>
              <span className="text-muted-foreground">Location:</span>{" "}
              {[payout.city, payout.postal_code, payout.country].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
        );
      default:
        return <span className="text-muted-foreground">-</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter payouts based on search and filters
  const filteredPayouts = payouts.filter((payout) => {
    const creatorName = payout.creator?.full_name || "";
    const creatorEmail = payout.creator?.email || "";
    const creatorAlias = payout.creator?.alias || "";
    
    const matchesSearch = 
      creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorAlias.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = methodFilter === "all" || payout.payout_method === methodFilter;
    const matchesConfirmation = 
      confirmationFilter === "all" || 
      (confirmationFilter === "confirmed" && payout.confirmed) ||
      (confirmationFilter === "pending" && !payout.confirmed);

    return matchesSearch && matchesMethod && matchesConfirmation;
  });

  if (authLoading || loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const confirmedCount = payouts.filter(p => p.confirmed).length;
  const pendingCount = payouts.filter(p => !p.confirmed).length;
  const mpesaCount = payouts.filter(p => p.payout_method === "mpesa").length;
  const bankCount = payouts.filter(p => p.payout_method === "bank").length;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 container py-4 md:py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Payout Preferences</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              View and verify creator payout details
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link to="/admin">Back to Admin</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1 sm:flex-none">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl md:text-3xl font-bold">{payouts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{confirmedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 md:pt-6">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground">M-Pesa / Bank</p>
                <p className="text-2xl md:text-3xl font-bold">{mpesaCount} / {bankCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by creator name, email, or alias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card Payout</SelectItem>
                    <SelectItem value="check">Mailed Check</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={confirmationFilter} onValueChange={setConfirmationFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={fetchPayouts}
                  disabled={refreshing}
                  size="icon"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">All Payout Preferences</CardTitle>
            <CardDescription>
              {filteredPayouts.length} record{filteredPayouts.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Payout Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payout preferences found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <TableRow 
                        key={payout.id}
                        className={!payout.confirmed ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {payout.creator?.full_name || "Unknown Creator"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{payout.creator?.alias || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {payout.creator?.category?.name || (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {(payout.creator?.vote_count || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payout.payout_method)}
                            <span className="text-sm">{getMethodLabel(payout.payout_method)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderPayoutDetails(payout)}
                        </TableCell>
                        <TableCell>
                          {payout.confirmed ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(payout.updated_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPayouts;
