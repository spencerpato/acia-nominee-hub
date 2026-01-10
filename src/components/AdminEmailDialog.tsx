import { useState } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  emailTemplates,
  EmailCategory,
  getTemplateById,
  calculateExpectedEarnings,
  formatEarnings,
} from "@/lib/emailTemplates";

type Creator = Tables<"creators">;

interface AdminEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: Creator;
}

export const AdminEmailDialog = ({
  open,
  onOpenChange,
  creator,
}: AdminEmailDialogProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | "">("");
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const voteCount = creator.vote_count || 0;
  const expectedEarnings = formatEarnings(calculateExpectedEarnings(voteCount));

  const handleCategoryChange = (value: EmailCategory) => {
    setSelectedCategory(value);
    const template = getTemplateById(value);
    if (template) {
      const html = template.generateContent({
        nomineeName: creator.full_name,
        voteCount,
        expectedEarnings,
      });
      setPreviewHtml(html);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select an email category",
        variant: "destructive",
      });
      return;
    }

    const template = getTemplateById(selectedCategory);
    if (!template) return;

    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("send-admin-email", {
        body: {
          creatorId: creator.id,
          recipientEmail: creator.email,
          recipientName: creator.full_name,
          category: selectedCategory,
          subject: template.subject,
          htmlContent: template.generateContent({
            nomineeName: creator.full_name,
            voteCount,
            expectedEarnings,
          }),
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Email Sent!",
        description: `Email successfully sent to ${creator.email}`,
      });

      onOpenChange(false);
      setSelectedCategory("");
      setPreviewHtml("");
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message || "An error occurred while sending the email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {creator.full_name}</DialogTitle>
          <DialogDescription>
            Select an email template and preview before sending
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recipient Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">To:</span>{" "}
              <span className="font-medium">{creator.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Votes:</span>{" "}
              <span className="font-medium">{voteCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">From:</span>{" "}
              <span className="font-medium">awardsacia@gmail.com</span>
            </div>
            <div>
              <span className="text-muted-foreground">Earnings:</span>{" "}
              <span className="font-medium text-green-600">{expectedEarnings}</span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Email Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select email template..." />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {previewHtml && (
            <div className="space-y-2">
              <Label>Email Preview</Label>
              <div className="border rounded-lg p-4 bg-card max-h-80 overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
                <div className="mt-4 pt-4 border-t text-muted-foreground text-sm">
                  <p>Regards,</p>
                  <p className="font-semibold">Africa Creators Impact Awards (ACIA)</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for policy templates */}
          {(selectedCategory === "policy_warning" || selectedCategory === "disqualification") && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a sensitive email template. Please ensure you have valid reasons before sending.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!selectedCategory || sending}
            className="btn-gold"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
