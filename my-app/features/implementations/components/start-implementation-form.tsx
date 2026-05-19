import { startImplementationAction } from "@/features/implementations/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StartImplementationForm({ ideaId }: { ideaId: string }) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Start building this idea</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={startImplementationAction} className="space-y-4">
          <input type="hidden" name="ideaId" value={ideaId} />
          <div className="space-y-2">
            <Label htmlFor="githubRepoUrl">GitHub repository URL</Label>
            <Input
              id="githubRepoUrl"
              name="githubRepoUrl"
              type="url"
              required
              placeholder="https://github.com/owner/repo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buildTitle">Build title (optional)</Label>
            <Input id="buildTitle" name="buildTitle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buildNote">Build note (optional)</Label>
            <Textarea id="buildNote" name="buildNote" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetCompletionTime">Target completion time (optional)</Label>
            <Input id="targetCompletionTime" name="targetCompletionTime" placeholder="e.g. 3 weeks" />
          </div>
          <Button type="submit">Start implementation</Button>
        </form>
      </CardContent>
    </Card>
  );
}
