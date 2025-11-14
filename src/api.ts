// src/api.ts
export const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://127.0.0.1:8000

export type PredictBody = {
  Id: number;
  LotArea: number;
  BedroomAbvGr: number;
  FullBath: number;
  OverallQual: number;
  YearBuilt: number;
  GrLivArea: number;
  TotRmsAbvGrd: number;
  HalfBath: number;
  GarageCars: number;
  GarageArea: number;
  YearRemodAdd: number;
  KitchenAbvGr: number;
  Fireplaces: number;
  MoSold: number;
  YrSold: number;
};

// ✅ use /predict (the real model), not /predict_local
export async function predictPrice(body: PredictBody) {
  const url = `${API_BASE}/predict`;
  console.log("[predictPrice] POST ->", url, body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features_by_name: body }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  console.log("[predictPrice] RESP <-", data);
  return data; // expects { price_usd, price_inr, currency }
}
