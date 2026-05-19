# PRD: AI-Powered Project Idea & Builder Collaboration Platform

## 1. Product Summary

We are building a free AI-powered platform for builders to discover project ideas, start building them, and optionally collaborate with other people. The main belief behind the product is simple: many people have original project ideas but never execute them because they lack technical skill, confidence, time, or teammates. At the same time, many developers, designers, and AI builders want meaningful projects to build but do not know what to work on. This platform connects both sides by making ideas public, searchable, AI-reviewed, and easy to build from.

The platform is not trying to create strict project ownership. If someone posts an idea, others should be able to use it, build it, improve it, or form a team around it. A single idea can have multiple independent builders or teams working on separate implementations. The goal is not to protect ideas behind ownership barriers; the goal is to increase execution.

The MVP should stay lightweight. It should not become Jira, Trello, or a heavy project management tool. Instead, it should focus on four core actions: submit an idea, discover ideas, start building with a GitHub repo link, and mark the build complete with a deployed link.

## 2. Target Users

The platform is for all builders, including beginner developers, intermediate developers, expert engineers, AI builders, designers, students, indie hackers, and startup-minded people. The product should not be limited to only students or only founders. Anyone who wants to find project ideas, build portfolio projects, collaborate, or turn ideas into real products should be able to use it.

## 3. Core Product Goals

The first version should primarily focus on discovering good project ideas. Collaboration should exist, but it should not be forced. A user may browse ideas and build alone, or they may contact other builders and collaborate.

The main MVP goals are:

1. Let users submit project ideas easily.
2. Use AI to review idea quality and suggest improvements without rewriting the idea.
3. Let users discover ideas using filters like skills, difficulty level, and status.
4. Allow multiple builders or teams to build the same idea independently.
5. Let builders attach a GitHub repository link when they start building.
6. Let builders attach a deployed link when they finish building.
7. Provide profile pages showing skills, social links, ideas, and builds.
8. Keep the product free for the MVP.

## 4. Non-Goals for MVP

The MVP should not include heavy project management, task boards, sprint planning, complex ownership rules, paid plans, escrow, legal agreements, private team chat, or strict approval workflows. These can be considered later, but they are not necessary to validate the product.

The platform should also avoid over-relying on AI-generated rewritten content. AI should review, score, classify, and suggest improvements, but the original human idea should remain human-written.

## 5. Product Philosophy

The product should feel like a builder network, not a corporate management tool. Users should be able to move fast: see an idea, start building, paste a GitHub repo link, invite friends, and later submit a deployed link.

Ideas should be treated as open opportunities. The person who posted the idea gets attribution, but not exclusive ownership. Builders who attach repo links become implementation leads for their own build. Other users can contact the lead through selected social links and request to join that specific implementation.

To avoid conflict around idea usage, every implementation should show credit to the original idea giver by default. When a lead submits a GitHub repo or deployed project, the build page should display “Idea by [user]” and may allow the lead to add an optional credit note. This solves the attribution problem without creating strict ownership barriers.

## 6. Information Architecture

The MVP will include these main pages:

1. Landing Page
2. Login / Signup Page
3. First-Time Onboarding Page
4. Home / Idea Feed Page
5. Submit Idea Page
6. Idea Detail Page
7. Build / Implementation Detail Page
8. User Profile Page
9. Dashboard Page

## 7. Page Requirements

### 7.1 Landing Page

The landing page should explain the product quickly and clearly.

Primary headline idea:

“Find ideas. Build with others. Ship real projects.”

Subheadline:

“An AI-reviewed project idea platform where builders can discover ideas, start implementations, connect with teammates, and showcase launched products.”

Core sections:

- Hero section with CTA buttons: Explore Ideas and Submit an Idea.
- How it works: Submit idea → AI reviews → Builders start → Repo added → Deploy link submitted.
- AI review pipeline explanation.
- Multi-builder support explanation.
- Featured ideas section.
- Featured built projects section.
- CTA section at the bottom.

### 7.2 Login / Signup Page

Authentication options:

- Google Auth
- Email/password signup
- Email/password login

After the first successful signup, the user should be redirected to onboarding before entering the main app.

### 7.3 First-Time Onboarding Page

The onboarding page collects the minimum information needed to match users with ideas and collaborators.

Required fields:

- Name
- Skills
- Level for each skill: Beginner, Intermediate, Expert
- Overall coding level: Beginner, Intermediate, Expert

Optional fields:

- Profile picture
- Bio
- GitHub link
- LinkedIn link
- Discord link
- Twitter/X link
- Portfolio link
- Other contact link

Important behavior:

The user should choose which social links are visible publicly. Contact visibility should be controlled by the user.

