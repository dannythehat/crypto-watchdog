
-- Add trust_score and verdict to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS verdict text DEFAULT NULL;

-- Warnings / Scam Alerts table
CREATE TABLE public.warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  summary text,
  severity text NOT NULL DEFAULT 'high' CHECK (severity IN ('medium', 'high', 'critical')),
  platform_name text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published warnings are publicly readable"
  ON public.warnings FOR SELECT
  USING (published = true);

-- Submissions table (people can submit platforms for review)
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL,
  platform_url text,
  category text,
  user_email text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a platform"
  ON public.submissions FOR INSERT
  TO public
  WITH CHECK (true);
