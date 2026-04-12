-- Create rating enum
CREATE TYPE public.trust_rating AS ENUM ('green', 'orange', 'red');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  rating trust_rating NOT NULL DEFAULT 'orange',
  summary TEXT NOT NULL,
  detailed_audit JSONB DEFAULT '{}',
  website_url TEXT,
  logo_url TEXT,
  fees_info TEXT,
  withdrawal_info TEXT,
  deposit_info TEXT,
  interview_url TEXT,
  video_url TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are publicly readable"
  ON public.reviews FOR SELECT USING (published = true);

CREATE INDEX idx_reviews_slug ON public.reviews(slug);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_category ON public.reviews(category_id);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  auto_generated BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are publicly readable"
  ON public.blog_posts FOR SELECT USING (published = true);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories
INSERT INTO public.categories (name, slug, description, icon_name) VALUES
  ('Exchanges', 'exchanges', 'Cryptocurrency exchanges and trading platforms', 'ArrowLeftRight'),
  ('Wallets', 'wallets', 'Crypto wallets and custody solutions', 'Wallet'),
  ('Trading Bots', 'trading-bots', 'Automated trading bots and AI tools', 'Bot'),
  ('DeFi', 'defi', 'Decentralized finance protocols and platforms', 'Layers'),
  ('Staking', 'staking', 'Staking platforms and yield services', 'Coins'),
  ('NFT Platforms', 'nft-platforms', 'NFT marketplaces and minting platforms', 'Image');

-- Seed sample reviews
INSERT INTO public.reviews (name, slug, category_id, rating, summary, fees_info, withdrawal_info, deposit_info, pros, cons, published, website_url) VALUES
  ('Binance', 'binance', (SELECT id FROM public.categories WHERE slug = 'exchanges'), 'green',
   'One of the largest global exchanges with deep liquidity and a broad range of trading pairs. Generally considered reliable, though regulatory scrutiny varies by region.',
   'Spot trading: 0.1% maker/taker. Discounts with BNB.', 'Withdrawals generally processed within minutes. Some delays reported during high-volume periods.',
   'Supports bank transfer, card, and P2P deposits.', ARRAY['Deep liquidity', 'Wide asset selection', 'Low fees', 'Advanced trading tools'],
   ARRAY['Regulatory uncertainty in some regions', 'Complex interface for beginners', 'Customer support can be slow'], true, 'https://binance.com'),

  ('MetaMask', 'metamask', (SELECT id FROM public.categories WHERE slug = 'wallets'), 'green',
   'The most popular browser-based Ethereum wallet. Open source, non-custodial, and widely integrated with DeFi protocols.',
   'No fees for holding. Swap fees vary (0.875% service fee).', 'User controls keys — withdrawals are on-chain transactions.',
   'Connect via browser extension or mobile app.', ARRAY['Non-custodial', 'Open source', 'Massive DeFi integration', 'Multi-chain support'],
   ARRAY['Hot wallet (less secure than hardware)', 'Swap fees can be high', 'Phishing target'], true, 'https://metamask.io'),

  ('ShadowTradeBot', 'shadowtradebot', (SELECT id FROM public.categories WHERE slug = 'trading-bots'), 'red',
   'Anonymous team, no verifiable track record, and unrealistic return promises. Multiple user reports of failed withdrawals and unresponsive support.',
   'Unclear fee structure. Hidden fees reported by users.', 'Multiple reports of withdrawal failures and delays exceeding 30 days.',
   'Requires minimum $500 deposit. No fiat on-ramp.', ARRAY['Slick marketing website'],
   ARRAY['Anonymous team', 'Unrealistic return claims', 'Withdrawal issues', 'No regulatory compliance', 'Unresponsive support'], true, NULL),

  ('3Commas', '3commas', (SELECT id FROM public.categories WHERE slug = 'trading-bots'), 'orange',
   'Popular trading bot platform with exchange integrations. Has a track record but suffered a significant API key leak in 2022 that raised security concerns.',
   'Free tier available. Pro plans from $37/month.', 'No direct withdrawals — connects to exchanges via API.',
   'Connect exchange accounts via API keys.', ARRAY['Multiple bot strategies', 'Exchange integrations', 'Smart trading terminal', 'Active community'],
   ARRAY['Past security breach', 'Subscription costs add up', 'Learning curve', 'Performance varies by market conditions'], true, 'https://3commas.io');

