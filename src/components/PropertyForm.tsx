import { useState } from "react";
import { Home, MapPin, Ruler, Bed, Bath, Calendar, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type PropertyDetails = {
  address: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  lotSize: string;
  yearBuilt: string;
  condition: string;
  features: string;
};

export const PropertyForm = ({ onSubmit }: { onSubmit?: (data: PropertyDetails) => void }) => {
  const [formData, setFormData] = useState<PropertyDetails>({
    address: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    lotSize: "",
    yearBuilt: "",
    condition: "",
    features: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) {
      toast({ title: "Address required", description: "Please enter the property address." });
      return;
    }
    toast({ title: "Valuation ready", description: "Scroll to see results." });
    onSubmit?.(formData);
    const el = document.querySelector('#valuation-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL hash without full navigation
      try {
        const url = new URL(window.location.href);
        url.hash = 'valuation-results';
        window.history.replaceState({}, '', url.toString());
      } catch {}
      // Optional: focus for accessibility
      setTimeout(() => (el as HTMLElement).focus?.(), 300);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Property Details
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Provide detailed information about your property to get the most accurate 
            valuation and market prediction.
          </p>
        </div>

        <Card className="glass p-8 border-border/50 shadow-elegant">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Location</h3>
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Property Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street, City, State, ZIP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            {/* Property Type & Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Property Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType" className="text-sm font-medium text-foreground">
                    Property Type
                  </Label>
                  <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family Home</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="mansion">Mansion</SelectItem>
                      <SelectItem value="land">Land/Lot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearBuilt" className="text-sm font-medium text-foreground">
                    Year Built
                  </Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    placeholder="e.g., 1995"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Property Specifications</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bedrooms" className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    Bedrooms
                  </Label>
                  <Select value={formData.bedrooms} onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                      <SelectItem value="7+">7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms" className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    Bathrooms
                  </Label>
                  <Select value={formData.bathrooms} onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="squareFootage" className="text-sm font-medium text-foreground">
                    Square Footage
                  </Label>
                  <Input
                    id="squareFootage"
                    type="number"
                    placeholder="e.g., 2500"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="lotSize" className="text-sm font-medium text-foreground">
                    Lot Size (sq ft)
                  </Label>
                  <Input
                    id="lotSize"
                    type="number"
                    placeholder="e.g., 8000"
                    value={formData.lotSize}
                    onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>

            {/* Property Condition */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Property Condition</h3>
              </div>
              
              <div>
                <Label htmlFor="condition" className="text-sm font-medium text-foreground">
                  Overall Condition
                </Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Move-in ready</SelectItem>
                    <SelectItem value="good">Good - Minor updates needed</SelectItem>
                    <SelectItem value="fair">Fair - Some renovations required</SelectItem>
                    <SelectItem value="poor">Poor - Major renovations needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Additional Features</h3>
              </div>
              
              <div>
                <Label htmlFor="features" className="text-sm font-medium text-foreground">
                  Special Features (optional)
                </Label>
                <Textarea
                  id="features"
                  placeholder="e.g., Pool, garage, fireplace, recent renovations, premium appliances..."
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button type="submit" className="btn-premium w-full h-14 text-lg font-semibold">
                <DollarSign className="mr-2 h-5 w-5" />
                Get Property Valuation
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
};