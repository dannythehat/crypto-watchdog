import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { hubs } from "@/content/hubs";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "News", href: "/news" },
  { label: "Warnings", href: "/warnings" },
  { label: "Freebies", href: "/freebies" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

// Curated top-level categories (the main landing pages), in order. Leaf
// sub-categories live inside their parent landing, not in the top menu.
const NAV_CATS = [
  { label: "AI Finance", href: "/ai-finance", desc: "AI trading, bots, DeFi & more" },
  { label: "Crypto Trading", href: "/crypto-trading", desc: "Bots, AI & copy trading" },
  { label: "Exchanges", href: "/crypto-exchanges", desc: "Buy, sell & trade" },
  { label: "Wallets", href: "/crypto-wallets", desc: "Self-custody & hot wallets" },
  { label: "DeFi", href: "/defi-platforms", desc: "Real yield vs Ponzi yield" },
  { label: "Tokenized Assets", href: "/tokenized-assets", desc: "Gold, treasuries, RWA" },
  { label: "NFT Marketplaces", href: "/nft-marketplaces", desc: "Mint & trade safely" },
  { label: "Crypto Cards", href: "/crypto-cards", desc: "Spend crypto, earn cashback" },
  { label: "Casinos & Sportsbooks", href: "/crypto-casinos", desc: "Vetted crypto gambling" },
  { label: "Scams & Safety", href: "/scam-guides", desc: "Spot & avoid scams" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
            <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-lg">
                {NAV_CATS.map((c) => (
                  <Link key={c.href} to={c.href} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-card hover:text-primary">
                    <span className="font-medium">{c.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                to={l.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname === l.href
                    ? "text-foreground"
                    : "text-muted-foreground"
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
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
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
              <ul className="mt-2 flex flex-col gap-2 border-l border-border pl-3">
                {NAV_CATS.map((c) => (
                  <li key={c.href}>
                    <Link to={c.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {c.label}
                    </Link>
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
