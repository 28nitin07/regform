"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Form {
  _id: string;
  title: string;
  status: string;
  fields?: Record<string, unknown>;
  owner?: {
    name: string;
    email: string;
    universityName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  form: Form;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditFormDialog({ form, onClose, onUpdate }: Props) {
  const [status, setStatus] = useState(form.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/forms/${form._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to update form");
      }
    } catch (error) {
      console.error("Error updating form:", error);
      alert("Failed to update form");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") {
      if (value instanceof Date) return value.toLocaleDateString();
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderFields = (fields: Record<string, unknown>) => {
    return Object.entries(fields).map(([key, value]) => {
      if (key === "playerFields" && Array.isArray(value)) {
        return (
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-sm dark:text-gray-300">Players ({value.length})</h4>
            {value.map((player, idx) => (
              <div key={idx} className="ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded space-y-1">
                <p className="font-medium text-sm dark:text-gray-300">Player {idx + 1}</p>
                {Object.entries(player as Record<string, unknown>).map(
                  ([pKey, pValue]) => (
                    <div key={pKey} className="text-sm dark:text-gray-400">
                      <span className="font-medium dark:text-gray-300">{pKey}:</span>{" "}
                      {renderFieldValue(pValue)}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        );
      } else if (key === "coachFields" && typeof value === "object") {
        return (
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-sm dark:text-gray-300">Coach Details</h4>
            <div className="ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded space-y-1">
              {Object.entries(value as Record<string, unknown>).map(
                ([cKey, cValue]) => (
                  <div key={cKey} className="text-sm dark:text-gray-400">
                    <span className="font-medium dark:text-gray-300">{cKey}:</span>{" "}
                    {renderFieldValue(cValue)}
                  </div>
                )
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div key={key} className="space-y-1">
            <Label className="text-sm font-medium dark:text-gray-300">{key}</Label>
            <p className="text-sm text-gray-700 dark:text-gray-400">{renderFieldValue(value)}</p>
          </div>
        );
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Form Details - {form.title}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            View and manage form submission
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="dark:bg-gray-700">
            <TabsTrigger value="details">Form Details</TabsTrigger>
            <TabsTrigger value="owner">Owner Info</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600" className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="draft" className="dark:text-gray-300 dark:hover:bg-gray-600">Draft</SelectItem>
                    <SelectItem value="submitted" className="dark:text-gray-300 dark:hover:bg-gray-600">Submitted</SelectItem>
                    <SelectItem value="confirmed" className="dark:text-gray-300 dark:hover:bg-gray-600">Confirmed</SelectItem>
                    <SelectItem value="rejected" className="dark:text-gray-300 dark:hover:bg-gray-600">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.fields && (
                <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold dark:text-white">Form Fields</h3>
                  <div className="space-y-3">
                    {renderFields(form.fields)}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="owner" className="space-y-4">
            {form.owner ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium dark:text-gray-300">Name</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{form.owner.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium dark:text-gray-300">Email</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{form.owner.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium dark:text-gray-300">University</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    {form.owner.universityName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No owner information available</p>
            )}

            <div className="space-y-3 border-t dark:border-gray-700 pt-4">
              <div>
                <Label className="text-sm font-medium dark:text-gray-300">Created At</Label>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium dark:text-gray-300">Updated At</Label>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {form.updatedAt
                    ? new Date(form.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
