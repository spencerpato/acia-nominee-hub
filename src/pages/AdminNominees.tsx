import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Loader2, LogOut, Mail, Eye, UserX, UserCheck, 
  AlertTriangle, Search, Filter, RefreshCw 
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
import { calculateExpectedEarnings, formatEarnings } from "@/lib/emailTemplates";
import { AdminEmailDialog } from "@/components/AdminEmailDialog";
import { UpdateStatusDialog } from "@/components/UpdateStatusDialog";

type Creator = Tables<"creators"> & {
  category?: { id: string; name: string } | null;
};

type NomineeStatus = "active" | "dormant" | "withdrawn" | "disqualified";

const AdminNominees = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Status update dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [creatorToUpdate, setCreatorToUpdate] = useState<Creator | null>(null);

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

  const fetchCreators = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*, category:categories(id, name)")
        .order("vote_count", { ascending: false });

      if (error) throw error;
      if (data) setCreators(data);
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
      fetchCreators();
    }
  }, [user, isAdmin, isSuperAdmin]);

  const getCreatorStatus = (creator: Creator): NomineeStatus => {
    if (!creator.is_approved) return "withdrawn";
    if (!creator.is_active) return "disqualified";
    // Consider dormant if vote count is 0 or very low activity
    if (creator.vote_count === 0 || creator.vote_count === null) return "dormant";
    return "active";
  };

  const getStatusBadge = (status: NomineeStatus) => {
    const variants: Record<NomineeStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      dormant: { variant: "secondary", label: "Dormant" },
      withdrawn: { variant: "outline", label: "Withdrawn" },
      disqualified: { variant: "destructive", label: "Disqualified" },
    };
    return variants[status];
  };

  const handleSendEmail = (creator: Creator) => {
    setSelectedCreator(creator);
    setEmailDialogOpen(true);
  };

  const handleUpdateStatus = (creator: Creator) => {
    setCreatorToUpdate(creator);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdated = () => {
    fetchCreators();
    setStatusDialogOpen(false);
    setCreatorToUpdate(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Filter creators based on search and status
  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = 
      creator.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.alias.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getCreatorStatus(creator);
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const totalVotes = creators.reduce((sum, c) => sum + (c.vote_count || 0), 0);
  const activeCreators = creators.filter(c => getCreatorStatus(c) === "active").length;
  const dormantCreators = creators.filter(c => getCreatorStatus(c) === "dormant").length;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Nominees Management</h1>
            <p className="text-muted-foreground">
              Manage nominees, send emails, and update statuses
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin">Back to Admin</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Nominees</p>
                <p className="text-3xl font-bold">{creators.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeCreators}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Dormant</p>
                <p className="text-3xl font-bold text-yellow-600">{dormantCreators}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-3xl font-bold">{totalVotes.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or alias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="dormant">Dormant</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="disqualified">Disqualified</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={fetchCreators}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nominees Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Nominees</CardTitle>
            <CardDescription>
              {filteredCreators.length} nominee{filteredCreators.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead className="hidden md:table-cell">Expected Earnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No nominees found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCreators.map((creator) => {
                      const status = getCreatorStatus(creator);
                      const statusBadge = getStatusBadge(status);
                      const earnings = calculateExpectedEarnings(creator.vote_count || 0);

                      return (
                        <TableRow key={creator.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{creator.full_name}</p>
                              <p className="text-sm text-muted-foreground">@{creator.alias}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {creator.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {creator.phone || "-"}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {(creator.vote_count || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="font-semibold text-green-600">
                              {formatEarnings(earnings)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendEmail(creator)}
                                title="Send Email"
                              >
                                <Mail className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Email</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                title="View Profile"
                              >
                                <Link to={`/nominee/${creator.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">View</span>
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(creator)}
                                title="Update Status"
                              >
                                {status === "active" ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline ml-1">Status</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Email Dialog */}
      {selectedCreator && (
        <AdminEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          creator={selectedCreator}
        />
      )}

      {/* Status Update Dialog */}
      {creatorToUpdate && (
        <UpdateStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          creator={creatorToUpdate}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default AdminNominees;
