import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
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
import Logo from "@/components/Logo";
import { africanCountries, getEmojiFlag } from "@/lib/africanCountries";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Full name is required"),
  alias: z.string().min(2, "Alias is required").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  phone: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  country: z.string().min(1, "Country is required"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const isSignUp = mode === "signup";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const {
    isAdmin,
    isSuperAdmin,
    isCreator,
    loading: roleLoading,
    refetchRoles,
  } = useUserRole(user?.id);
  const { data: categories } = useCategories();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    alias: "",
    phone: "",
    categoryId: "",
    country: "Kenya",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect based on role after login - but skip if handleSubmit is doing explicit navigation
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Skip auto-redirect during form submission to prevent race conditions
    if (isSubmitting) return;
    
    if (user && !roleLoading) {
      // Check for superadmin email first
      if (user.email?.toLowerCase() === "awardsacia@gmail.com") {
        navigate("/admin");
        return;
      }
      
      if (isAdmin || isSuperAdmin) {
        navigate("/admin");
        return;
      }

      // If not an admin, send them to creator onboarding if they don't yet have creator role
      if (!isCreator) {
        navigate("/creator/register");
        return;
      }

      navigate("/dashboard");
    }
  }, [user, isAdmin, isSuperAdmin, isCreator, roleLoading, navigate, isSubmitting]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);
    setErrors({});

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          alias: formData.alias,
          phone: formData.phone,
          categoryId: formData.categoryId,
          country: formData.country,
        });
        if (error) throw error;

        if (!data.session) {
          toast({
            title: "Confirm your email",
            description: "Please confirm your email, then sign in to complete nominee registration.",
          });
          navigate("/auth?mode=signin");
          return;
        }

        toast({ title: "Welcome!", description: "Account created. Complete your nominee profile." });
        navigate("/creator/register");
        return;
      }

      const result = signInSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;

      // Handle superadmin separately - bootstrap role and redirect immediately
      if (formData.email.toLowerCase() === "awardsacia@gmail.com") {
        try {
          await supabase.functions.invoke("bootstrap-superadmin");
        } catch {
          // Silent - role may already exist
        }
        toast({ title: "Welcome back, Admin!" });
        navigate("/admin");
        return;
      }

      toast({ title: "Welcome back!" });
      // Let useEffect handle redirect for non-superadmin users
      setIsSubmitting(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <CardTitle className="font-serif text-2xl">
              {isSignUp ? "Register as Creator" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "Join Africa's top creators" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} />
                    {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="alias">Alias (@username)</Label>
                    <Input id="alias" value={formData.alias} onChange={(e) => handleChange("alias", e.target.value)} placeholder="your_alias" />
                    {errors.alias && <p className="text-sm text-destructive mt-1">{errors.alias}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50 max-h-60">
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
                    {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>
              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
                  {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>
              )}
              <Button type="submit" className="w-full btn-gold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Please wait...</> : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <Link to={isSignUp ? "/auth?mode=signin" : "/auth?mode=signup"} className="text-secondary font-medium hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
