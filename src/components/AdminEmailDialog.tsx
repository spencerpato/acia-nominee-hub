import { useState } from "react";
import { Mail, AlertCircle, ExternalLink } from "lucide-react";
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

const getVotingLink = (alias: string): string => {
  return `${window.location.origin}/nominee/${alias}`;
};

export const AdminEmailDialog = ({
  open,
  onOpenChange,
  creator,
}: AdminEmailDialogProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<EmailCategory | "">("");
  const [previewText, setPreviewText] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const voteCount = creator.vote_count || 0;
  const expectedEarnings = formatEarnings(calculateExpectedEarnings(voteCount));
  const votingLink = getVotingLink(creator.alias);

  const handleCategoryChange = (value: EmailCategory) => {
    setSelectedCategory(value);
    const template = getTemplateById(value);
    if (template) {
      const content = template.generateContent({
        nomineeName: creator.full_name,
        voteCount,
        expectedEarnings,
        votingLink,
        creatorAlias: creator.alias,
      });
      setPreviewText(content);
      setSubject(template.subject);
    }
  };

  const handleOpenGmail = () => {
    if (!selectedCategory || !previewText) {
      toast({
        title: "Error",
        description: "Please select an email category first",
        variant: "destructive",
      });
      return;
    }

    // Construct Gmail compose URL
    const gmailUrl = new URL("https://mail.google.com/mail/?view=cm&fs=1");
    gmailUrl.searchParams.set("to", creator.email);
    gmailUrl.searchParams.set("su", subject);
    gmailUrl.searchParams.set("body", previewText);

    // Open Gmail in a new tab
    window.open(gmailUrl.toString(), "_blank");

    toast({
      title: "Gmail Opened",
      description: "The email has been prepared in Gmail. Please review and send.",
    });

    onOpenChange(false);
    setSelectedCategory("");
    setPreviewText("");
    setSubject("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {creator.full_name}</DialogTitle>
          <DialogDescription>
            Select an email template, preview it, then open in Gmail to send
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
              <span className="text-muted-foreground">Voting Link:</span>{" "}
              <a 
                href={votingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline text-xs break-all"
              >
                {votingLink}
              </a>
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
          {previewText && (
            <div className="space-y-2">
              <Label>Email Preview</Label>
              <div className="border rounded-lg p-4 bg-card max-h-80 overflow-y-auto">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Subject: {subject}
                </div>
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {previewText}
                </pre>
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

          {/* Info about Gmail */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Clicking "Open in Gmail" will open a new Gmail compose window with the email pre-filled. 
              Make sure you're logged into awardsacia@gmail.com.
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleOpenGmail}
            disabled={!selectedCategory}
            className="btn-gold"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Gmail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
