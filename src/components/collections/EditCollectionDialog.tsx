"use client";

import { useState } from "react";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditCollectionDialogProps {
  collection: { id: string; name: string; description: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

interface FormState {
  name: string;
  description: string;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onUpdated,
}: EditCollectionDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: collection.name,
    description: collection.description ?? "",
  });

  const canSave = form.name.trim().length > 0;

  function handleOpenChange(next: boolean) {
    if (next) {
      setForm({ name: collection.name, description: collection.description ?? "" });
    }
    onOpenChange(next);
  }

  async function handleSave() {
    setSaving(true);

    const response = await updateCollection(collection.id, {
      name: form.name.trim(),
      description: form.description.trim() || null,
    });

    setSaving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    toast.success("Collection updated");
    onOpenChange(false);
    onUpdated();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>Update this collection&apos;s name and description.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-collection-name">Name</Label>
            <Input
              id="edit-collection-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-collection-description">Description</Label>
            <Textarea
              id="edit-collection-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
