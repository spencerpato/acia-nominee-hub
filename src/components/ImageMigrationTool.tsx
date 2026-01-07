import { useState } from "react";
import { Loader2, RefreshCw, CheckCircle, XCircle, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { migrateImageToCloudinary, isCloudinaryUrl } from "@/lib/cloudinary";

interface MigrationResult {
  id: string;
  type: "creator" | "gallery";
  name: string;
  success: boolean;
  newUrl?: string;
  error?: string;
}

export function ImageMigrationTool() {
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [stats, setStats] = useState({ total: 0, migrated: 0, skipped: 0, failed: 0 });

  const runMigration = async () => {
    setMigrating(true);
    setProgress(0);
    setResults([]);
    setStats({ total: 0, migrated: 0, skipped: 0, failed: 0 });

    const allResults: MigrationResult[] = [];
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    try {
      // Fetch all creators with profile photos
      const { data: creators, error: creatorsError } = await supabase
        .from("creators")
        .select("id, full_name, profile_photo_url")
        .not("profile_photo_url", "is", null);

      if (creatorsError) throw creatorsError;

      // Fetch all gallery items
      const { data: galleryItems, error: galleryError } = await supabase
        .from("gallery")
        .select("id, title, image_url");

      if (galleryError) throw galleryError;

      const creatorsToMigrate = creators?.filter(c => c.profile_photo_url && !isCloudinaryUrl(c.profile_photo_url)) || [];
      const galleryToMigrate = galleryItems?.filter(g => g.image_url && !isCloudinaryUrl(g.image_url)) || [];
      
      const total = creatorsToMigrate.length + galleryToMigrate.length;
      const alreadyMigrated = (creators?.length || 0) - creatorsToMigrate.length + (galleryItems?.length || 0) - galleryToMigrate.length;
      
      setStats(prev => ({ ...prev, total, skipped: alreadyMigrated }));
      skipped = alreadyMigrated;

      if (total === 0) {
        toast({ title: "No Migration Needed", description: `All ${alreadyMigrated} images are already on Cloudinary.` });
        setMigrating(false);
        return;
      }

      let processed = 0;

      // Migrate creator profile photos
      for (const creator of creatorsToMigrate) {
        try {
          const result = await migrateImageToCloudinary(
            creator.profile_photo_url!,
            "acia/profile-photos"
          );

          await supabase
            .from("creators")
            .update({ profile_photo_url: result.secure_url })
            .eq("id", creator.id);

          allResults.push({
            id: creator.id,
            type: "creator",
            name: creator.full_name,
            success: true,
            newUrl: result.secure_url,
          });
          migrated++;
        } catch (err: any) {
          allResults.push({
            id: creator.id,
            type: "creator",
            name: creator.full_name,
            success: false,
            error: err.message,
          });
          failed++;
        }

        processed++;
        setProgress((processed / total) * 100);
        setResults([...allResults]);
        setStats({ total, migrated, skipped, failed });
      }

      // Migrate gallery images
      for (const item of galleryToMigrate) {
        try {
          const result = await migrateImageToCloudinary(
            item.image_url,
            "acia/gallery"
          );

          await supabase
            .from("gallery")
            .update({ image_url: result.secure_url })
            .eq("id", item.id);

          allResults.push({
            id: item.id,
            type: "gallery",
            name: item.title || "Untitled",
            success: true,
            newUrl: result.secure_url,
          });
          migrated++;
        } catch (err: any) {
          allResults.push({
            id: item.id,
            type: "gallery",
            name: item.title || "Untitled",
            success: false,
            error: err.message,
          });
          failed++;
        }

        processed++;
        setProgress((processed / total) * 100);
        setResults([...allResults]);
        setStats({ total, migrated, skipped, failed });
      }

      toast({
        title: "Migration Complete",
        description: `Migrated ${migrated} images. ${failed} failed.`,
      });
    } catch (err: any) {
      toast({
        title: "Migration Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Migration Tool
            </CardTitle>
            <CardDescription>
              Migrate existing images from external URLs to Cloudinary CDN
            </CardDescription>
          </div>
          <Button onClick={runMigration} disabled={migrating} className="btn-gold">
            {migrating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {(stats.total > 0 || stats.skipped > 0) && (
          <div className="flex gap-4 flex-wrap">
            <Badge variant="outline" className="text-muted-foreground">
              Total: {stats.total}
            </Badge>
            <Badge variant="default" className="bg-green-500">
              Migrated: {stats.migrated}
            </Badge>
            <Badge variant="secondary">
              Already on Cloudinary: {stats.skipped}
            </Badge>
            {stats.failed > 0 && (
              <Badge variant="destructive">
                Failed: {stats.failed}
              </Badge>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between text-sm py-1 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium">{result.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {result.type}
                  </Badge>
                </div>
                {result.error && (
                  <span className="text-xs text-destructive">{result.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
