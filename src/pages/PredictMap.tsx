import React, { useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ValuationResults } from "@/components/ValuationResults";
import { CountryCode, convertAndFormatUSD } from "@/lib/currency";
import { PropertyDetails } from "@/components/PropertyForm";

type PropPoint = {
  id: string;
  lat: number;
  lng: number;
  country: string;
  address: string;
  price_usd?: number;
  propertyType?: string;
  squareFootage?: number;
  yearBuilt?: number;
  bedrooms?: number;
  bathrooms?: number;
};

// Sample property points across countries — replace with real dataset as needed
const SAMPLE_POINTS: PropPoint[] = [
  // India - expanded coverage
  { id: 'in-mum', lat: 19.0760, lng: 72.8777, country: 'IN', address: 'Mumbai, Maharashtra', propertyType: 'apartment', squareFootage: 950, yearBuilt: 2014, bedrooms: 2, bathrooms: 2 },
  { id: 'in-del', lat: 28.7041, lng: 77.1025, country: 'IN', address: 'New Delhi, Delhi', propertyType: 'single-family', squareFootage: 2200, yearBuilt: 2010, bedrooms: 4, bathrooms: 3 },
  { id: 'in-blr', lat: 12.9716, lng: 77.5946, country: 'IN', address: 'Bengaluru, Karnataka', propertyType: 'condo', squareFootage: 1200, yearBuilt: 2018, bedrooms: 2, bathrooms: 2 },
  { id: 'in-hyd', lat: 17.3850, lng: 78.4867, country: 'IN', address: 'Hyderabad, Telangana', propertyType: 'single-family', squareFootage: 1800, yearBuilt: 2008, bedrooms: 3, bathrooms: 2 },
  { id: 'in-che', lat: 13.0827, lng: 80.2707, country: 'IN', address: 'Chennai, Tamil Nadu', propertyType: 'apartment', squareFootage: 1100, yearBuilt: 2016, bedrooms: 2, bathrooms: 2 },
  { id: 'in-pun', lat: 18.5204, lng: 73.8567, country: 'IN', address: 'Pune, Maharashtra', propertyType: 'apartment', squareFootage: 850, yearBuilt: 2017, bedrooms: 2, bathrooms: 2 },
  { id: 'in-kol', lat: 22.5726, lng: 88.3639, country: 'IN', address: 'Kolkata, West Bengal', propertyType: 'apartment', squareFootage: 900, yearBuilt: 2012, bedrooms: 2, bathrooms: 2 },
  { id: 'in-ahm', lat: 23.0225, lng: 72.5714, country: 'IN', address: 'Ahmedabad, Gujarat', propertyType: 'single-family', squareFootage: 1500, yearBuilt: 2006, bedrooms: 3, bathrooms: 2 },
  { id: 'in-sur', lat: 21.1702, lng: 72.8311, country: 'IN', address: 'Surat, Gujarat', propertyType: 'townhouse', squareFootage: 1400, yearBuilt: 2011, bedrooms: 3, bathrooms: 3 },
  { id: 'in-jai', lat: 26.9124, lng: 75.7873, country: 'IN', address: 'Jaipur, Rajasthan', propertyType: 'single-family', squareFootage: 2000, yearBuilt: 2004, bedrooms: 4, bathrooms: 3 },
  { id: 'in-lko', lat: 26.8467, lng: 80.9462, country: 'IN', address: 'Lucknow, Uttar Pradesh', propertyType: 'apartment', squareFootage: 1000, yearBuilt: 2015, bedrooms: 2, bathrooms: 2 },
  { id: 'in-kan', lat: 26.4499, lng: 80.3319, country: 'IN', address: 'Kanpur, Uttar Pradesh', propertyType: 'single-family', squareFootage: 1700, yearBuilt: 2009, bedrooms: 3, bathrooms: 2 },
  { id: 'in-ngp', lat: 21.1458, lng: 79.0882, country: 'IN', address: 'Nagpur, Maharashtra', propertyType: 'townhouse', squareFootage: 1300, yearBuilt: 2013, bedrooms: 3, bathrooms: 2 },
  { id: 'in-viz', lat: 17.6868, lng: 83.2185, country: 'IN', address: 'Visakhapatnam, Andhra Pradesh', propertyType: 'apartment', squareFootage: 950, yearBuilt: 2016, bedrooms: 2, bathrooms: 2 },
  { id: 'in-bpl', lat: 23.2599, lng: 77.4126, country: 'IN', address: 'Bhopal, Madhya Pradesh', propertyType: 'single-family', squareFootage: 1600, yearBuilt: 2007, bedrooms: 3, bathrooms: 2 },
  { id: 'in-pat', lat: 25.5941, lng: 85.1376, country: 'IN', address: 'Patna, Bihar', propertyType: 'apartment', squareFootage: 900, yearBuilt: 2019, bedrooms: 2, bathrooms: 1 },
  { id: 'in-vad', lat: 22.3072, lng: 73.1812, country: 'IN', address: 'Vadodara, Gujarat', propertyType: 'single-family', squareFootage: 1550, yearBuilt: 2005, bedrooms: 3, bathrooms: 2 },
  { id: 'in-ghz', lat: 28.6692, lng: 77.4538, country: 'IN', address: 'Ghaziabad, Uttar Pradesh', propertyType: 'townhouse', squareFootage: 1350, yearBuilt: 2014, bedrooms: 3, bathrooms: 2 },
  { id: 'in-lud', lat: 30.9000, lng: 75.8573, country: 'IN', address: 'Ludhiana, Punjab', propertyType: 'single-family', squareFootage: 1450, yearBuilt: 2003, bedrooms: 3, bathrooms: 2 },
  { id: 'in-agra', lat: 27.1767, lng: 78.0081, country: 'IN', address: 'Agra, Uttar Pradesh', propertyType: 'apartment', squareFootage: 850, yearBuilt: 2011, bedrooms: 2, bathrooms: 1 },
  { id: 'in-nas', lat: 19.9975, lng: 73.7898, country: 'IN', address: 'Nashik, Maharashtra', propertyType: 'apartment', squareFootage: 920, yearBuilt: 2018, bedrooms: 2, bathrooms: 2 },
  { id: 'in-fbd', lat: 28.4089, lng: 77.3178, country: 'IN', address: 'Faridabad, Haryana', propertyType: 'townhouse', squareFootage: 1500, yearBuilt: 2010, bedrooms: 3, bathrooms: 3 },
  { id: 'in-mer', lat: 28.9845, lng: 77.7064, country: 'IN', address: 'Meerut, Uttar Pradesh', propertyType: 'single-family', squareFootage: 1650, yearBuilt: 2002, bedrooms: 3, bathrooms: 2 },
  { id: 'in-raj', lat: 22.3039, lng: 70.8022, country: 'IN', address: 'Rajkot, Gujarat', propertyType: 'apartment', squareFootage: 800, yearBuilt: 2016, bedrooms: 1, bathrooms: 1 },
  { id: 'in-kdy', lat: 19.2403, lng: 73.1304, country: 'IN', address: 'Kalyan-Dombivli, Maharashtra', propertyType: 'apartment', squareFootage: 780, yearBuilt: 2015, bedrooms: 1, bathrooms: 1 },
  { id: 'in-vvs', lat: 19.3910, lng: 72.8397, country: 'IN', address: 'Vasai-Virar, Maharashtra', propertyType: 'townhouse', squareFootage: 1200, yearBuilt: 2013, bedrooms: 2, bathrooms: 2 },
  { id: 'in-var', lat: 25.3176, lng: 82.9739, country: 'IN', address: 'Varanasi, Uttar Pradesh', propertyType: 'apartment', squareFootage: 700, yearBuilt: 2009, bedrooms: 1, bathrooms: 1 },
  { id: 'in-sgr', lat: 34.0837, lng: 74.7973, country: 'IN', address: 'Srinagar, Jammu & Kashmir', propertyType: 'single-family', squareFootage: 1800, yearBuilt: 1998, bedrooms: 3, bathrooms: 2 },
  { id: 'in-coi', lat: 11.0168, lng: 76.9558, country: 'IN', address: 'Coimbatore, Tamil Nadu', propertyType: 'apartment', squareFootage: 920, yearBuilt: 2017, bedrooms: 2, bathrooms: 2 },
  { id: 'in-mad', lat: 9.9252, lng: 78.1198, country: 'IN', address: 'Madurai, Tamil Nadu', propertyType: 'apartment', squareFootage: 880, yearBuilt: 2014, bedrooms: 2, bathrooms: 1 },
  // Global expansion: Europe, Asia, Americas, Africa, Oceania
  { id: 'au-syd', lat: -33.8688, lng: 151.2093, country: 'AU', address: 'Sydney, Australia' },
  { id: 'au-mel', lat: -37.8136, lng: 144.9631, country: 'AU', address: 'Melbourne, Australia' },
  { id: 'ca-tor', lat: 43.6532, lng: -79.3832, country: 'CA', address: 'Toronto, Canada' },
  { id: 'ca-van', lat: 49.2827, lng: -123.1207, country: 'CA', address: 'Vancouver, Canada' },
  { id: 'sgp', lat: 1.3521, lng: 103.8198, country: 'SG', address: 'Singapore' },
  { id: 'jp-tok', lat: 35.6895, lng: 139.6917, country: 'JP', address: 'Tokyo, Japan' },
  { id: 'jp-osa', lat: 34.6937, lng: 135.5023, country: 'JP', address: 'Osaka, Japan' },
  { id: 'cn-sha', lat: 31.2304, lng: 121.4737, country: 'CN', address: 'Shanghai, China' },
  { id: 'cn-bj', lat: 39.9042, lng: 116.4074, country: 'CN', address: 'Beijing, China' },
  { id: 'br-sp', lat: -23.5505, lng: -46.6333, country: 'BR', address: 'São Paulo, Brazil' },
  { id: 'br-rj', lat: -22.9068, lng: -43.1729, country: 'BR', address: 'Rio de Janeiro, Brazil' },
  { id: 'za-cpt', lat: -33.9249, lng: 18.4241, country: 'ZA', address: 'Cape Town, South Africa' },
  { id: 'za-jhb', lat: -26.2041, lng: 28.0473, country: 'ZA', address: 'Johannesburg, South Africa' },
  { id: 'de-ber', lat: 52.5200, lng: 13.4050, country: 'DE', address: 'Berlin, Germany' },
  { id: 'de-fra', lat: 50.1109, lng: 8.6821, country: 'DE', address: 'Frankfurt, Germany' },
  { id: 'es-mad', lat: 40.4168, lng: -3.7038, country: 'ES', address: 'Madrid, Spain' },
  { id: 'it-mil', lat: 45.4642, lng: 9.1900, country: 'IT', address: 'Milan, Italy' },
  { id: 'fr-par', lat: 48.8566, lng: 2.3522, country: 'FR', address: 'Paris, France' },
  { id: 'ru-mow', lat: 55.7558, lng: 37.6173, country: 'RU', address: 'Moscow, Russia' },
  { id: 'tr-ist', lat: 41.0082, lng: 28.9784, country: 'TR', address: 'Istanbul, Turkey' },
  { id: 'mx-mex', lat: 19.4326, lng: -99.1332, country: 'MX', address: 'Mexico City, Mexico' },
  { id: 'id-jkt', lat: -6.2088, lng: 106.8456, country: 'ID', address: 'Jakarta, Indonesia' },
  { id: 'my-kl', lat: 3.1390, lng: 101.6869, country: 'MY', address: 'Kuala Lumpur, Malaysia' },
  { id: 'ph-man', lat: 14.5995, lng: 120.9842, country: 'PH', address: 'Manila, Philippines' },
  { id: 'th-bkk', lat: 13.7563, lng: 100.5018, country: 'TH', address: 'Bangkok, Thailand' },
  { id: 'ke-nbo', lat: -1.2864, lng: 36.8172, country: 'KE', address: 'Nairobi, Kenya' },
  { id: 'ar-bue', lat: -34.6037, lng: -58.3816, country: 'AR', address: 'Buenos Aires, Argentina' },
  { id: 'cl-scl', lat: -33.4489, lng: -70.6693, country: 'CL', address: 'Santiago, Chile' },
  { id: 'us-sf', lat: 37.7749, lng: -122.4194, country: 'US', address: 'San Francisco, USA' },
  { id: 'us-ny', lat: 40.7128, lng: -74.0060, country: 'US', address: 'New York, USA' },
  { id: 'uk-ldn', lat: 51.5074, lng: -0.1278, country: 'UK', address: 'London, UK' },
];

