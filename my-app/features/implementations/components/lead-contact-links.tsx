import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Lead contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{leadName}</p>
        {links.length ? (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a key={`${link.type}:${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="underline">
                {link.type}
              </a>
            ))}
          </div>
        ) : (
          <p>No public contact links shared by the lead.</p>
        )}
      </CardContent>
    </Card>
  );
}
