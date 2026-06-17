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
                {hubs.map((h) => (
                  <Link key={h.slug} to={`/${h.slug}`} className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-card hover:text-primary">
                    <span className="font-medium">{h.eyebrow}</span>
                    <span className="block truncate text-xs text-muted-foreground">{h.metaTitle}</span>
                  </Link>
                ))}
                <Link to="/crypto-casinos" className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-card hover:text-primary">
                  <span className="font-medium">Casinos &amp; Sportsbooks</span>
                  <span className="block truncate text-xs text-muted-foreground">Best Crypto Casinos &amp; Sportsbooks 2026</span>
                </Link>
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
                {hubs.map((h) => (
                  <li key={h.slug}>
                    <Link to={`/${h.slug}`} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {h.eyebrow}
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
