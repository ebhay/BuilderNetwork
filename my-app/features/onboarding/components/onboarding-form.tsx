"use client";

import { type FormEvent, useState } from "react";
import { AtSign, Check, CircleUserRound, Code2, Globe, Leaf, Link2, Rocket, Search, TrendingUp, User, X, Zap } from "lucide-react";
import { completeOnboarding } from "@/features/onboarding/actions";
import { Button } from "@/components/ui/button";
import { UploadField } from "@/components/upload-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_SUGGESTIONS } from "@/lib/constants";

type SkillRow = {
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
};

type SocialRow = {
  type: "GITHUB" | "LINKEDIN" | "DISCORD" | "TWITTER" | "PORTFOLIO" | "OTHER";
  url: string;
  isPublic: boolean;
};

const MIN_REQUIRED_SKILLS = 5;
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const DEFAULT_SKILL_OPTIONS = Object.values(SKILL_SUGGESTIONS).flat();

function normalizeSkillName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function OnboardingForm({ nextPath = "/ideas" }: { nextPath?: string }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [codingLevel, setCodingLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "EXPERT">("BEGINNER");
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [skillOptions, setSkillOptions] = useState<string[]>(DEFAULT_SKILL_OPTIONS);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialRow[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const filteredSkills = skills.filter((skill) => skill.name.trim().length > 0);
  const filteredLinks = socialLinks.filter((link) => link.url.trim().length > 0);
  const previewLinks = filteredLinks.slice(0, 4);
  const usernamePreview = username.trim() ? `@${username.trim()}` : "@your_username";
  const hasName = name.trim().length >= 2;
  const hasValidUsername = USERNAME_PATTERN.test(username.trim());
  const hasMinSkills = filteredSkills.length >= MIN_REQUIRED_SKILLS;
  const completionParts = [hasName, hasValidUsername, hasMinSkills];
  const completionPercent = Math.round((completionParts.filter(Boolean).length / completionParts.length) * 100);
  const canSubmit = hasName && hasValidUsername && hasMinSkills;
  const normalizedDraft = normalizeSkillName(skillDraft).toLowerCase();
  const filteredSkillOptions = skillOptions.filter((option) => option.toLowerCase().includes(normalizedDraft));

  function getBestSkillCandidate(preferredName?: string) {
    const raw = normalizeSkillName(preferredName ?? skillDraft);
    if (!raw) return "";
    const exact = skillOptions.find((option) => option.toLowerCase() === raw.toLowerCase());
    if (exact) return exact;
    const startsWithMatch = skillOptions.find((option) => option.toLowerCase().startsWith(raw.toLowerCase()));
    if (startsWithMatch) return startsWithMatch;
    return raw;
  }

  function addSkillFromDraft(preferredName?: string) {
    const name = getBestSkillCandidate(preferredName);
    if (!name) return;
    setSkills((prev) => {
      const existing = prev.find((row) => normalizeSkillName(row.name).toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev;
      }
      return [...prev, { name, level: "BEGINNER" }];
    });
    setSkillOptions((prev) =>
      prev.some((option) => option.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name],
    );
    setSkillDraft("");
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (canSubmit) return;
    event.preventDefault();
    if (!hasMinSkills) {
      setFormError(`Add at least ${MIN_REQUIRED_SKILLS} skills before submitting.`);
      return;
    }
    if (!hasName || !hasValidUsername) {
      setFormError("Fill all required fields before submitting.");
      return;
    }
    setFormError("Please complete required fields before submitting.");
  }

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      <aside className="h-full w-[200px] shrink-0 space-y-5 overflow-hidden">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <p className="text-xs font-semibold">Builder Network</p>
          </div>
          <h2 className="font-heading text-[1.7rem] leading-tight text-ink">Let&apos;s build your presence</h2>
          <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
            Add your skills and links so other builders can discover and collaborate with you.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-primary">Step 1 of 3</p>
            <p className="text-[2rem] font-semibold leading-none text-ink">{completionPercent}%</p>
            <p className="text-lg font-semibold leading-tight text-ink">complete</p>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="space-y-2.5 border-t border-border/70 pt-3">
            {[
              { step: 1, title: "Profile Info", subtitle: "Add your basic information", active: true },
              { step: 2, title: "Skills & Links", subtitle: "Showcase your expertise", active: false },
              { step: 3, title: "Review & Publish", subtitle: "Finish and go live", active: false },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-start gap-2.5 rounded-md px-2 py-2 ${
                  item.active ? "bg-accent/55" : "bg-transparent"
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    item.active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {item.step}
                </span>
                <div className="space-y-0.5">
                  <p className="text-[0.95rem] font-semibold leading-tight text-ink">{item.title}</p>
                  <p className="text-[0.82rem] leading-snug text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
            <Rocket className="h-5 w-5" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Profiles with skills and links get <span className="font-semibold text-primary">4x</span> more collaboration requests.
          </p>
        </div>
      </aside>

      <div className="min-h-0 w-[66%] overflow-y-auto pr-1">
        <Card className="bg-transparent shadow-none backdrop-blur-0 border-0 rounded-none">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="font-heading text-2xl">Basic Info</CardTitle>
              <p className="text-sm text-muted-foreground">
                This information appears on your public profile and helps teams find you faster.
              </p>
            </div>
            <Button type="submit" form="onboarding-form" className="h-10 px-6" disabled={!canSubmit}>
              Save & Continue
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-6 md:px-5">
          <form id="onboarding-form" action={completeOnboarding} className="space-y-8" onSubmit={handleSubmit}>
            <input type="hidden" name="nextPath" value={nextPath} readOnly />
            <input type="hidden" name="codingLevel" value={codingLevel} readOnly />
            <section className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)]">
                <UploadField
                  id="profileImageUrl"
                  kind="profile"
                  label="Profile picture"
                  value={profileImageUrl}
                  onChange={setProfileImageUrl}
                  variant="profileTop"
                />
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" name="name" required className="h-10 pl-9" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="username"
                          name="username"
                          required
                          minLength={3}
                          maxLength={30}
                          pattern="^[a-z0-9_]{3,30}$"
                          placeholder="your_username"
                          className="h-10 pl-9"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Used in your public URL: /u/{username || "your_username"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (optional)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      maxLength={500}
                      className="min-h-28"
                      placeholder="Tell other builders about yourself, your interests and what you're building..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <div className="flex items-center justify-end">
                      <p className="text-xs text-muted-foreground">{bio.length}/500</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Coding level</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {[
                    { key: "BEGINNER", label: "Beginner", copy: "I'm just getting started", icon: Leaf },
                    { key: "INTERMEDIATE", label: "Intermediate", copy: "I have some experience", icon: TrendingUp },
                    { key: "EXPERT", label: "Advanced", copy: "I build complex things", icon: Rocket },
                  ].map((level) => (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => setCodingLevel(level.key as SkillRow["level"])}
                      className={`rounded-md border p-3 text-left ${codingLevel === level.key ? "border-primary bg-accent" : "border-border bg-background/70"}`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <level.icon className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-ink">{level.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{level.copy}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <h3 className="font-heading text-lg text-ink">Skills</h3>
                </div>
                <p className="text-sm text-muted-foreground">Search or add skills (Press Enter to add)</p>
              </div>
              <div className="space-y-3 rounded-md border border-border bg-background/60 p-3">
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Type a skill..."
                      className="h-10 pl-9"
                      value={skillDraft}
                      onChange={(event) => setSkillDraft(event.target.value)}
                      onFocus={() => setShowSkillSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 120)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const topSuggestion = filteredSkillOptions[0];
                          addSkillFromDraft(topSuggestion || undefined);
                        }
                      }}
                    />
                    {showSkillSuggestions && filteredSkillOptions.length > 0 ? (
                      <div className="absolute top-[calc(100%+6px)] z-20 max-h-44 w-full overflow-y-auto rounded-md border border-border bg-card p-1 shadow-sm">
                        {filteredSkillOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm text-ink hover:bg-accent"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSkillDraft(option);
                              setShowSkillSuggestions(false);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button type="button" variant="ghost" className="h-10 text-primary" onClick={() => addSkillFromDraft()}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((skill, index) => (
                    <div key={`${skill.name}-${index}`} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
                      <span className="font-medium text-ink">{skill.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSkills((prev) =>
                            prev.filter((row) => normalizeSkillName(row.name).toLowerCase() !== normalizeSkillName(skill.name).toLowerCase()),
                          )
                        }
                        className="text-muted-foreground hover:text-ink"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum required skills: {MIN_REQUIRED_SKILLS}. Added: {filteredSkills.length}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-heading text-lg text-ink">Links</h3>
                <p className="text-sm text-muted-foreground">Add links to your profiles and portfolio.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { type: "GITHUB" as const, label: "GitHub", placeholder: "github.com/username", icon: Link2 },
                  { type: "LINKEDIN" as const, label: "LinkedIn", placeholder: "linkedin.com/in/username", icon: CircleUserRound },
                  { type: "TWITTER" as const, label: "X (Twitter)", placeholder: "x.com/username", icon: X },
                  { type: "PORTFOLIO" as const, label: "Portfolio", placeholder: "yourportfolio.dev", icon: Globe },
                ].map((preset) => {
                  const current = socialLinks.find((row) => row.type === preset.type);
                  const Icon = preset.icon;
                  return (
                    <div key={preset.type} className="flex h-11 items-center gap-2 rounded-md border border-border bg-background/70 px-3">
                      <Icon className="h-4 w-4 shrink-0 text-ink" />
                      <p className="w-24 shrink-0 text-sm font-medium text-ink">{preset.label}</p>
                      <Input
                        type="url"
                        placeholder={preset.placeholder}
                        className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                        value={current?.url ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSocialLinks((prev) => {
                            const existingIndex = prev.findIndex((row) => row.type === preset.type);
                            if (existingIndex === -1) {
                              return [...prev, { type: preset.type, url: value, isPublic: true }];
                            }
                            return prev.map((row, index) =>
                              index === existingIndex ? { ...row, url: value, isPublic: true } : row,
                            );
                          });
                        }}
                      />
                      <Check className={`h-4 w-4 shrink-0 ${current?.url?.trim() ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                    </div>
                  );
                })}
              </div>
            </section>

            <input type="hidden" name="skills" value={JSON.stringify(filteredSkills)} readOnly />
            <input type="hidden" name="profileImageUrl" value={profileImageUrl} readOnly />
            <input type="hidden" name="socialLinks" value={JSON.stringify(filteredLinks)} readOnly />
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </form>
        </CardContent>
      </Card>
      </div>

      <aside className="h-full w-[280px] shrink-0 space-y-4 overflow-hidden">
        <Card className="border-0 bg-transparent shadow-none rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Preview</CardTitle>
            <p className="text-sm text-muted-foreground">This is how builders will see your profile.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div
                className="h-24 border-b border-border/60 bg-accent/35 bg-[radial-gradient(hsl(var(--primary))_1.1px,transparent_1.1px)] bg-[size:10px_10px]"
              />
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-accent text-lg font-semibold text-primary">
                      {profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImageUrl} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        "⚡"
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-tight text-ink">{name.trim() || "Your Name"}</p>
                    <p className="text-xs font-medium text-primary">{usernamePreview}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {bio.trim() || "I'm a beginner builder exploring new technologies and building cool projects."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.slice(0, 3).map((skill) => (
                    <span key={skill.name} className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-primary">
                      {skill.name}
                    </span>
                  ))}
                  {filteredSkills.length > 3 ? (
                    <span className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      +{filteredSkills.length - 3}
                    </span>
                  ) : null}
                </div>
                <div className="border-t border-border/70 pt-3" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  {previewLinks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No links added yet.</p>
                  ) : null}
                  {previewLinks.map((link) => (
                    <span key={`${link.type}-${link.url}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                      {link.type === "GITHUB" ? <Link2 className="h-4 w-4" /> : null}
                      {link.type === "LINKEDIN" ? <CircleUserRound className="h-4 w-4" /> : null}
                      {link.type === "TWITTER" ? <X className="h-4 w-4" /> : null}
                      {link.type === "PORTFOLIO" ? <Globe className="h-4 w-4" /> : null}
                      {link.type === "DISCORD" ? <CircleUserRound className="h-4 w-4" /> : null}
                      {link.type === "OTHER" ? <Globe className="h-4 w-4" /> : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
