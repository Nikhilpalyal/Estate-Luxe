// TOP OF FILE (replace your current import)
import { predictPrice } from "@/api";



import React, { useState } from "react";


export default function Predict() {
  const [sqft, setSqft] = useState(1800);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [year, setYear] = useState(2010);
  const [neighborhood, setNeighborhood] = useState("CollgCr");
  const [msZoning, setMsZoning] = useState("RL");
  const [houseStyle, setHouseStyle] = useState("2Story");

  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<any>(null);

  const go = async () => {
    setLoading(true);
    try {
      const payload = {
  Id: 1,
  LotArea: Number(sqft),
  BedroomAbvGr: Number(bedrooms),
  FullBath: Number(bathrooms),
  OverallQual: 5,
  YearBuilt: Number(year),
  GrLivArea: Number(sqft),
  TotRmsAbvGrd: Number(bedrooms) + Number(bathrooms) + 2,
  HalfBath: 0,
  GarageCars: 1,
  GarageArea: 200,
  YearRemodAdd: Number(year),
  KitchenAbvGr: 1,
  Fireplaces: 0,
  MoSold: 6,
  YrSold: 2008,
};

      const res = await predictPrice(payload);
      setOut(res);
    } catch (e) {
      console.error(e);
      alert("Prediction failed. Is backend running on 127.0.0.1:8000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Predict (FastAPI)</h1>

      <div className="grid gap-3 max-w-md">
        <label className="grid gap-1">
          <span>Sq Ft (GrLivArea)</span>
          <input className="border p-2 rounded text-black" type="number" value={sqft} onChange={e=>setSqft(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Bedrooms</span>
          <input className="border p-2 rounded text-black" type="number" value={bedrooms} onChange={e=>setBedrooms(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Bathrooms (FullBath)</span>
          <input className="border p-2 rounded text-black" type="number" value={bathrooms} onChange={e=>setBathrooms(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Year Built</span>
          <input className="border p-2 rounded text-black" type="number" value={year} onChange={e=>setYear(+e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Neighborhood</span>
          <input className="border p-2 rounded text-black" value={neighborhood} onChange={e=>setNeighborhood(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>MSZoning</span>
          <input className="border p-2 rounded text-black" value={msZoning} onChange={e=>setMsZoning(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>HouseStyle</span>
          <input className="border p-2 rounded text-black" value={houseStyle} onChange={e=>setHouseStyle(e.target.value)} />
        </label>

        <button onClick={go} disabled={loading} className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded">
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {out && (
        <div className="mt-6 p-4 rounded border border-gray-700 bg-gray-900">
          <div>Price (USD): ${Math.round(out.price_usd).toLocaleString("en-US")}</div>
          <div>Price (INR): ₹{Math.round(out.price_inr).toLocaleString("en-IN")}</div>
          <div className="text-xs text-gray-400 mt-2">Source: {out.source ?? "unknown"}</div>
        </div>
      )}
    </div>
  );
}