const COUNTRY_COLORS: Record<string, string> = {
  IN: '#E53E3E',
  US: '#3182CE',
  UK: '#805AD5',
  AE: '#DD6B20',
  EU: '#38A169',
};

export default function PredictMap() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedProperty, setSelectedProperty] = useState<PropPoint | null>(null);

  const points = useMemo(() => {
    if (filter === 'ALL') return SAMPLE_POINTS;
    return SAMPLE_POINTS.filter((p) => p.country === filter);
  }, [filter]);

  // Auto-zoom center: compute average of visible points
  const center = useMemo(() => {
    if (points.length === 0) return [20, 0] as [number, number];
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return [lat, lng] as [number, number];
  }, [points]);

  // Create a simplified red location pin DivIcon (no price label)
  const createIcon = (_p: PropPoint) => {
    const html = `
      <div class="premium-marker-root">
        <svg width="30" height="42" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C7.031 0 3 4.031 3 9c0 6.75 9 24 9 24s9-17.25 9-24c0-4.969-4.031-9-9-9z" fill="#ff4d4f"/>
          <circle cx="12" cy="9" r="4" fill="#fff"/>
        </svg>
      </div>
    `;
    return L.divIcon({ html, className: 'premium-marker-icon', iconSize: [30, 42], iconAnchor: [15, 42] });
  };

  const prettyPropertyType = (pt?: string) => {
    if (!pt) return null;
    const key = pt.toString().toLowerCase();
    const map: Record<string, string> = {
      'single-family': 'Single Family Home',
      'single family': 'Single Family Home',
      'condo': 'Condominium',
      'condominium': 'Condominium',
      'townhouse': 'Townhouse',
      'duplex': 'Duplex',
      'apartment': 'Apartment',
      'mansion': 'Mansion',
      'land': 'Land/Lot',
      'land/lot': 'Land/Lot',
    };
    return map[key] ?? (pt.charAt(0).toUpperCase() + pt.slice(1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <style>{`
        .premium-map-container { background: linear-gradient(180deg, rgba(8,10,15,0.6), rgba(6,8,12,0.6)); box-shadow: 0 14px 40px rgba(2,6,23,0.6); }
        .premium-marker-root { display:flex; align-items:center; justify-content:center; }
        /* Dark popup styling */
        .premium-popup .leaflet-popup-content-wrapper { background: linear-gradient(180deg, rgba(12,14,18,0.95), rgba(8,10,14,0.95)); border-radius:10px; box-shadow: 0 12px 40px rgba(2,6,23,0.6); color: #e6eef8; }
        .premium-popup .leaflet-popup-content-wrapper .text-sm { color: #e6eef8; }
        .premium-popup .leaflet-popup-tip { background: rgba(12,14,18,0.95); }
        .premium-marker-icon { pointer-events: auto; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6)); }
        /* Add a subtle neon glow to the pin */
        .premium-marker-icon svg path { filter: drop-shadow(0 0 6px rgba(255,77,79,0.45)); }
        .map-overlay { position: absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; background-image: linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.28)); mix-blend-mode: multiply; }
        /* Make leaflet controls match dark theme */
        .leaflet-control-zoom, .leaflet-control-zoom a { background: rgba(20,22,26,0.7); color: #e6eef8; border-radius: 8px; }
        .leaflet-control-zoom a { width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; }
      `}</style>
      <main className="pt-16">
        <section id="predict" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Predict — Map of Recent Listings</h1>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Country</label>
                <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 rounded-md bg-background/80 border border-white/10 px-2 text-sm">
                  <option value="ALL">All</option>
                  <option value="IN">India</option>
                  <option value="US">USA</option>
                  <option value="UK">UK</option>
                  <option value="AE">UAE</option>
                  <option value="EU">EU</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-border/50 premium-map-container" style={{ height: 640 }}>
              <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors' />
                <ZoomControl position="topright" />
                {points.map((p) => (
                  <Marker key={p.id} position={[p.lat, p.lng]} icon={createIcon(p)}>
                    <Popup className="premium-popup">
                      <div className="text-sm">
                        <div className="font-semibold">{p.address}</div>
                          {p.propertyType && <div className="mt-1">Type: {prettyPropertyType(p.propertyType)}</div>}
                          {p.squareFootage && <div className="mt-1">Area: {p.squareFootage} sqft</div>}
                        {(p.bedrooms || p.bathrooms) && <div className="mt-1">Bed / Bath: {p.bedrooms ?? '-'} / {p.bathrooms ?? '-'}</div>}
                        {p.yearBuilt && <div className="mt-1">Year Built: {p.yearBuilt}</div>}
                        <div className="mt-2">Price: {p.price_usd ? (
                          (['IN','US','UK','AE','EU'].includes(p.country) ? convertAndFormatUSD(p.price_usd, p.country as CountryCode) : `$${p.price_usd.toLocaleString()}`)
                        ) : 'N/A'}</div>
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedProperty(p);
                              setTimeout(() => {
                                const el = document.querySelector('#valuation-results');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 120);
                            }}
                          >
                            Predict This Property
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {/* subtle vignette overlay for premium feel */}
                <div className="map-overlay" />
              </MapContainer>
            </div>
            {/* Inline valuation panel — shows when a marker is clicked */}
            <div className="mt-8">
              {selectedProperty ? (
                <div id="valuation-results">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold">Valuation — {selectedProperty.address}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => setSelectedProperty(null)}>Close</Button>
                    </div>
                  </div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    <strong>Type:</strong> {prettyPropertyType(selectedProperty.propertyType) ?? 'N/A'} &nbsp; • &nbsp;
                    <strong>Area:</strong> {selectedProperty.squareFootage ? `${selectedProperty.squareFootage} sqft` : 'N/A'} &nbsp; • &nbsp;
                    <strong>Bed / Bath:</strong> {selectedProperty.bedrooms ?? '-'} / {selectedProperty.bathrooms ?? '-'} &nbsp; • &nbsp;
                    <strong>Year:</strong> {selectedProperty.yearBuilt ?? 'N/A'}
                  </div>
                  <ValuationResults
                    input={((): PropertyDetails => ({
                      address: selectedProperty.address,
                      propertyType: selectedProperty.propertyType ?? '',
                      bedrooms: selectedProperty.bedrooms ? String(selectedProperty.bedrooms) : '',
                      bathrooms: selectedProperty.bathrooms ? String(selectedProperty.bathrooms) : '',
                      squareFootage: selectedProperty.squareFootage ? String(selectedProperty.squareFootage) : '',
                      lotSize: '',
                      yearBuilt: selectedProperty.yearBuilt ? String(selectedProperty.yearBuilt) : '',
                      condition: '',
                      features: `Lat:${selectedProperty.lat}, Lng:${selectedProperty.lng}`,
                    }))()}
                    stickyHeader={false}
                    initialCountry={selectedProperty.country as CountryCode}
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Click a marker to see an inline property valuation.</div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
