import { useState } from "react";
import { Search, MapPin, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
// Fallback hero image in assets. If you want a different local file, place it in src/assets and update here.
import heroImage from "@/assets/hero-property.jpg";

export const PropertyHero = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const [heroSrc, setHeroSrc] = useState<string>("/hero-custom.jpg");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroSrc}
          alt="Luxury Property"
          className="w-full h-full object-cover"
          onError={() => setHeroSrc(heroImage)}
        />
        {/* Top fade from site background to image for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-transparent" />
        {/* Gold-on-dark theme tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-background/10 mix-blend-multiply" />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl float" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-success/20 rounded-full blur-lg float" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Predict Your Property's
            <span className="block bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#60a5fa] bg-clip-text text-transparent">
              Future Value
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered real estate valuation with market insights, comparable analysis, 
            and neighborhood data to help you make informed property decisions.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="glass p-6 border-white/20 backdrop-blur-xl bg-white/10">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Enter property address or location..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 h-14 text-lg"
                  />
                </div>
                <Button
                  className="btn-premium h-14 px-8 text-lg font-semibold"
                  onClick={() => {
                    const el = document.querySelector('#valuation');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      toast({ title: 'Starting valuation', description: 'Scrolling to the valuation section.' });
                    } else {
                      window.location.href = '/predict';
                      toast({ title: 'Opening Predict', description: 'Taking you to the Predict page.' });
                    }
                  }}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Get Prediction
                </Button>
              </div>
            </Card>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
            <Card className="glass p-6 text-left border-white/20 card-premium">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Market Trends
              </h3>
              <p className="text-white/80">
                Real-time market analysis with price trends and forecasts
              </p>
            </Card>

            <Card className="glass p-6 text-left border-white/20 card-premium" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Valuation
              </h3>
              <p className="text-white/80">
                Advanced algorithms analyzing 100+ property factors
              </p>
            </Card>

            <Card className="glass p-6 text-left border-white/20 card-premium" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary-light" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Neighborhood Data
              </h3>
              <p className="text-white/80">
                Comprehensive area insights and comparable properties
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-8 bg-white/30 rounded-full" />
      </div>
    </section>
  );
};