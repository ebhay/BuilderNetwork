import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function IdeaFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <Card className="border border-border">
      <CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="skill">Skill</Label>
            <Input id="skill" name="skill" placeholder="Search by skill or keyword" defaultValue={searchParams.skill ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select name="level" defaultValue={searchParams.level ?? "ALL"}>
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={searchParams.status ?? "ALL"}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="IDEA">Idea</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="BUILT">Built</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minScore">Min score</Label>
            <Input id="minScore" name="minScore" type="number" min={0} max={10} step="0.1" defaultValue={searchParams.minScore ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort</Label>
            <Select name="sort" defaultValue={searchParams.sort ?? "recent"}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="score">Top score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-5 flex items-center gap-3 border-t border-border/70 pt-3">
            <Button type="submit">Apply filters</Button>
            <Link href="/ideas" className={buttonVariants({ variant: "outline" })}>
              Reset
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