### 7.4 Home / Idea Feed Page

The home page is the main discovery feed. It should show many ideas as cards.

Each idea card should show:

- Title
- Short description
- AI quality score
- Difficulty level: Beginner, Intermediate, Expert
- Tags
- AI-generated required skills
- Status: Idea, In Progress, Built
- Number of active implementations
- Number of completed builds
- Posted by
- View details button
- Start building button

Filters:

- Skill required
- Project level
- Status: Idea, In Progress, Built
- Quality score range
- Recently added
- Trending
- Beginner-friendly

Primary action:

- Submit an Idea

### 7.5 Submit Idea Page

Users submit their own idea manually. AI must not rewrite the idea into a polished verbose version. AI only reviews, scores, classifies, and gives suggestions.

User input fields:

- Title
- Description
- Optional screenshot
- Optional reference links

Do not ask for target users in MVP. Do not require users to manually add required skills. The AI should infer broad required skill categories, tags, and project level from the title and description. Required skills should stay broad and builder-friendly, such as Frontend, Backend, Database, AI, DevOps, Docker, UI/UX, Mobile, Browser Extension, API Integration, or Automation. Avoid overly specific labels like “Java backend” or “Python backend” unless the idea clearly requires that exact technology.

After submission, the idea goes through the AI review pipeline.

### 7.6 AI Review Result Page / Modal

After AI review, show the user:

- Quality score out of 10
- Project level: Beginner, Intermediate, Expert
- Required skills
- Tags
- Similar existing alternatives in the market
- Worthiness notes
- Feasibility notes
- Brutal but useful feedback
- Suggestions to improve the idea

Tone rule:

The AI should be direct, realistic, and quality-focused, but not insulting. “Brutal” here means honest and practical, not rude.

For example, the AI can say:

“This idea is useful, but it currently sounds similar to existing tools. To make it stronger, explain what will make your version different, such as faster workflow, lower cost, Indian-market focus, better UI, or a specific niche.”

AI should not rewrite the idea. It can only suggest improvements. Suggestions should stay human-focused and practical, such as pointing out similar alternatives, asking how the user plans to differentiate, or recommending one missing point that would make the idea clearer.

### 7.7 Quality Gate Behavior

Scores:

- 0–5.9: Needs Revision
- 6.0–7.4: Good
- 7.5–8.9: Strong
- 9.0–10: Excellent

If score is below 6, the idea should be saved as Draft / Needs Revision by default. The user can edit and resubmit after reading the suggestions.

Because the platform is open, the user may still publish the idea manually after seeing the warning. This should be treated as “Republish with Refinement”: the idea can go public, but it should carry a “Needs refinement” label and should not be promoted in trending or high-quality recommendation sections until it is improved and reviewed again.

If score is 6 or above, the idea is publishable and can appear normally in the public feed.

### 7.8 Idea Detail Page

The idea detail page should show:

- Full title
- Full description
- Screenshot if available
- Posted by user
- AI score
- AI review summary
- Required skills
- Tags
- Difficulty level
- Similar alternatives
- Suggestions
- All active implementations
- All built implementations
- Start building button

The page should make it clear that multiple people can build the same idea.

### 7.9 Build / Implementation Detail Page

When a user starts building an idea, they create an implementation under that idea by submitting a GitHub repo link.

Fields:

- GitHub repo link
- Build title, optional
- Short build note, optional
- Target completion time
- Lead builder
- Added teammates
- Status: In Progress or Built
- Deployed link, once completed

A build lead is the user who submitted the GitHub repo link. This does not make them the owner of the original idea. They are only the lead of that implementation.

Users can invite friends by sharing a link. Friends can join that implementation after signing in.

Other users can see the lead’s visible social links and contact them. If they want to join the implementation, a request goes to the lead.

### 7.10 Profile Page

A user profile should feel similar to a social profile.

Profile fields:

- Profile picture
- Name
- Bio
- Overall coding level
- Skills with levels
- Public social links selected by the user
- Ideas posted
- Implementations started
- Implementations joined
- Built projects

Profile tabs:

- Ideas
- Building
- Built
- Saved

### 7.11 Dashboard Page

The dashboard is the user’s control center.

Recommended dashboard sections:

1. My Ideas
   - Ideas submitted by the user
   - AI score
   - Draft / published status
   - Number of implementations started from the idea
   - Edit idea button

2. My Builds
   - Ideas the user started building
   - GitHub repo link
   - Target completion time
   - Status: In Progress or Built
   - Add deployed link button

3. Joined Builds
   - Implementations where the user is a teammate
   - Lead builder
   - Repo link
   - Deployed link if available

