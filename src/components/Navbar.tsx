import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { getHub } from "@/content/hubs";
import { getReview } from "@/content";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "News", href: "/news" },
  { label: "Warnings", href: "/warnings" },
  { label: "Freebies", href: "/freebies" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

type Child = { label: string; href: string };

// Pull the top platforms reviewed inside a hub, so a "leaf" category can still
// fly out to its actual review pages (the next level of the hierarchy).
const platformChildren = (hubSlug: string, max = 6): Child[] => {
  const h = getHub(hubSlug);
  if (!h) return [];
  const slugs = h.groups ? h.groups.flatMap((g) => g.slugs) : [...h.trusted, ...h.caution];
  const out: Child[] = [];
  const seen = new Set<string>();
  for (const s of slugs) {
    if (seen.has(s)) continue;
    seen.add(s);
    const r = getReview(s);
    if (r) out.push({ label: r.name, href: `/reviews/${s}` });
    if (out.length >= max) break;
  }
  return out;
};

// Curated top-level categories (the main landing pages), in order. Each one
// flies out to its next-level items: sub-category landing pages where the
// category breaks down further, or the platforms reviewed inside it.
type Cat = { label: string; href: string; desc: string; children: Child[] };
const NAV_CATS: Cat[] = [
  {
    label: "AI Finance", href: "/ai-finance", desc: "AI trading, bots, DeFi & more",
    children: [
      { label: "Crypto Trading", href: "/crypto-trading" },
      { label: "Exchanges", href: "/crypto-exchanges" },
      { label: "Wallets", href: "/crypto-wallets" },
      { label: "DeFi Platforms", href: "/defi-platforms" },
      { label: "Tokenized Assets", href: "/tokenized-assets" },
      { label: "NFT Marketplaces", href: "/nft-marketplaces" },
      { label: "Crypto Cards", href: "/crypto-cards" },
      { label: "Cloud Mining", href: "/cloud-mining" },
    ],
  },
  {
    label: "Crypto Trading", href: "/crypto-trading", desc: "Bots, AI & copy trading",
    children: [
      { label: "AI Trading Bots", href: "/ai-trading-bots" },
      { label: "Trading Bots", href: "/trading-bots" },
      { label: "Copy Trading", href: "/copy-trading" },
      { label: "Exchanges", href: "/crypto-exchanges" },
    ],
  },
  { label: "Exchanges", href: "/crypto-exchanges", desc: "Buy, sell & trade", children: platformChildren("crypto-exchanges") },
  { label: "Wallets", href: "/crypto-wallets", desc: "Self-custody & hot wallets", children: platformChildren("crypto-wallets") },
  { label: "DeFi", href: "/defi-platforms", desc: "Real yield vs Ponzi yield", children: platformChildren("defi-platforms") },
  { label: "Tokenized Assets", href: "/tokenized-assets", desc: "Gold, treasuries, RWA", children: platformChildren("tokenized-assets") },
  { label: "NFT Marketplaces", href: "/nft-marketplaces", desc: "Mint & trade safely", children: platformChildren("nft-marketplaces") },
  { label: "Crypto Cards", href: "/crypto-cards", desc: "Spend crypto, earn cashback", children: platformChildren("crypto-cards") },
  { label: "Casinos & Sportsbooks", href: "/crypto-casinos", desc: "Vetted crypto gambling", children: [] },
  {
    label: "Scams & Safety", href: "/scam-guides", desc: "Spot & avoid scams",
    children: [
      { label: "Spot a Scam", href: "/scam-guides" },
      { label: "Crypto Recovery", href: "/crypto-recovery" },
      { label: "Cloud Mining Scams", href: "/cloud-mining" },
      { label: "Education", href: "/education" },
    ],
  },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [openCat, setOpenCat] = useState<string | null>(null); // mobile accordion
  const location = useLocation();

  const active = NAV_CATS[hovered] ?? NAV_CATS[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" aria-label="Home">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          <li className="relative group">
            <button className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Categories <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </button>
            {/* Cascading flyout: left = top categories, right = the hovered one's sub-items */}
            <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              <div className="flex overflow-hidden rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur-lg">
                <ul className="w-60 border-r border-border/60 p-2">
                  {NAV_CATS.map((c, i) => (
                    <li key={c.href} onMouseEnter={() => setHovered(i)}>
                      <Link
                        to={c.href}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          i === hovered ? "bg-card text-primary" : "hover:bg-card hover:text-primary"
                        }`}
                      >
                        <span>
                          <span className="block font-medium">{c.label}</span>
                          <span className="block truncate text-xs text-muted-foreground">{c.desc}</span>
                        </span>
                        {c.children.length > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="w-60 p-2">
                  <Link
                    to={active.href}
                    className="mb-1 block rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-card"
                  >
                    All {active.label} →
                  </Link>
                  {active.children.length > 0 ? (
                    <ul>
                      {active.children.map((s) => (
                        <li key={s.href}>
                          <Link to={s.href} className="block truncate rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-3 py-2 text-xs text-muted-foreground">{active.desc}.</p>
                  )}
                </div>
              </div>
            </div>
          </li>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                to={l.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname === l.href ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/submit">Submit a Platform</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-background px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-primary">Categories</span>
              <ul className="mt-2 flex flex-col gap-1">
                {NAV_CATS.map((c) => (
                  <li key={c.href} className="border-l border-border pl-3">
                    <div className="flex items-center justify-between">
                      <Link to={c.href} onClick={() => setOpen(false)} className="block py-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
                        {c.label}
                      </Link>
                      {c.children.length > 0 && (
                        <button
                          aria-label={`Toggle ${c.label}`}
                          onClick={() => setOpenCat(openCat === c.href ? null : c.href)}
                          className="p-1 text-muted-foreground"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${openCat === c.href ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {openCat === c.href && c.children.length > 0 && (
                      <ul className="mb-1 ml-2 flex flex-col gap-1 border-l border-border/60 pl-3">
                        {c.children.map((s) => (
                          <li key={s.href}>
                            <Link to={s.href} onClick={() => setOpen(false)} className="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Button asChild size="sm" className="w-full">
                <Link to="/submit" onClick={() => setOpen(false)}>
                  Submit a Platform
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
