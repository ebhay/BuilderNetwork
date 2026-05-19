"use client";

import { useState } from "react";
import { submitIdeaAction } from "@/features/ideas/actions";
import { Button } from "@/components/ui/button";
import { UploadField } from "@/components/upload-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function IdeaSubmitForm() {
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Submit an idea</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submitIdeaAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required minLength={6} maxLength={140} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required minLength={30} rows={8} />
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
              <h3 className="font-heading text-lg">Reference links (optional)</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReferenceLinks((prev) => [...prev, ""])}
              >
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
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? event.target.value : row,
                      ),
                    )
                  }
                />
              ))}
            </div>
          </section>
          <input
            type="hidden"
            name="referenceLinks"
            value={JSON.stringify(referenceLinks.filter((link) => link.trim().length > 0))}
            readOnly
          />
          <input type="hidden" name="screenshotUrl" value={screenshotUrl} readOnly />
          <Button type="submit">Submit for AI review</Button>
        </form>
      </CardContent>
    </Card>
  );
}
