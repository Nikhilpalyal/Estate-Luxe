import { Navigation } from "@/components/Navigation";
import { PropertyHero } from "@/components/PropertyHero";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketInsights } from "@/components/MarketInsights";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const saveProperty = (p: { id: string; img?: string; price?: string; address?: string; details?: string }) => {
    try {
      const arr = JSON.parse(localStorage.getItem("saved:properties") || "[]");
      const next = Array.isArray(arr) ? arr : [];
      // prevent duplicates by id
      if (!next.find((x: any) => x.id === p.id)) {
        next.push(p);
        localStorage.setItem("saved:properties", JSON.stringify(next));
        toast({ title: "Saved", description: "Property saved to your profile." });
      } else {
        toast({ title: "Already saved", description: "This property is already in Saved properties." });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        <section id="home">
          <PropertyHero />
        </section>

        {/* Section Heading: Features (gold theme) */}
        <div className="pt-8">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-center">
            <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent tracking-wide">
              FEATURES
            </span>
          </h2>
        </div>

        {/* Quick Links to Features */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[ 
              { title: "Valuation", desc: "Estimate property value", href: "/valuation" },
              { title: "Insights", desc: "Explore market trends", href: "/insights" },
              { title: "Calculator", desc: "Analyze investments", href: "/calculator" },
              { title: "Contact", desc: "Talk to our team", href: "/contact" },
            ].map((item) => (
              <a key={item.title} href={item.href} className="block group">
                <Card className="glass p-6 h-full border-border/50 hover:border-primary/50 transition-colors">
                  <div className="text-lg font-semibold mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                  <div className="mt-4 text-primary text-sm group-hover:underline">Go to {item.title}</div>
                </Card>
              </a>
            ))}
          </div>
        </section>

        {/* Market Insights */}
        <section className="py-16" id="insights">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">Market Insights</h2>
            <MarketInsights />
          </div>
        </section>

        {/* Market Insight (Summary) */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Median Price (30d)", value: "$485,000", hint: "City-wide median" },
              { title: "YoY Change", value: "+8.5%", hint: "Annual growth" },
              { title: "Inventory Level", value: "Low", hint: "Seller's market" },
              { title: "Days on Market", value: "21", hint: "Avg. DOM" },
            ].map((it, i) => (
              <Card key={i} className="glass p-6 h-full border-border/50">
                <div className="text-sm text-muted-foreground">{it.title}</div>
                <div className="text-2xl font-semibold mt-1 text-foreground">{it.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{it.hint}</div>
                <a href="/insights" className="inline-block mt-4 text-sm text-primary hover:underline">Go to Insights</a>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 bg-gradient-to-br from-background to-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">Featured Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
                  price: "$920,000",
                  address: "125 Palm Avenue, Downtown",
                  details: "4 Bed • 3 Bath • 2,400 sqft",
                },
                {
                  img: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
                  price: "$1,250,000",
                  address: "88 Lakeview Drive, West Bay",
                  details: "5 Bed • 4 Bath • 3,100 sqft",
                },
                {
                  img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
                  price: "$675,000",
                  address: "42 Maple Street, Suburbia",
                  details: "3 Bed • 2 Bath • 1,900 sqft",
                },
              ].map((p, i) => (
                <Card key={i} className="overflow-hidden border-border/50">
                  <div className="relative h-48 overflow-hidden">
                    <img src={p.img} alt={p.address} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="text-2xl font-bold text-primary">{p.price}</div>
                    <div className="text-foreground mt-1 font-medium">{p.address}</div>
                    <div className="text-sm text-muted-foreground mt-1">{p.details}</div>
                    <div className="mt-4 flex gap-3">
                      <a href="/valuation">
                        <Button size="sm" className="btn-premium">Get Valuation</Button>
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() =>
                          saveProperty({
                            id: `${p.address}-${p.price}`,
                            img: p.img,
                            price: p.price,
                            address: p.address,
                            details: p.details,
                          })
                        }
                      >
                        Save Property
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "AI-Powered Accuracy", desc: "Modern valuation model with confidence scoring and live market signals." },
                { title: "Comprehensive Insights", desc: "Trends, comps, and neighborhood stats in a single, elegant report." },
                { title: "Investor Tools", desc: "Built-in calculators to forecast returns and cash flow with ease." },
              ].map((f, i) => (
                <Card key={i} className="p-6 border-border/50">
                  <div className="text-lg font-semibold">{f.title}</div>
                  <div className="text-sm text-muted-foreground mt-2">{f.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">What Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "The valuation was spot on and helped us negotiate confidently.", author: "Aarav S." },
                { quote: "Clear insights and a beautiful report — highly recommend!", author: "Mia K." },
                { quote: "Loved the interface and the speed. Great experience.", author: "James L." },
              ].map((t, i) => (
                <Card key={i} className="p-6 border-border/50">
                  <div className="text-foreground/90">“{t.quote}”</div>
                  <div className="text-sm text-muted-foreground mt-3">— {t.author}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <Card className="p-8 glass border-border/50 text-center">
              <h3 className="text-2xl font-semibold">Ready to discover your property’s true value?</h3>
              <p className="text-muted-foreground mt-2">Run a valuation in minutes and get an elegant, shareable report.</p>
              <div className="mt-6 flex justify-center gap-3">
                <a href="/valuation">
                  <Button className="btn-premium px-8">Start Valuation</Button>
                </a>
                <a href="/insights">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">View Insights</Button>
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Band */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { k: "Valuations Run", v: "12,450+" },
              { k: "Avg. Confidence", v: "90%" },
              { k: "Markets Covered", v: "50+" },
              { k: "Happy Clients", v: "9,800+" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-muted/20 p-5">
                <div className="text-2xl font-bold bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.k}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, title: "Enter Details", desc: "Provide address and property specs to kickstart the valuation." },
                { step: 2, title: "AI Valuation", desc: "Our model analyzes comps, trends, and features." },
                { step: 3, title: "Get Insights", desc: "Download your report and explore market dynamics." },
              ].map((x) => (
                <Card key={x.step} className="p-6 border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary text-background flex items-center justify-center font-bold">{x.step}</div>
                  <div className="mt-4 text-lg font-semibold">{x.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{x.desc}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-12 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">Our Partners</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center text-muted-foreground text-sm">
                  Logo {i + 1}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-display font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How accurate are valuations?", a: "We combine comparable sales, market trends, and property features to achieve around 90% confidence on average." },
                { q: "Do I need an account?", a: "You can run a quick valuation without signing in; creating an account unlocks saving and sharing." },
                { q: "Which markets are supported?", a: "We currently support major cities across IN, US, EU, UK, and AE." },
              ].map((f, i) => (
                <Card key={i} className="p-5 border-border/50">
                  <div className="font-semibold">{f.q}</div>
                  <div className="text-sm text-muted-foreground mt-1">{f.a}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-to-br from-background to-muted/10">
          <div className="max-w-3xl mx-auto px-4">
            <Card className="p-6 border-border/50 text-center">
              <h3 className="text-2xl font-semibold">Stay on top of the market</h3>
              <p className="text-muted-foreground mt-1">Get weekly insights and updates from Estate Luxe.</p>
              <form className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Input type="email" placeholder="your@email.com" className="h-11 max-w-md" required />
                <Button type="submit" className="btn-premium h-11 px-6">Subscribe</Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
