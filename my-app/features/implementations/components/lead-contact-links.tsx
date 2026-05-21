import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

type LeadContactLink = {
  type: string;
  url: string;
};

export function LeadContactLinks({
  leadName,
  links,
}: {
  leadName: string;
  links: LeadContactLink[];
}) {
  return (
    <Card className="border border-border bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-xl">Lead contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Contact <span className="font-medium text-ink">{leadName}</span> through public links only.
        </p>
        {links.length ? (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={`${link.type}:${link.url}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
              >
                {link.type}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-muted-foreground">
            No public contact links shared by the lead.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
