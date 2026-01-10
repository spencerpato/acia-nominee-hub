import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-card rounded-lg p-2">
                <Logo size="sm" />
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-md">
              The African Creator Impact Awards celebrates and recognizes Africa's 
              most influential digital creators who are shaping culture, inspiring 
              communities, and making a lasting impact across the continent.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/nominees" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Nominees
                </Link>
              </li>
              <li>
                <Link 
                  to="/leaderboard" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth?mode=signup" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Register as Creator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif text-lg mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              © {currentYear} African Creator Impact Awards. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-foreground/50">
                Celebrating Africa's Digital Excellence
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
