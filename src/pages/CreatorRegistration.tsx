import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCreators";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { africanCountries } from "@/lib/africanCountries";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  alias: z
    .string()
    .min(2, "Alias is required")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  phone: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  country: z.string().min(1, "Country is required"),
});

const CreatorRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading, refetchRoles } = useUserRole(user?.id);
  const { data: categories } = useCategories();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", alias: "", phone: "", categoryId: "", country: "Kenya" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefilled, setPrefilled] = useState(false);

  const canonicalUrl = useMemo(() => `${window.location.origin}/creator/register`, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    // Only enforce role redirects once auth state is fully resolved.
    if (authLoading || !user || roleLoading) return;

    if (isAdmin || isSuperAdmin) navigate("/admin");
  }, [user, authLoading, isAdmin, isSuperAdmin, roleLoading, navigate]);

  // Prefill form from user metadata
  useEffect(() => {
    if (user && !prefilled) {
      const metadata = user.user_metadata || {};
      setForm({
        fullName: metadata.fullName || "",
        alias: metadata.alias || "",
        phone: metadata.phone || "",
        categoryId: metadata.categoryId || "",
        country: metadata.country || "Kenya",
      });
      setPrefilled(true);
    }
  }, [user, prefilled]);

  useEffect(() => {
    const checkExisting = async () => {
      // If you're admin/superadmin, never go through nominee registration.
      if (!user || roleLoading) return;
      if (isAdmin || isSuperAdmin) {
        navigate("/admin");
        return;
      }

      const { data, error } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.id) navigate("/dashboard");
    };

    if (user) checkExisting();
  }, [user, isAdmin, isSuperAdmin, roleLoading, navigate]);

  const handleChange = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setErrors({});

    try {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const { error: insertError } = await supabase.from("creators").insert({
        user_id: user.id,
        full_name: form.fullName,
        alias: form.alias,
        email: user.email || "",
        phone: form.phone || null,
        category_id: form.categoryId,
        country: form.country,
      });

      if (insertError) {
        if (insertError.message?.toLowerCase().includes("duplicate")) {
          throw new Error("This alias is already taken");
        }
        throw insertError;
      }

      const { error: roleErr } = await supabase.functions.invoke("assign-creator-role");
      if (!roleErr) refetchRoles();

      toast({ title: "Success", description: "Nominee profile created." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create nominee profile",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Helmet>
        <title>Nominee Registration | ACIA Awards</title>
        <meta
          name="description"
          content="Complete your ACIA Awards nominee registration to appear on the nominees list and access your dashboard."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Nominee Registration</CardTitle>
            <CardDescription>Complete your profile to appear on the nominees list.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="alias">Alias (@username)</Label>
                <Input
                  id="alias"
                  value={form.alias}
                  onChange={(e) => handleChange("alias", e.target.value)}
                  placeholder="your_alias"
                />
                {errors.alias && <p className="text-sm text-destructive mt-1">{errors.alias}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={form.country} onValueChange={(v) => handleChange("country", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {africanCountries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId}</p>}
              </div>

              <Button type="submit" className="w-full btn-gold" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Finish Registration"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreatorRegistration;
