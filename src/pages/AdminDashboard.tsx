import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Users, CheckCircle, XCircle, Trash2, Plus, FolderOpen, Image, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ImageCropperModal } from "@/components/ImageCropperModal";
import { ImageMigrationTool } from "@/components/ImageMigrationTool";

type Creator = Tables<"creators">;
type Category = Tables<"categories">;
type GalleryItem = Tables<"gallery">;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole(user?.id);

  const [creators, setCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Gallery form
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [newGallery, setNewGallery] = useState({ title: "", description: "" });
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only enforce role redirects once auth state is fully resolved.
    if (authLoading || !user || roleLoading) return;

    if (!isAdmin && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const [creatorsRes, categoriesRes, galleryRes] = await Promise.all([
        supabase.from("creators").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("gallery").select("*").order("created_at", { ascending: false }),
      ]);

      if (creatorsRes.data) setCreators(creatorsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (galleryRes.data) setGalleryItems(galleryRes.data);
      setLoading(false);
    };

    if (user && (isAdmin || isSuperAdmin)) fetchData();
  }, [user, isAdmin, isSuperAdmin]);

  const handleApprove = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("creators").update({ is_approved: approved }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCreators(creators.map((c) => (c.id === id ? { ...c, is_approved: approved } : c)));
      toast({ title: "Success", description: `Creator ${approved ? "approved" : "rejected"}` });
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("creators").update({ is_active: active }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCreators(creators.map((c) => (c.id === id ? { ...c, is_active: active } : c)));
      toast({ title: "Success", description: `Creator ${active ? "activated" : "deactivated"}` });
    }
  };

  const handleDeleteCreator = async (id: string) => {
    const { error } = await supabase.from("creators").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCreators(creators.filter((c) => c.id !== id));
      toast({ title: "Success", description: "Creator deleted" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: newCategory.name,
        description: newCategory.description || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setCategories([...categories, data]);
      setNewCategory({ name: "", description: "" });
      setCategoryDialogOpen(false);
      toast({ title: "Success", description: "Category added" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCategories(categories.filter((c) => c.id !== id));
      toast({ title: "Success", description: "Category deleted" });
    }
  };

  // Gallery handlers
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleGalleryCropComplete = async (croppedBlob: Blob) => {
    setUploadingGallery(true);
    setGalleryUploadProgress(0);

    try {
      // Upload to Cloudinary with progress
      const result = await uploadToCloudinary(
        croppedBlob, 
        "acia/gallery",
        (progress) => setGalleryUploadProgress(progress)
      );

      // Save to Supabase with Cloudinary URL
      const { data, error } = await supabase
        .from("gallery")
        .insert({
          image_url: result.secure_url,
          title: newGallery.title || null,
          description: newGallery.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      setGalleryItems([data, ...galleryItems]);
      setNewGallery({ title: "", description: "" });
      setCropperOpen(false);
      setSelectedImage(null);
      setGalleryDialogOpen(false);
      toast({ title: "Success", description: "Image added to gallery" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload image", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
      setGalleryUploadProgress(0);
    }
  };

  const handleToggleGalleryActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("gallery").update({ is_active: active }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGalleryItems(galleryItems.map((g) => (g.id === id ? { ...g, is_active: active } : g)));
      toast({ title: "Success", description: `Image ${active ? "shown" : "hidden"}` });
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGalleryItems(galleryItems.filter((g) => g.id !== id));
      toast({ title: "Success", description: "Image deleted" });
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

  const pendingCreators = creators.filter((c) => !c.is_approved);
  const approvedCreators = creators.filter((c) => c.is_approved);

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              {isSuperAdmin ? "Superadmin" : "Admin"} - Manage creators, categories & gallery
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-secondary/20">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Creators</p>
                  <p className="text-3xl font-bold">{creators.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedCreators.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <FolderOpen className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Image className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gallery Images</p>
                  <p className="text-3xl font-bold">{galleryItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCreators.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve new creator registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCreators.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending creators</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Alias</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Votes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCreators.map((creator) => (
                        <TableRow key={creator.id}>
                          <TableCell className="font-medium">{creator.full_name}</TableCell>
                          <TableCell>@{creator.alias}</TableCell>
                          <TableCell>{creator.email}</TableCell>
                          <TableCell>{creator.vote_count}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApprove(creator.id, true)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCreator(creator.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Creators</CardTitle>
                <CardDescription>Manage active creators</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedCreators.map((creator) => (
                      <TableRow key={creator.id}>
                        <TableCell className="font-medium">{creator.full_name}</TableCell>
                        <TableCell>@{creator.alias}</TableCell>
                        <TableCell>{creator.vote_count}</TableCell>
                        <TableCell>
                          <Badge variant={creator.is_active ? "default" : "secondary"}>
                            {creator.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(creator.id, !creator.is_active)}
                            >
                              {creator.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCreator(creator.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage award categories</CardDescription>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gold">
                      <Plus className="h-4 w-4 mr-2" /> Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="catName">Name</Label>
                        <Input
                          id="catName"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          placeholder="e.g., Best Music Video"
                        />
                      </div>
                      <div>
                        <Label htmlFor="catDesc">Description</Label>
                        <Input
                          id="catDesc"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                      <Button onClick={handleAddCategory} className="w-full btn-gold">
                        Add Category
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gallery</CardTitle>
                  <CardDescription>Manage event photos and images</CardDescription>
                </div>
                <Dialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-gold">
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Gallery Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="galleryTitle">Title (optional)</Label>
                        <Input
                          id="galleryTitle"
                          value={newGallery.title}
                          onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                          placeholder="e.g., Awards Night 2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="galleryDesc">Description (optional)</Label>
                        <Textarea
                          id="galleryDesc"
                          value={newGallery.description}
                          onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
                          placeholder="Brief description of the image"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="galleryFile">Select Image</Label>
                        <Input
                          id="galleryFile"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleGalleryFileSelect}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Image will open in cropper after selection
                        </p>
                      </div>
                    </div>
                  </DialogContent>

                  {/* Image Cropper Modal */}
                  <ImageCropperModal
                    open={cropperOpen}
                    onOpenChange={(open) => {
                      if (!uploadingGallery) {
                        setCropperOpen(open);
                        if (!open) setSelectedImage(null);
                      }
                    }}
                    imageSrc={selectedImage}
                    aspectRatio={16/9}
                    onCropComplete={handleGalleryCropComplete}
                    uploadProgress={galleryUploadProgress}
                    isUploading={uploadingGallery}
                  />
                </Dialog>
              </CardHeader>
              <CardContent>
                {galleryItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No gallery images yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`relative group rounded-lg overflow-hidden border ${
                          item.is_active ? "border-border" : "border-destructive/50 opacity-60"
                        }`}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title || "Gallery image"}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          {item.title && (
                            <p className="text-white text-sm font-medium text-center truncate w-full">
                              {item.title}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={item.is_active ? "secondary" : "default"}
                              onClick={() => handleToggleGalleryActive(item.id, !item.is_active)}
                            >
                              {item.is_active ? "Hide" : "Show"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteGalleryItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {!item.is_active && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="migration">
            <ImageMigrationTool />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
