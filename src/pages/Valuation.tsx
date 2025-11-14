import { Navigation } from "@/components/Navigation";
import { PropertyForm, type PropertyDetails } from "@/components/PropertyForm";
import { ValuationResults, type ValuationInput } from "@/components/ValuationResults";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const ValuationPage = () => {
  const [valuationInput, setValuationInput] = useState<ValuationInput | undefined>(undefined);
  const handleFormSubmit = (data: PropertyDetails) => {
    setValuationInput({
      address: data.address,
      sqft: Number(data.squareFootage) || undefined,
      bedrooms: Number(data.bedrooms) || undefined,
      bathrooms: Number(data.bathrooms) || undefined,
      yearBuilt: Number(data.yearBuilt) || undefined,
      propertyType: data.propertyType || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section id="valuation">
          <PropertyForm onSubmit={handleFormSubmit} />
          <ValuationResults input={valuationInput} stickyHeader={false} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ValuationPage;


