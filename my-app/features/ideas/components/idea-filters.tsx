import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
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
    <Card className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-xl shadow-sm">
      <CardContent className="p-5">
        <form className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="skill" className="text-xs font-semibold text-ink/80">Skill</Label>
            <Input 
              id="skill" 
              name="skill" 
              placeholder="Search by skill..." 
              defaultValue={searchParams.skill ?? ""} 
              className="h-9 border-border/70 text-sm focus-visible:ring-primary rounded-md bg-background"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="level" className="text-xs font-semibold text-ink/80">Level</Label>
            <Select name="level" defaultValue={searchParams.level ?? "ALL"}>
              <SelectTrigger id="level" className="h-9 border-border/70 text-sm focus:ring-primary rounded-md bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold text-ink/80">Status</Label>
            <Select name="status" defaultValue={searchParams.status ?? "ALL"}>
              <SelectTrigger id="status" className="h-9 border-border/70 text-sm focus:ring-primary rounded-md bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="IDEA">Idea</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="BUILT">Built</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="minScore" className="text-xs font-semibold text-ink/80">Min Score</Label>
            <Input 
              id="minScore" 
              name="minScore" 
              type="number" 
              min={0} 
              max={10} 
              step="0.1" 
              placeholder="0.0"
              defaultValue={searchParams.minScore ?? ""} 
              className="h-9 border-border/70 text-sm focus-visible:ring-primary rounded-md bg-background"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="sort" className="text-xs font-semibold text-ink/80">Sort By</Label>
            <Select name="sort" defaultValue={searchParams.sort ?? "recent"}>
              <SelectTrigger id="sort" className="h-9 border-border/70 text-sm focus:ring-primary rounded-md bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="score">Top Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:col-span-2 md:col-span-5 flex items-center gap-2.5 border-t border-border/50 pt-4 mt-1">
            <Button type="submit" size="sm" className="h-8 text-xs gap-1.5 rounded-md">
              <Filter className="h-3.5 w-3.5" />
              Apply Filters
            </Button>
            <Link 
              href="/ideas" 
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs gap-1.5 rounded-md hover:bg-muted" })}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
