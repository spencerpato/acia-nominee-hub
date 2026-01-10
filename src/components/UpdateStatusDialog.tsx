import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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

type Creator = Tables<"creators">;

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: Creator;
  onStatusUpdated: () => void;
}

type StatusAction = "activate" | "deactivate" | "withdraw" | "disqualify";

export const UpdateStatusDialog = ({
  open,
  onOpenChange,
  creator,
  onStatusUpdated,
}: UpdateStatusDialogProps) => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<StatusAction | "">("");
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!selectedAction) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      let updateData: Partial<Creator> = {};

      switch (selectedAction) {
        case "activate":
          updateData = { is_active: true, is_approved: true };
          break;
        case "deactivate":
          updateData = { is_active: false };
          break;
        case "withdraw":
          updateData = { is_approved: false, is_active: false };
          break;
        case "disqualify":
          updateData = { is_active: false, is_approved: false };
          break;
      }

      const { error } = await supabase
        .from("creators")
        .update(updateData)
        .eq("id", creator.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `${creator.full_name}'s status has been updated successfully.`,
      });

      onStatusUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getActionDescription = (action: StatusAction): string => {
    switch (action) {
      case "activate":
        return "Make this nominee active and visible on the platform";
      case "deactivate":
        return "Temporarily hide this nominee from public listings";
      case "withdraw":
        return "Process withdrawal - nominee forfeits payouts if before voting ends";
      case "disqualify":
        return "Permanently remove nominee due to policy violation";
    }
  };

  const isDangerousAction = selectedAction === "withdraw" || selectedAction === "disqualify";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status: {creator.full_name}</DialogTitle>
          <DialogDescription>
            Change the participation status of this nominee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="p-4 bg-muted rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Current Status:</span>
              </div>
              <div>
                <span className="font-medium">
                  {creator.is_approved ? (creator.is_active ? "Active" : "Inactive") : "Withdrawn/Pending"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Votes:</span>
              </div>
              <div>
                <span className="font-medium">{(creator.vote_count || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Select Action</Label>
            <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v as StatusAction)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">✅ Activate</SelectItem>
                <SelectItem value="deactivate">⏸️ Deactivate (Temporary)</SelectItem>
                <SelectItem value="withdraw">📤 Process Withdrawal</SelectItem>
                <SelectItem value="disqualify">🚫 Disqualify</SelectItem>
              </SelectContent>
            </Select>
            {selectedAction && (
              <p className="text-sm text-muted-foreground">
                {getActionDescription(selectedAction)}
              </p>
            )}
          </div>

          {/* Warning for dangerous actions */}
          {isDangerousAction && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {selectedAction === "disqualify" 
                  ? "This action will permanently remove the nominee and forfeit all their votes and earnings."
                  : "Processing withdrawal before voting ends will forfeit the nominee's payout eligibility as per Terms & Conditions."
                }
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
            onClick={handleUpdateStatus}
            disabled={!selectedAction || updating}
            variant={isDangerousAction ? "destructive" : "default"}
          >
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