-- Seed sample blog posts
INSERT INTO public.blog_posts (title, slug, content, summary, category, published, auto_generated, published_at) VALUES
  ('How to Spot a Crypto Scam: 10 Red Flags', 'how-to-spot-crypto-scam-red-flags',
   E'The crypto space is full of opportunity — but also full of traps. Here are 10 red flags that should make you think twice before investing or trusting a crypto platform.\n\n## 1. Guaranteed Returns\nNo legitimate investment can guarantee returns. If a platform promises fixed daily or monthly profits, that''s a major warning sign.\n\n## 2. Anonymous Team\nTransparent projects have identifiable founders and team members with verifiable backgrounds.\n\n## 3. Pressure to Deposit Quickly\nScammers create urgency. Legitimate platforms let you take your time.\n\n## 4. No Regulatory Information\nCheck if the platform is registered with financial authorities in their jurisdiction.\n\n## 5. Withdrawal Difficulties\nIf other users report problems withdrawing funds, stay away.\n\n## 6. Unrealistic Marketing\nLamborghinis, luxury lifestyles, and \"financial freedom in 30 days\" — these are manipulation tactics.\n\n## 7. No Clear Business Model\nIf you can''t understand how the platform makes money, your money might be the product.\n\n## 8. Copycat Websites\nScammers often clone legitimate platforms. Always verify URLs carefully.\n\n## 9. No Audits or Proof of Reserves\nLegitimate platforms increasingly provide proof of reserves and third-party audits.\n\n## 10. Too Good to Be True\nThe oldest rule in finance still applies. If it sounds too good to be true, it probably is.',
   'Learn the 10 most common red flags that indicate a crypto platform might be a scam. Protect yourself before you invest.',
   'Education', true, false, now() - interval '1 day'),

  ('Weekly Watchdog Report: April 7-11, 2026', 'weekly-watchdog-report-april-7-11-2026',
   E'This week in crypto safety: two new exchanges flagged, a major wallet update addresses a vulnerability, and regulatory updates from the EU.\n\n## New Flags\n- **QuickSwapPro** has been flagged RED after multiple withdrawal failure reports surfaced across Reddit and Telegram.\n- **YieldMaxBot** moved from GREEN to ORANGE following questions about their advertised returns.\n\n## Security Updates\n- MetaMask released v11.4 addressing a phishing vector in their transaction signing flow.\n- Ledger firmware 2.3.1 patches a Bluetooth vulnerability affecting Nano X devices.\n\n## Regulatory\n- The EU''s MiCA regulation enters its second enforcement phase, requiring all exchanges operating in Europe to hold proper licensing by June 2026.\n\nStay vigilant. Always verify before you trust.',
   'Two new platforms flagged, security patches for major wallets, and EU regulatory updates. Your weekly crypto safety roundup.',
   'Weekly Report', true, false, now()),

  ('Bitcoin Holds $68K as Market Awaits Fed Decision', 'bitcoin-holds-68k-fed-decision',
   E'Bitcoin continues to consolidate above the $68,000 level as traders await the Federal Reserve''s upcoming interest rate decision. On-chain data shows accumulation by long-term holders, while short-term traders remain cautious.\n\nThe broader crypto market has shown resilience, with total market cap holding above $2.5 trillion. Ethereum''s recent upgrade has improved network efficiency, potentially supporting price action.\n\nFrom a safety perspective, we remind readers that volatile market conditions often see an increase in phishing attempts and fake \"insider tip\" scams. Always verify information through official channels.',
   'Bitcoin consolidates above $68K as the market watches the Fed. A reminder to stay alert for scams during volatile periods.',
   'Market Update', true, true, now() - interval '2 days');