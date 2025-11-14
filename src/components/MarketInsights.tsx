import { TrendingUp, BarChart3, Users, MapPin, Calendar, DollarSign, Twitter, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountryCode, formatCurrency, getSavedCountry, saveCountry, convertAndFormatUSD } from "@/lib/currency";
import { useEffect, useState } from "react";
import analyticsImage from "@/assets/analytics-bg.jpg";

export const MarketInsights = () => {
  const [country, setCountry] = useState<CountryCode>(getSavedCountry());
  const marketStats = {
    averagePrice: 425000,
    priceChange: 8.2,
    timeOnMarket: 24,
    inventoryLevel: 2.1,
    salesVolume: 156,
    pricePerSqft: 198,
  };

  useEffect(() => {
    saveCountry(country);
  }, [country]);

  const neighborhoods = [
    {
      name: "Downtown District",
      averagePrice: 520000,
      growth: 12.5,
      inventory: "Low",
      rating: 95,
      features: ["Urban amenities", "Public transit", "Entertainment"]
    },
    {
      name: "Riverside Heights",
      averagePrice: 485000,
      growth: 9.8,
      inventory: "Medium",
      rating: 88,
      features: ["Waterfront", "Parks", "Family-friendly"]
    },
    {
      name: "Historic Village",
      averagePrice: 395000,
      growth: 6.4,
      inventory: "High",
      rating: 82,
      features: ["Character homes", "Local shops", "Community feel"]
    }
  ];

  // Deterministic daily seeded random for realistic fluctuations
  const makeSeed = () => {
    const d = new Date();
    // YYYYMMDD makes changes once per day
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const seededRand = (seed: string) => {
    // Simple xmur3 + mulberry32 combo
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    let t = (h ^= h >>> 16) >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rng = seededRand(makeSeed());

  // Helper to get a number in [min, max]
  const between = (min: number, max: number) => min + (max - min) * rng();

  // Build fluctuating market forecast with realistic ranges
  const marketForecast = [
    { label: "Q2 2025", value: between(1.6, 3.6) }, // expansion mid-year
    { label: "Q3 2026", value: between(0.8, 3.0) }, // moderate growth
    { label: "Q4 2027", value: between(-0.5, 2.0) }, // could slow or slightly contract
  ].map((f) => ({
    ...f,
    value: Math.round(f.value * 10) / 10, // one decimal place
  }));

  const marketFactors = [
    { name: "School Quality", impact: 92, trend: "positive" },
    { name: "Transportation Access", impact: 85, trend: "positive" },
    { name: "Employment Growth", impact: 78, trend: "positive" },
    { name: "Interest Rates", impact: 65, trend: "negative" },
    { name: "Housing Supply", impact: 58, trend: "negative" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={analyticsImage}
          alt="Market Analytics"
          className="w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Country</span>
            <Select value={country} onValueChange={(v) => setCountry(v as CountryCode)}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">USA</SelectItem>
                <SelectItem value="EU">EU</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="AE">Dubai (UAE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Market Insights & Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive real estate market analysis with neighborhood trends, 
            pricing data, and investment opportunities.
          </p>
        </div>

        {/* Key Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="glass p-6 border-border/50 shadow-elegant card-premium">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                +{marketStats.priceChange}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {convertAndFormatUSD(marketStats.averagePrice, country)}
            </h3>
            <p className="text-sm text-muted-foreground">Average Home Price</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {convertAndFormatUSD(marketStats.pricePerSqft, country)}/sq ft average
            </div>
          </Card>

          <Card className="glass p-6 border-border/50 shadow-elegant card-premium">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Fast Market
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {marketStats.timeOnMarket} Days
            </h3>
            <p className="text-sm text-muted-foreground">Average Time on Market</p>
            <div className="mt-3 text-xs text-muted-foreground">
              15% faster than last year
            </div>
          </Card>

          <Card className="glass p-6 border-border/50 shadow-elegant card-premium">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                {marketStats.inventoryLevel} Months
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {marketStats.salesVolume}
            </h3>
            <p className="text-sm text-muted-foreground">Properties Sold (Last 30 Days)</p>
            <div className="mt-3 text-xs text-muted-foreground">
              Low inventory - Seller's market
            </div>
          </Card>
        </div>

        {/* Neighborhood Analysis */}
        <Card className="glass p-8 mb-12 border-border/50 shadow-elegant">
          <div className="flex items-center gap-2 mb-8">
            <MapPin className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-semibold text-foreground">Top Neighborhoods</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {neighborhoods.map((neighborhood, index) => (
              <div
                key={index}
                className="p-6 border border-border rounded-lg hover:border-primary/50 transition-all card-premium"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">{neighborhood.name}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      neighborhood.inventory === "Low" 
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : neighborhood.inventory === "Medium"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-success/10 text-success border-success/20"
                    }`}
                  >
                    {neighborhood.inventory} Inventory
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Price:</span>
                    <span className="font-semibold text-foreground">
                      {convertAndFormatUSD(neighborhood.averagePrice, country)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">YoY Growth:</span>
                    <span className="font-semibold text-success">+{neighborhood.growth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={neighborhood.rating} className="w-16 h-2" />
                      <span className="text-sm font-medium text-foreground">{neighborhood.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
                  {neighborhood.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Market Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass p-6 border-border/50 shadow-elegant">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Market Driving Factors</h3>
            </div>

            <div className="space-y-4">
              {marketFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{factor.impact}%</span>
                      {factor.trend === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={factor.impact} 
                    className={`h-2 ${factor.trend === "positive" ? "[&>div]:bg-success" : "[&>div]:bg-warning"}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass p-6 border-border/50 shadow-elegant">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Market Activity</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Buyer Activity</span>
                  <span className="text-sm font-semibold text-success">High (87%)</span>
                </div>
                <Progress value={87} className="h-2 [&>div]:bg-success" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Seller Activity</span>
                  <span className="text-sm font-semibold text-warning">Medium (64%)</span>
                </div>
                <Progress value={64} className="h-2 [&>div]:bg-warning" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">New Listings</span>
                  <span className="text-sm font-semibold text-primary">Rising (75%)</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Market Forecast</h4>
                <div className="space-y-2 text-sm">
                  {marketForecast.map((f, i) => {
                    const cls = f.value < 0
                      ? "text-destructive"
                      : f.value < 2
                        ? "text-primary"
                        : "text-success";
                    const sign = f.value > 0 ? "+" : "";
                    return (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{f.label}:</span>
                        <span className={`${cls} font-medium`}>{sign}{f.value}% growth expected</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Social media follow for Estate Luxe */}
      <div className="relative z-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass p-6 border-border/50 shadow-elegant">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Follow</div>
                <div className="text-xl font-semibold text-foreground">Estate Luxe</div>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://twitter.com/estateluxe" target="_blank" rel="noreferrer" aria-label="Estate Luxe on X (Twitter)" className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/60 transition-colors">
                  <Twitter className="h-5 w-5 text-foreground/80 group-hover:text-primary" />
                </a>
                <a href="https://facebook.com/estateluxe" target="_blank" rel="noreferrer" aria-label="Estate Luxe on Facebook" className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/60 transition-colors">
                  <Facebook className="h-5 w-5 text-foreground/80 group-hover:text-primary" />
                </a>
                <a href="https://www.instagram.com/the.estate.luxe?igsh=ZnQ2djhoajF0c2g0&utm_source=qr" target="_blank" rel="noreferrer" aria-label="Estate Luxe on Instagram" className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/60 transition-colors">
                  <Instagram className="h-5 w-5 text-foreground/80 group-hover:text-primary" />
                </a>
                <a href="https://linkedin.com/company/estateluxe" target="_blank" rel="noreferrer" aria-label="Estate Luxe on LinkedIn" className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/60 transition-colors">
                  <Linkedin className="h-5 w-5 text-foreground/80 group-hover:text-primary" />
                </a>
                <a href="https://youtube.com/@estateluxe" target="_blank" rel="noreferrer" aria-label="Estate Luxe on YouTube" className="group inline-flex items-center justify-center w-10 h-10 rounded-full border border-border/50 hover:border-primary/60 transition-colors">
                  <Youtube className="h-5 w-5 text-foreground/80 group-hover:text-primary" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};