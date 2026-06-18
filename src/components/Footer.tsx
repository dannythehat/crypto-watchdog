import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
  <footer className="border-t border-border bg-card px-4 py-12 md:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Independent crypto safety reviews. We audit so you don't have to guess.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold">Navigate</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/reviews" className="hover:text-foreground">Reviews</Link></li>
            <li><Link to="/warnings" className="hover:text-foreground">Scam Alerts</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold">Learn</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/education" className="hover:text-foreground">Crypto Education</Link></li>
            <li><Link to="/scam-guides" className="hover:text-foreground">Scam Guides</Link></li>
            <li><Link to="/methodology" className="hover:text-foreground">How We Rate</Link></li>
            <li><Link to="/freebies" className="hover:text-foreground">Crypto Freebies</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-heading text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/submit" className="hover:text-foreground">Submit a Platform</Link></li>
            <li><Link to="/editorial-policy" className="hover:text-foreground">Editorial Policy</Link></li>
            <li><Link to="/affiliate-disclosure" className="hover:text-foreground">Affiliate Disclosure</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Crypto Watchdog. All rights reserved.</p>
        <p className="mt-1">
          Reviews are based on publicly available information, community reports, and our own testing.
          Always do your own research before using any crypto platform. This is not financial advice.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
