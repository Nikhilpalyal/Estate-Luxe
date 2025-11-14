import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Home, MapPin, Calendar, DollarSign, BarChart3, Target, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CountryCode, formatCurrency, getSavedCountry, saveCountry, convertAndFormatUSD, convertBetweenCountries } from "@/lib/currency";

export type ValuationInput = {
  address?: string;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  propertyType?: string;
};

export const ValuationResults = ({ input, stickyHeader = true }: { input?: ValuationInput; stickyHeader?: boolean }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1year");
  const [country, setCountry] = useState<CountryCode>(getSavedCountry());
  const [projectionYears, setProjectionYears] = useState<10 | 15 | 20>(15);
  const [scenario, setScenario] = useState<"base" | "optimistic" | "pessimistic">("base");
  // Track displayed valuation figures so we can convert numerically on country switch
  const [displayValuation, setDisplayValuation] = useState(() => ({
    current: 0,
    low: 0,
    high: 0,
  }));
  // Global visual multiplier for displaying prices
  const MULTIPLIER = 4;

  const saveProperty = (p: { id: string; price: number; address: string; sqft?: number; bedrooms?: number; bathrooms?: number; soldDate?: string }) => {
    try {
      const arr = JSON.parse(localStorage.getItem("saved:properties") || "[]");
      const next = Array.isArray(arr) ? arr : [];
      if (!next.find((x: any) => x.id === p.id)) {
        next.push({
          id: p.id,
          price: convertAndFormatUSD(p.price, country),
          address: p.address,
          details: `${p.bedrooms ?? ''}${p.bedrooms ? ' Bed' : ''} ${p.bathrooms ?? ''}${p.bathrooms ? ' Bath' : ''} ${p.sqft ? `• ${p.sqft.toLocaleString()} sqft` : ''}`.trim(),
        });
        localStorage.setItem("saved:properties", JSON.stringify(next));
        toast({ title: "Saved", description: "Comparable saved to your profile." });
      } else {
        toast({ title: "Already saved", description: "This comparable is already in Saved properties." });
      }
    } catch {}
  };

  const valuationData = useMemo(() => {
    const sqft = Number(input?.sqft || 2150);
    // Apply property-type-specific multiplier so same specs yield different prices across types
    const propertyType = input?.propertyType;
    const typeMultiplierMap: Record<string, number> = {
      'single-family': 1.0,
      'condo': 0.95,
      'townhouse': 1.0,
      'duplex': 1.05,
      'apartment': 1.0,
      'mansion': 2.0,
      'land': 1.4,
      'land/lot': 1.4,
    };
    const typeMult = propertyType ? (typeMultiplierMap[propertyType] ?? 1.0) : 1.0;
    // Base per-sqft in native currency by country (ft²)
    const basePerSqftNative: Record<CountryCode, number> = {
      IN: 6000,  // INR/ft² baseline; display multiplier will push metros into 2–3 Cr for 1BHK
      US: 220,   // USD/ft²
      EU: 350,   // EUR/ft²
      UK: 450,   // GBP/ft²
      AE: 700,   // AED/ft²
    };
    const countryBase = basePerSqftNative[country] ?? 220;
    // City/location premium from address keywords (esp. India metros)
    const addr = (input?.address || '').toLowerCase();
    const locationMult = (() => {
      // India metros
      if (addr.includes('bengaluru') || addr.includes('bangalore')) return 1.4;
      if (addr.includes('mumbai')) return 1.6;
      if (addr.includes('delhi') || addr.includes('new delhi')) return 1.3;
      if (addr.includes('hyderabad')) return 1.2;
      if (addr.includes('pune')) return 1.15;
      if (addr.includes('chennai')) return 1.2;
      // UAE, UK, US notable cities (light-touch)
      if (addr.includes('dubai')) return 1.4;
      if (addr.includes('london')) return 1.3;
      if (addr.includes('san francisco') || addr.includes('new york')) return 1.3;
      // Default slight premium for any recognized city text
      return addr ? 1.15 : 1.0;
    })();
    const baseValuePerSqft = countryBase * typeMult * locationMult; // native currency per ft²
    const isLand = propertyType === 'land' || propertyType === 'land/lot';
    const bedroomsAdj = isLand ? 0 : (Number(input?.bedrooms || 3) - 3) * 4000;
    const bathroomsAdj = isLand ? 0 : (Number(input?.bathrooms || 2.5) - 2.5) * 6000;
    const yearAdj = (() => {
      const year = Number(input?.yearBuilt || 2015);
      const age = Math.max(0, new Date().getFullYear() - year);
      return -age * 500; // depreciate $500 per year for demo
    })();
    const currentValue = Math.max(40000, Math.round(sqft * baseValuePerSqft + bedroomsAdj + bathroomsAdj + yearAdj));
    return {
      currentValue,
      confidenceScore: 90,
      priceRange: { low: Math.round(currentValue * 0.96), high: Math.round(currentValue * 1.04) },
      lastUpdated: new Date().toISOString(),
      address: input?.address || "Enter details above",
      sqft,
      bedrooms: Number(input?.bedrooms || 3),
      bathrooms: Number(input?.bathrooms || 2.5),
      yearBuilt: Number(input?.yearBuilt || 2015),
    };
  }, [input]);

  // Initialize displayed values whenever the base valuation changes (keep in current country units)
  useEffect(() => {
    const multiplier = MULTIPLIER; // Always display 4x prices as requested
    setDisplayValuation({
      current: Math.round(valuationData.currentValue * multiplier),
      low: Math.round(valuationData.priceRange.low * multiplier),
      high: Math.round(valuationData.priceRange.high * multiplier),
    });
  }, [input, valuationData.currentValue, valuationData.priceRange.low, valuationData.priceRange.high]);

  const marketTrends = {
    "1year": { change: 8.5, direction: "up", price: 485000 },
    "3years": { change: 22.3, direction: "up", price: 520000 },
    "5years": { change: 18.7, direction: "up", price: 495000 },
  };

  const comparableProperties = [
    { address: "125 Oak Street", price: 475000, sqft: 2100, bedrooms: 3, bathrooms: 2, soldDate: "Dec 2023" },
    { address: "118 Maple Avenue", price: 492000, sqft: 2200, bedrooms: 3, bathrooms: 2.5, soldDate: "Nov 2023" },
    { address: "134 Pine Street", price: 468000, sqft: 2050, bedrooms: 3, bathrooms: 2, soldDate: "Jan 2024" },
  ];

  // Price range filter (defaults from comps and valuation range)
  const compMin = useMemo(() => Math.min(...comparableProperties.map(c => c.price), valuationData.priceRange.low), [valuationData.priceRange.low]);
  const compMax = useMemo(() => Math.max(...comparableProperties.map(c => c.price), valuationData.priceRange.high), [valuationData.priceRange.high]);
  const [priceMin, setPriceMin] = useState<number>(compMin);
  const [priceMax, setPriceMax] = useState<number>(compMax);
  useEffect(() => { setPriceMin(compMin); setPriceMax(compMax); }, [compMin, compMax]);
  const filteredComps = useMemo(() => comparableProperties.filter(c => c.price >= priceMin && c.price <= priceMax), [comparableProperties, priceMin, priceMax]);

  const factors = [
    { name: "Location Score", value: 95, description: "Excellent neighborhood with good schools" },
    { name: "Property Condition", value: 88, description: "Well-maintained with recent updates" },
    { name: "Market Demand", value: 82, description: "High demand area with low inventory" },
    { name: "Comparable Sales", value: 90, description: "Strong recent sales in the area" },
  ];

  // Property images based on address + selected country (real-time sale vibe)
  const imageQuery = useMemo(() => {
    const raw = (input?.address || "Luxury House").toString();
    const parts = raw.split(",");
    const locationHint = (parts.length > 1 ? parts[parts.length - 1] : raw).trim();
    const byCountry: Record<CountryCode, string> = {
      IN: `India, real estate for sale, ${locationHint || 'Mumbai'}, luxury apartment, skyline, exterior, facade, front elevation`,
      US: `United States, real estate for sale, ${locationHint || 'Suburban'}, single family home, modern, exterior, facade, front elevation`,
      EU: `Europe, real estate for sale, ${locationHint || 'City'}, contemporary architecture, exterior, facade, front elevation`,
      UK: `United Kingdom, real estate for sale, ${locationHint || 'London'}, townhouses, exterior, facade, front elevation`,
      AE: `Dubai, real estate for sale, ${locationHint || 'Burj Khalifa'}, luxury towers, exterior, facade, front elevation`,
    };
    return encodeURIComponent(byCountry[country]);
  }, [input?.address, country]);

  const imageUrls = useMemo(() => {
    // Unsplash Source returns fresh images. Include time seed to keep it lively.
    const base = `https://source.unsplash.com`;
    const seed = Date.now().toString().slice(-6);
    return [1,2,3,4,5,6].map((n) => `${base}/featured/800x600/?real-estate,for-sale,property,exterior,${imageQuery}&sig=${seed}-${n}`);
  }, [imageQuery, country]);

  // Curated fallbacks (direct Unsplash image IDs/CDN) to guarantee visuals even if dynamic fetch fails
  const fallbackImages = [
    "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c52f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560185008-b033106af2fb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1200&auto=format&fit=crop",
  ];

  useEffect(() => { saveCountry(country); }, [country]);

  // Compute future price projection for 10–20 years
  const projection = useMemo(() => {
    const yearsAhead = projectionYears;
    const startYear = new Date().getFullYear();
    // Base growth by country (aligned with price history generator)
    const growthByCountry: Record<CountryCode, number> = { IN: 0.055, US: 0.035, EU: 0.025, UK: 0.022, AE: 0.045 };
    let g = growthByCountry[country] ?? 0.03;
    if (scenario === "optimistic") g += 0.01;
    if (scenario === "pessimistic") g -= 0.01;
    const start = valuationData.currentValue;
    const yrs = Array.from({ length: yearsAhead + 1 }, (_, i) => startYear + i);
    const vals = yrs.map((_, i) => Math.max(50000, Math.round(start * Math.pow(1 + g, i))));
    const cagr = (Math.pow(vals[vals.length - 1] / start, 1 / yearsAhead) - 1) * 100;
    const totalChange = ((vals[vals.length - 1] - start) / start) * 100;
    return { years: yrs, values: vals, g, cagr, totalChange };
  }, [country, scenario, projectionYears, valuationData.currentValue]);

  return (
    <section id="valuation-results" className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Country Selector */}
        <div className={`${stickyHeader ? 'sticky top-16 z-30' : ''} mb-6`}>
          <Card className="border border-primary/40 bg-background/80 backdrop-blur-md p-3 flex items-center justify-between gap-3 shadow-elegant">
            <div className="text-sm font-medium text-foreground">Country</div>
            <Select
              value={country}
              onValueChange={(v) => {
                const next = v as CountryCode;
                if (next !== country) {
                  // Convert the currently displayed amounts from the old country to the new one
                  setDisplayValuation((prev) => ({
                    current: Math.round(convertBetweenCountries(prev.current, country, next)),
                    low: Math.round(convertBetweenCountries(prev.low, country, next)),
                    high: Math.round(convertBetweenCountries(prev.high, country, next)),
                  }));
                  setCountry(next);
                }
              }}
            >
              <SelectTrigger className="h-10 w-36 border-primary text-primary">
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
          </Card>

        {/* Future Price Projection */}
        <Card className="glass p-6 border-border/50 shadow-elegant mt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              <h3 className="text-xl font-semibold text-foreground">Future Price Projection (Next {projectionYears} Years)</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Horizon</span>
                <select
                  className="h-9 rounded-md bg-background/80 border border-white/10 px-2 text-sm"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Number(e.target.value) as 10 | 15 | 20)}
                >
                  <option value={10}>10 years</option>
                  <option value={15}>15 years</option>
                  <option value={20}>20 years</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Scenario</span>
                <div className="flex rounded-md overflow-hidden border border-white/10">
                  {(["pessimistic", "base", "optimistic"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScenario(s)}
                      className={`px-3 py-1.5 text-xs ${scenario === s ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted/40'}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  const rows = projection.years.map((yr, i) => `${yr},${projection.values[i]}`);
                  const csv = `Year,Projected Price\n${rows.join('\n')}`;
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `estate-luxe-projection-${projectionYears}y-${scenario}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                aria-label="Download projection CSV"
                title="Download projection CSV"
              >
                <Download className="h-4 w-4" /> CSV
              </button>
            </div>
          </div>

          {(() => {
            const years = projection.years;
            const values = projection.values;
            // Apply display multiplier to charted values
            const dispValues = values.map(v => v * MULTIPLIER);
            const min = Math.min(...dispValues);
            const max = Math.max(...dispValues);
            const pad = (max - min) * 0.1 || 1;
            const chartMin = min - pad;
            const chartMax = max + pad;
            const W = 820, H = 260, P = 32;
            const xs = dispValues.map((_, i) => P + (i * (W - 2 * P)) / (dispValues.length - 1));
            const ys = dispValues.map(v => H - P - ((v - chartMin) / (chartMax - chartMin)) * (H - 2 * P));
            const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
            return (
              <div>
                <div className="w-full overflow-x-auto">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Future price projection chart">
                    <defs>
                      <linearGradient id="projGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="var(--secondary)" />
                        <stop offset="100%" stopColor="var(--primary)" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width={W} height={H} fill="transparent" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <line key={i} x1={P} x2={W - P} y1={P + (i * (H - 2 * P)) / 3} y2={P + (i * (H - 2 * P)) / 3} stroke="hsl(var(--muted-foreground))" opacity="0.15" />
                    ))}
                    {years.map((yr, i) => (
                      (i % Math.ceil(years.length / 6) === 0) ? (
                        <text key={yr} x={xs[i]} y={H - P + 18} fontSize="10" textAnchor="middle" fill="hsl(var(--muted-foreground))">{yr}</text>
                      ) : null
                    ))}
                    <text x={P} y={P - 8} fontSize="11" fill="hsl(var(--muted-foreground))">
                      {values[0].toLocaleString()} → {values[values.length - 1].toLocaleString()}
                    </text>
                    <path d={path} fill="none" stroke="url(#projGrad)" strokeWidth="3" />
                    {xs.map((x, i) => (
                      <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="url(#projGrad)" />
                    ))}
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/20">
                    <div className="text-muted-foreground">Projected Value</div>
                    <div className="text-lg font-semibold text-foreground">{convertAndFormatUSD(values[values.length - 1], country)}</div>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/20">
                    <div className="text-muted-foreground">CAGR</div>
                    <div className="text-lg font-semibold text-foreground">{projection.cagr.toFixed(2)}%</div>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/20">
                    <div className="text-muted-foreground">Total Change</div>
                    <div className="text-lg font-semibold text-foreground">{projection.totalChange.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Property Valuation Report
          </h2>
          <div className="flex items-center justify-center gap-4">
            <p className="text-xl text-muted-foreground">AI-powered analysis with comprehensive market insights</p>
          </div>
        </div>

        {/* Main Valuation Card */}
        <Card className="glass p-8 mb-8 border-border/50 shadow-elegant">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold text-foreground">Property Overview</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{valuationData.address}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {input?.propertyType ? (
                    <div>
                      <span className="text-muted-foreground">Property Type:</span>
                      <span className="ml-2 font-medium text-foreground">{input.propertyType}</span>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-muted-foreground">Square Feet:</span>
                    <span className="ml-2 font-medium text-foreground">{valuationData.sqft.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year Built:</span>
                    <span className="ml-2 font-medium text-foreground">{valuationData.yearBuilt}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bedrooms:</span>
                    <span className="ml-2 font-medium text-foreground">{valuationData.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bathrooms:</span>
                    <span className="ml-2 font-medium text-foreground">{valuationData.bathrooms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Valuation */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-6 w-6 text-success" />
                <h3 className="text-2xl font-semibold text-foreground">Current Valuation</h3>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gradient bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {formatCurrency(displayValuation.current, country)}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Range: {formatCurrency(displayValuation.low, country)} - {formatCurrency(displayValuation.high, country)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    <Target className="h-3 w-3 mr-1" />
                    {valuationData.confidenceScore}% Confidence
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(valuationData.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Suggested Pricing */}
        <Card className="glass p-6 border-border/50 shadow-elegant mt-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-secondary" />
            <h3 className="text-xl font-semibold text-foreground">Suggested Pricing</h3>
          </div>
          {(() => {
            const sizeAdj = Math.min(0.15, Math.max(-0.08, ((valuationData.sqft - 2150) / 2150) * 0.06));
            const countryLift: Record<CountryCode, number> = { IN: 0.06, US: 0.04, EU: 0.03, UK: 0.03, AE: 0.08 };
            const lift = countryLift[country] ?? 0.04;
            const base = valuationData.currentValue;
            // Country-specific real-world guidance (per square meter)
            const perSqftGuidance: Partial<Record<CountryCode, { low: number; high: number }>> = {
              AE: { low: 550, high: 900 }, // AED/ft²
              US: { low: 220, high: 500 }, // USD/ft²
              UK: { low: 600, high: 1200 }, // GBP/ft²
              EU: { low: 500, high: 900 }, // EUR/ft²
              // Updated India ranges to reflect Tier-1 city pricing (per ft² in INR)
              IN: { low: 8000, high: 25000 }, // INR/ft²
            };
            const guidance = perSqftGuidance[country as keyof typeof perSqftGuidance];
            let guidanceNote: string | undefined;
            let avgLow = Math.round(base * (0.98 + sizeAdj * 0.3));
            let avgHigh = Math.round(base * (1.02 + sizeAdj * 0.3));
            if (guidance && valuationData.sqft) {
              const SQFT_PER_SQM = 10.7639;
              // Convert per-ft² to per-m²
              const perSqmLow = guidance.low * SQFT_PER_SQM;
              const perSqmHigh = guidance.high * SQFT_PER_SQM;
              const sqm = valuationData.sqft / SQFT_PER_SQM;
              avgLow = Math.round(sqm * perSqmLow);
              avgHigh = Math.round(sqm * perSqmHigh);
              guidanceNote = `Guidance: ~ ${formatCurrency(Math.round(perSqmLow), country)}/m² - ${formatCurrency(Math.round(perSqmHigh), country)}/m²`;
            }
            // Luxury positioning (amenities, finishes, view premiums)
            // Use average pricing as baseline to ensure luxury is above average in real world markets.
            const avgMid = (avgLow + avgHigh) / 2;
            // Country-specific multipliers for luxury over average
            const luxMultipliers: Record<CountryCode, { low: number; high: number }> = {
              IN: { low: 1.6, high: 2.4 },
              US: { low: 1.3, high: 1.8 },
              EU: { low: 1.4, high: 2.0 },
              UK: { low: 1.5, high: 2.2 },
              AE: { low: 1.6, high: 2.5 },
            };
            const lm = luxMultipliers[country] ?? { low: 1.35, high: 1.9 };
            // Add size and local lift as small adjustments to the multiplier band
            const adjBand = Math.max(-0.05, Math.min(0.08, sizeAdj + lift * 0.3));
            const luxLow = Math.round(Math.max(avgLow, avgMid * (lm.low + adjBand)));
            const luxHigh = Math.round(Math.max(avgHigh, avgMid * (lm.high + adjBand)));
            const ppsfAvg = valuationData.sqft ? avgMid / valuationData.sqft : undefined;
            const ppsfLux = valuationData.sqft ? ((luxLow + luxHigh) / 2) / valuationData.sqft : undefined;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/50 p-5 bg-muted/20">
                  <div className="text-sm text-muted-foreground mb-1">Average Property</div>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(avgLow * MULTIPLIER, country)} - {formatCurrency(avgHigh * MULTIPLIER, country)}</div>
                  {guidanceNote ? (
                    <div className="text-xs text-muted-foreground mt-1">{guidanceNote}</div>
                  ) : ppsfAvg ? (
                    <div className="text-xs text-muted-foreground mt-1">~ {formatCurrency(Math.round(ppsfAvg), country)}/sqft</div>
                  ) : null}
                  <div className="text-xs text-muted-foreground mt-2">Balanced pricing for standard finishes and demand.</div>
                </div>
                <div className="rounded-xl border border-border/50 p-5 bg-gradient-to-br from-secondary/10 to-primary/10">
                  <div className="text-sm text-secondary mb-1">Luxury Property</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
                    {formatCurrency(luxLow * MULTIPLIER, country)} - {formatCurrency(luxHigh * MULTIPLIER, country)}
                  </div>
                  {ppsfLux && (
                    <div className="text-xs text-muted-foreground mt-1">~ {formatCurrency(Math.round(ppsfLux), country)}/sqft</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">Premium positioning for high-end finishes, amenities, and views.</div>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Price History (10–15 Years) */}
        <Card className="glass p-6 border-border/50 shadow-elegant mt-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Price History (Last 15 Years)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Based on country-selected market dynamics</p>

          {(() => {
            // Generate synthetic history using current value as anchor and country-based trend
            const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - (14 - i));
            const anchor = valuationData.currentValue;
            const trendByCountry: Record<CountryCode, number> = { IN: 0.055, US: 0.035, EU: 0.025, UK: 0.022, AE: 0.045 };
            const volatilityByCountry: Record<CountryCode, number> = { IN: 0.10, US: 0.06, EU: 0.05, UK: 0.05, AE: 0.08 };
            const g = trendByCountry[country] ?? 0.03;
            const vol = volatilityByCountry[country] ?? 0.06;
            // Build backward values from 15 years ago to today to avoid compounding errors
            const base = anchor / Math.pow(1 + g, 14);
            const values = years.map((_, idx) => {
              const t = idx; // 0..14
              // deterministic pseudo-random using sin for smoothness
              const wobble = Math.sin((t + country.charCodeAt(0)) * 1.3) * vol;
              const val = base * Math.pow(1 + g, t) * (1 + wobble * 0.4);
              return Math.max(50000, Math.round(val));
            });
            // Apply display multiplier to charted values
            const dispValues = values.map(v => v * MULTIPLIER);
            const min = Math.min(...dispValues);
            const max = Math.max(...dispValues);
            const pad = (max - min) * 0.1 || 1;
            const chartMin = min - pad;
            const chartMax = max + pad;

            const W = 820, H = 260, P = 32; // width, height, padding
            const xs = dispValues.map((_, i) => P + (i * (W - 2 * P)) / (dispValues.length - 1));
            const ys = dispValues.map(v => H - P - ((v - chartMin) / (chartMax - chartMin)) * (H - 2 * P));
            const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');

            return (
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="Price history chart">
                  {/* Grid */}
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="var(--secondary)" />
                      <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width={W} height={H} fill="transparent" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <line key={i} x1={P} x2={W - P} y1={P + (i * (H - 2 * P)) / 3} y2={P + (i * (H - 2 * P)) / 3} stroke="hsl(var(--muted-foreground))" opacity="0.15" />
                  ))}
                  {/* Axis labels (years) */}
                  {years.map((yr, i) => (
                    (i % 2 === 0) ? (
                      <text key={yr} x={xs[i]} y={H - P + 18} fontSize="10" textAnchor="middle" fill="hsl(var(--muted-foreground))">{yr}</text>
                    ) : null
                  ))}
                  {/* Value band */}
                  <text x={P} y={P - 8} fontSize="11" fill="hsl(var(--muted-foreground))">
                    {convertAndFormatUSD(min, country)} - {convertAndFormatUSD(max, country)}
                  </text>
                  {/* Line */}
                  <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="3" />
                  {/* Dots */}
                  {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="url(#lineGrad)" />
                  ))}
                </svg>
              </div>
            );
          })()}
        </Card>

        {/* Property Images */}
        <Card className="glass p-6 border-border/50 shadow-elegant mt-12 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Home className="h-5 w-5 text-secondary" />
            <h3 className="text-xl font-semibold text-foreground">Property Images</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageUrls.map((src, idx) => {
              // Guarantee visibility for tiles 4 and 5 by using curated fallbacks by default
              const displaySrc = (idx === 3 || idx === 4) ? fallbackImages[idx % fallbackImages.length] : src;
              return (
                <div key={idx} className="relative overflow-hidden rounded-xl border border-border/50 group">
                  <img
                    src={displaySrc}
                    alt={`Property view ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const fallback = fallbackImages[idx % fallbackImages.length];
                      img.onerror = null; // prevent infinite loop if fallback fails
                      img.src = fallback;
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Market Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 mb-8">
          <Card className="glass p-6 border-border/50 shadow-elegant">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Market Trends</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(marketTrends).map(([timeframe, data]) => (
                <div
                  key={timeframe}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTimeframe === timeframe
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTimeframe(timeframe)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {timeframe === "1year" ? "1 Year" : timeframe === "3years" ? "3 Years" : "5 Years"}
                    </span>
                    <div className="flex items-center gap-2">
                      {data.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className={`font-semibold ${data.direction === "up" ? "text-success" : "text-destructive"}`}>
                        +{data.change}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Projected: {convertAndFormatUSD(data.price * MULTIPLIER, country)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Valuation Factors */}
          <Card className="glass p-6 border-border/50 shadow-elegant">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Valuation Factors</h3>
            </div>
            
            <div className="space-y-4">
              {factors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{factor.name}</span>
                    <span className="text-sm font-semibold text-primary">{factor.value}%</span>
                  </div>
                  <Progress value={factor.value} className="h-2" />
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparable Properties */}
        <Card className="glass p-6 border-border/50 shadow-elegant">
          <div className="flex items-center gap-2 mb-6">
            <Home className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Comparable Properties</h3>
          </div>
          {/* Price Range Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Min Price</div>
              <Input
                type="number"
                className="h-10"
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value) || 0, priceMax))}
                min={0}
              />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Max Price</div>
              <Input
                type="number"
                className="h-10"
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value) || 0, priceMin))}
                min={0}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Selected: <span className="text-foreground font-medium">{formatCurrency(priceMin, country)} - {formatCurrency(priceMax, country)}</span></div>
              <div className="mt-1">Range in data: {formatCurrency(compMin, country)} - {formatCurrency(compMax, country)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredComps.map((property, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all card-premium"
              >
                <div className="mb-3">
                  <h4 className="font-medium text-foreground mb-1">{property.address}</h4>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(property.price, country)}
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Square Feet:</span>
                    <span className="text-foreground">{property.sqft.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bed/Bath:</span>
                    <span className="text-foreground">{property.bedrooms}/{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sold:</span>
                    <span className="text-foreground">{property.soldDate}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="text-sm px-3 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() =>
                      saveProperty({
                        id: `${property.address}-${property.price}`,
                        price: property.price,
                        address: property.address,
                        sqft: property.sqft,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        soldDate: property.soldDate,
                      })
                    }
                  >
                    Save Property
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            className="btn-premium h-12 px-8"
            onClick={() => toast({ title: "Downloading report", description: "Your PDF will be generated shortly." })}
          >
            Download Full Report
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => {
              window.location.href = "mailto:info@valura.com?subject=Schedule%20Consultation";
            }}
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};