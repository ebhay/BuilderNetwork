-- Seed Demo Data

-- 1. Create demo users in auth.users
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'demo1@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'demo2@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'demo3@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do nothing;

-- 2. Create Profiles
insert into public.profiles (id, name, bio, coding_level, onboarded_at) values
('11111111-1111-1111-1111-111111111111', 'Alice Builder', 'Full stack dev looking for cool projects.', 'EXPERT', now()),
('22222222-2222-2222-2222-222222222222', 'Bob Coder', 'Frontend specialist.', 'INTERMEDIATE', now()),
('33333333-3333-3333-3333-333333333333', 'Charlie Designer', 'UI/UX and some React.', 'BEGINNER', now())
on conflict (id) do nothing;

-- 3. Create Skills
insert into public.skills (user_id, name, level) values
('11111111-1111-1111-1111-111111111111', 'TypeScript', 'EXPERT'),
('11111111-1111-1111-1111-111111111111', 'PostgreSQL', 'EXPERT'),
('22222222-2222-2222-2222-222222222222', 'React', 'INTERMEDIATE'),
('33333333-3333-3333-3333-333333333333', 'Figma', 'INTERMEDIATE')
on conflict do nothing;

-- 4. Create Social Links
insert into public.social_links (user_id, type, url, is_public) values
('11111111-1111-1111-1111-111111111111', 'GITHUB', 'https://github.com/alice', true),
('11111111-1111-1111-1111-111111111111', 'TWITTER', 'https://twitter.com/alice', false),
('22222222-2222-2222-2222-222222222222', 'PORTFOLIO', 'https://bob.dev', true)
on conflict do nothing;

-- 5. Create Ideas
insert into public.ideas (
  id, posted_by_user_id, title, description, visibility, review_status, content_hash,
  quality_score, quality_band, publish_recommendation, project_level, required_skills, tags, ai_feedback_json
) values
(
  'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
  'AI Recipe Generator', 'An app that generates recipes based on what is in your fridge. Users upload a photo of their fridge, and AI identifies ingredients and suggests recipes.',
  'PUBLISHED', 'REVIEWED', 'hash1',
  8.5, 'STRONG', 'publishable', 'INTERMEDIATE', '{"Frontend", "AI", "Backend"}', '{"AI", "Food", "Utility"}',
  '{"qualityScore": 8.5, "qualityBand": "STRONG", "publishRecommendation": "publishable", "projectLevel": "INTERMEDIATE", "requiredSkills": ["Frontend", "AI", "Backend"], "tags": ["AI", "Food", "Utility"], "suggestions": ["Add diet preferences filter"]}'
),
(
  'bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
  'Simple Todo App', 'A todo app where you can add, remove, and check off items.',
  'NEEDS_REFINEMENT', 'REVIEWED', 'hash2',
  5.0, 'NEEDS_REVISION', 'needs refinement', 'BEGINNER', '{"Frontend"}', '{"Productivity"}',
  '{"qualityScore": 5.0, "qualityBand": "NEEDS_REVISION", "publishRecommendation": "needs refinement", "projectLevel": "BEGINNER", "requiredSkills": ["Frontend"], "tags": ["Productivity"], "suggestions": ["Too generic, add unique twist"]}'
),
(
  'cccc3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
  'Local Social Network', 'A platform for people living in the same neighborhood to share news.',
  'PUBLISHED', 'REVIEWED', 'hash3',
  7.0, 'GOOD', 'publishable', 'INTERMEDIATE', '{"Frontend", "Backend"}', '{"Social", "Community"}',
  '{"qualityScore": 7.0, "qualityBand": "GOOD", "publishRecommendation": "publishable", "projectLevel": "INTERMEDIATE", "requiredSkills": ["Frontend", "Backend"], "tags": ["Social", "Community"], "suggestions": []}'
),
(
  'dddd4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
  'Draft App Idea', 'Just a draft idea.',
  'DRAFT', 'PENDING_REVIEW', 'hash4',
  null, null, null, null, '{}', '{}', null
)
on conflict do nothing;

-- 6. Create Implementations
insert into public.implementations (
  id, idea_id, lead_user_id, build_title, github_repo_url, deployed_url, status
) values
(
  'eeee5555-5555-5555-5555-555555555555', 'aaaa1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
  'FridgeAI Build', 'https://github.com/bob/fridge-ai', 'https://fridgeai.vercel.app', 'BUILT'
),
(
  'ffff6666-6666-6666-6666-666666666666', 'aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
  'Another Recipe App', 'https://github.com/charlie/recipe', null, 'IN_PROGRESS'
)
on conflict do nothing;

-- 7. Create Members
insert into public.implementation_members (implementation_id, user_id, role) values
('eeee5555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'LEAD'),
('eeee5555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'TEAMMATE'),
('ffff6666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'LEAD')
on conflict do nothing;

-- 8. Create Join Requests
insert into public.join_requests (implementation_id, requester_user_id, status) values
('ffff6666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'PENDING')
on conflict do nothing;

-- 9. Create Saved Ideas
insert into public.saved_ideas (idea_id, user_id) values
('aaaa1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333')
on conflict do nothing;