4. Join Requests
   - Requests sent to leads
   - Requests received if the user is a build lead
   - Accept / reject buttons

5. Drafts
   - Ideas with score below 6 or manually saved drafts
   - AI feedback
   - Edit and resubmit button

The dashboard should avoid complex tracking. No task board is required in MVP.

## 8. Core User Flows

### 8.1 New User Flow

1. User lands on landing page.
2. User signs up with Google or email/password.
3. User completes onboarding.
4. User enters home feed.
5. User browses ideas or submits a new idea.

### 8.2 Submit Idea Flow

1. User clicks Submit an Idea.
2. User enters title, description, optional screenshot, and optional references.
3. System sends the idea to the AI review pipeline.
4. AI returns score, feedback, tags, required skills, project level, and alternatives.
5. User reviews AI feedback.
6. If score is 6+, user can publish normally.
7. If score is below 6, idea is saved as Draft / Needs Revision by default, but user can still manually publish with reduced visibility.

### 8.3 Start Building Flow

1. User opens an idea.
2. User clicks Start Building.
3. User submits GitHub repo link and target completion time.
4. System creates a new implementation under that idea.
5. Idea status changes to In Progress if at least one active implementation exists.
6. User becomes lead builder of that implementation.

### 8.4 Join Existing Build Flow

1. User opens an idea.
2. User sees active implementations.
3. User checks lead builder profile and visible contact links.
4. User can contact the lead externally or send a join request.
5. Lead accepts or rejects the join request.
6. Accepted user becomes a teammate on that implementation.

### 8.5 Mark Built Flow

1. Build lead opens dashboard.
2. Lead adds deployed link.
3. Implementation status becomes Built.
4. Idea status becomes Built if at least one implementation has a deployed link.
5. Built project appears on profile and idea detail page.

## 9. Project Status Model

MVP statuses should be only:

1. Idea
2. In Progress
3. Built

Status rules:

- Idea: No implementation has been started yet.
- In Progress: At least one implementation has a GitHub repo link.
- Built: At least one implementation has a deployed link.

Do not add Abandoned in MVP. Many people will start and not finish, but the platform should handle that naturally by allowing multiple implementations.

## 10. AI Review Pipeline

The AI review pipeline should generate structured JSON.

AI model preference:

Use a free and reliable LLM provider. The system should support NVIDIA NIM first if available, because it exposes an OpenAI-compatible API. The current preferred model is `deepseek-ai/deepseek-v4-pro`, but the codebase should keep model selection configurable so it can later switch to another free/reliable model.

NVIDIA NIM currently provides enough throughput for the MVP target, such as around 40 requests per minute depending on account/model limits. If review is slow or rate-limited, the product should save the idea as a pending draft and retry, rather than blocking the user or losing their input.

