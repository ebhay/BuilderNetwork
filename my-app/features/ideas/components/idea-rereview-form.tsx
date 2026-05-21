"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/upload-field";
import { updateIdeaForRereviewAction } from "@/features/ideas/actions";

type Props = {
  idea: {
    id: string;
    title: string;
    description: string;
    screenshot_url: string | null;
    reference_links: unknown;
  };
};

export function IdeaRereviewForm({ idea }: Props) {
  const [editing, setEditing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(idea.screenshot_url ?? "");
  const [referenceLinks, setReferenceLinks] = useState<string[]>(
    Array.isArray(idea.reference_links) ? idea.reference_links.map(String) : [],
  );

  if (!editing) {
    return (
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          Edit before re-review
        </Button>
      </div>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Edit before publish and re-review</CardTitle>
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </CardHeader>
      <CardContent>
        <form action={updateIdeaForRereviewAction} className="space-y-4">
          <input type="hidden" name="ideaId" value={idea.id} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={idea.title} minLength={6} maxLength={140} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={idea.description}
              minLength={30}
              maxLength={6000}
              rows={8}
              required
            />
          </div>

          <UploadField
            id="screenshotUrl"
            kind="screenshot"
            label="Screenshot URL (optional)"
            value={screenshotUrl}
            onChange={setScreenshotUrl}
          />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Reference links (optional)</h3>
              <Button type="button" variant="outline" onClick={() => setReferenceLinks((prev) => [...prev, ""])}>
                Add link
              </Button>
            </div>
            <div className="space-y-2">
              {referenceLinks.map((link, index) => (
                <Input
                  key={`ref-${index}`}
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(event) =>
                    setReferenceLinks((prev) =>
                      prev.map((row, rowIndex) => (rowIndex === index ? event.target.value : row)),
                    )
                  }
                />
              ))}
            </div>
          </section>

          <input type="hidden" name="screenshotUrl" value={screenshotUrl} readOnly />
          <input
            type="hidden"
            name="referenceLinks"
            value={JSON.stringify(referenceLinks.filter((link) => link.trim().length > 0))}
            readOnly
          />

          <Button type="submit" variant="outline">Save changes and re-review</Button>
        </form>
      </CardContent>
    </Card>
  );
}
