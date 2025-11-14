import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative text-foreground bg-background/90 border-t border-border/50 overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-secondary/10 via-primary/5 to-transparent blur-2xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              Estate Luxe
            </div>
            <p className="text-foreground/70">
              AI-powered real estate valuation and market analysis platform helping you make informed property decisions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground/60 hover:text-secondary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/the.estate.luxe?igsh=ZnQ2djhoajF0c2g0&utm_source=qr" target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-secondary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Property Valuation
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Market Analysis
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Investment Calculator
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Neighborhood Reports
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Comparable Properties
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Market Trends
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Real Estate Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Investment Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-secondary transition-colors">
                  Support Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-foreground/80">
                  123 Business Ave, Suite 100<br />
                  New York, NY 10001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-foreground/80">
                  +91 9041408214<br />
                  +91 9370900007
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-foreground/80">
                  info@proppredict.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-foreground/60 text-sm">
              &copy; {currentYear} Estate Luxe. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-foreground/60 hover:text-secondary text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-foreground/60 hover:text-secondary text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-foreground/60 hover:text-secondary text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};