Example provider config:

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});
```

Expected AI output:

```json
{
  "qualityScore": 7.2,
  "qualityBand": "Good",
  "publishRecommendation": "publishable",
  "projectLevel": "Intermediate",
  "requiredSkills": ["Frontend", "Backend", "Database", "AI", "API Integration"],
  "tags": ["AI", "Web App", "Productivity", "SaaS"],
  "marketAlternatives": [
    {
      "name": "Alternative Product A",
      "difference": "Solves a similar problem but focuses on enterprise users."
    }
  ],
  "worthinessReview": "The idea has practical value, but needs a sharper differentiation point.",
  "feasibilityReview": "This is feasible as a web app MVP using existing AI APIs and a standard database.",
  "brutalFeedback": "Right now the idea is useful but not clearly unique. The user should explain why someone would choose this over existing tools.",
  "suggestions": [
    "Add one point explaining how this will be different from current alternatives.",
    "Narrow the first version to one specific user group or workflow.",
    "Define what a small MVP would include."
  ]
}
```

AI rules:

- Do not rewrite the idea.
- Do not add fake market facts.
- Do not hallucinate exact competitor statistics.
- If alternatives are uncertain, say “similar category” instead of claiming exact competition.
- Be direct but not insulting.
- Generate tags and broad required skill categories automatically.
- Avoid overly specific required skills unless the technology is clearly necessary.
- Classify only into Beginner, Intermediate, or Expert.

## 11. Data Model Draft

### User

```txt
User
- id
- name
- email
- passwordHash
- authProvider
- profileImageUrl
- bio
- codingLevel: Beginner | Intermediate | Expert
- skills: Skill[]
- socialLinks: SocialLink[]
- createdAt
- updatedAt
```

### Skill

```txt
Skill
- id
- userId
- name
- level: Beginner | Intermediate | Expert
```

### SocialLink

```txt
SocialLink
- id
- userId
- type: GitHub | LinkedIn | Discord | Twitter | Portfolio | Other
- url
- isPublic
```

### Idea

```txt
Idea
- id
- title
- description
- screenshotUrl
- referenceLinks[]
- postedByUserId
- status: Idea | In Progress | Built
- visibility: Draft | Published | Needs Refinement
- qualityScore
- qualityBand
- aiFeedbackJson
- requiredSkills[]
- tags[]
- projectLevel: Beginner | Intermediate | Expert
- createdAt
- updatedAt
```

### Implementation

```txt
Implementation
- id
- ideaId
- leadUserId
- buildTitle
- buildNote
- githubRepoUrl
- deployedUrl
- targetCompletionTime
- creditToIdeaGiver: true by default
- creditNote
- status: In Progress | Built
- createdAt
- updatedAt
```

### ImplementationMember

```txt
ImplementationMember
- id
- implementationId
- userId
- role: Lead | Teammate
- joinedAt
```

### JoinRequest

```txt
JoinRequest
- id
- implementationId
- requesterUserId
- message
- status: Pending | Accepted | Rejected
- createdAt
- updatedAt
```

### SavedIdea

```txt
SavedIdea
- id
- ideaId
- userId
- createdAt
```

## 12. Permissions & Contact Rules

- Any signed-in user can submit an idea.
- Any signed-in user can start an implementation for any published idea.
- Multiple implementations can exist under the same idea.
- The idea poster gets attribution but does not own or control all builds.
- Every implementation should show credit to the original idea giver by default.
- The implementation lead controls their own build page.
- Only the build lead can accept or reject join requests for that implementation.
- Users choose which social links are public.
- On implementation pages, show only the lead’s public contact links by default.
- Do not expose every teammate’s social links automatically.

## 13. Recommended Tech Stack

Frontend:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:

- Next.js API routes or separate Node.js backend
- Prisma ORM

Database:

- PostgreSQL

Authentication:

- NextAuth, Clerk, or Supabase Auth
- Google Auth
- Email/password

Storage:

- Supabase Storage or Cloudinary for screenshots/profile images

AI:

- NVIDIA NIM using OpenAI-compatible API
- Configurable model name through environment variables

Deployment:

- Vercel for frontend/full-stack app
- Supabase/Neon/Railway for PostgreSQL

## 14. MVP Success Metrics

The MVP should be judged by execution activity, not just signups.

Important metrics:

- Number of ideas submitted
- Number of ideas published
- Percentage of ideas scoring 6+
- Number of implementations started
- Number of GitHub repo links submitted
- Number of deployed links submitted
- Number of repeat builders
- Number of join requests sent
- Number of accepted join requests
- Number of ideas with multiple implementations

The strongest validation signal is not “users liked ideas.” The strongest signal is “users actually started repos and shipped deployed links.”

## 15. Risks

### Risk 1: Low-quality idea spam

Mitigation: AI scoring, draft state, low-score visibility reduction, and filtering.

### Risk 2: People start projects but never finish

Mitigation: Allow multiple implementations per idea. Do not make one failed team block the idea.

### Risk 3: Users fear idea theft

Mitigation: Product positioning should make it clear that the platform is for open building and execution, not private idea protection.

### Risk 4: AI gives verbose or generic feedback

Mitigation: Prompt AI to be direct, concise, and suggestion-based. Do not let it rewrite the idea.

### Risk 5: Social link misuse or spam

Mitigation: Let users choose public links, show only lead links by default, and add report/block functionality later.

## 16. Future Scope

After MVP validation, possible future features include:

- AI chat assistant for idea discovery
- Better recommendation engine
- GitHub activity detection
- Builder reputation score
- Featured builders
- Hackathon mode
- Project showcase leaderboard
- Team chat
- Notifications
- Public launch pages
- Advanced search
- Monetization through featured listings or hiring access

## 17. MVP Build Priority

Priority 1:

- Auth
- Onboarding
- Profile
- Submit idea
- AI review
- Idea feed
- Idea detail page

Priority 2:

- Start building with GitHub repo link
- Implementation pages
- Dashboard
- Deploy link submission
- Multi-builder support

Priority 3:

- Join requests
- Public contact controls
- Saved ideas
- Filters

Priority 4:

- AI discovery chat
- Reputation
- Advanced recommendations
- Analytics

## 18. Final MVP Definition

The MVP is successful if a user can sign up, create a profile, submit an idea, receive an AI quality review, publish the idea, browse other ideas, start building an idea by attaching a GitHub repo, invite or accept teammates, and later submit a deployed link to mark the implementation as built.

This keeps the product focused, lightweight, and execution-driven.

