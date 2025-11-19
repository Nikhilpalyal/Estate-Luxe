// src/api.ts
import { PropertyDetails } from "@/components/PropertyForm";

// Use environment variable if provided; otherwise default to localhost:8000 so
// development works even if .env wasn't loaded or the dev server wasn't restarted.
export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"; // e.g. http://127.0.0.1:8000

export type PredictBody = Record<string, any>; // Full feature set for the model

function mapConditionToQuality(condition: string): number {
  switch (condition.toLowerCase()) {
    case "excellent": return 10;
    case "good": return 7;
    case "fair": return 5;
    case "poor": return 3;
    default: return 5;
  }
}

export function transformPropertyDetails(details: PropertyDetails): Record<string, any> {
  const bedrooms = parseInt(details.bedrooms) || 3;
  const bathrooms = parseFloat(details.bathrooms) || 2;
  const sqft = parseInt(details.squareFootage) || 2000;
  const lotSize = parseInt(details.lotSize) || sqft * 1.5; // Estimate lot size
  const yearBuilt = parseInt(details.yearBuilt) || 2000;
  const fullBath = Math.floor(bathrooms);
  const halfBath = bathrooms % 1 >= 0.5 ? 1 : 0;
  const overallQual = mapConditionToQuality(details.condition);

  // Base features from form
  const baseFeatures: Record<string, any> = {
    Id: Math.floor(Math.random() * 1000000),
    MSSubClass: 60, // 2-STORY 1946 & NEWER (common default)
    LotFrontage: Math.sqrt(lotSize / 1.5) || 70, // Estimate frontage
    LotArea: lotSize,
    OverallQual: overallQual,
    OverallCond: 5, // Average condition
    YearBuilt: yearBuilt,
    YearRemodAdd: yearBuilt,
    MasVnrArea: 0,
    BsmtFinSF1: 0,
    BsmtFinSF2: 0,
    BsmtUnfSF: sqft * 0.3, // Estimate basement
    TotalBsmtSF: sqft * 0.3,
    "1stFlrSF": sqft * 0.6,
    "2ndFlrSF": sqft * 0.4,
    LowQualFinSF: 0,
    GrLivArea: sqft,
    BsmtFullBath: 0,
    BsmtHalfBath: 0,
    FullBath: fullBath,
    HalfBath: halfBath,
    BedroomAbvGr: bedrooms,
    KitchenAbvGr: 1,
    TotRmsAbvGrd: bedrooms + fullBath + halfBath + 1,
    Fireplaces: 0,
    GarageYrBlt: yearBuilt,
    GarageCars: 2, // Assume 2 car garage
    GarageArea: 500, // Average garage area
    WoodDeckSF: 0,
    OpenPorchSF: 0,
    EnclosedPorch: 0,
    "3SsnPorch": 0,
    ScreenPorch: 0,
    PoolArea: 0,
    MiscVal: 0,
    MoSold: new Date().getMonth() + 1,
    YrSold: new Date().getFullYear(),
  };

  // Categorical features - set defaults for common residential property
  const categoricalDefaults: Record<string, any> = {
    // MSZoning: Residential Low Density
    "MSZoning_C (all)": 0,
    "MSZoning_FV": 0,
    "MSZoning_RH": 0,
    "MSZoning_RL": 1,
    "MSZoning_RM": 0,
    // Street: Paved
    "Street_Grvl": 0,
    "Street_Pave": 1,
    // Alley: No alley
    "Alley_Grvl": 0,
    "Alley_Pave": 0,
    // LotShape: Regular
    "LotShape_IR1": 0,
    "LotShape_IR2": 0,
    "LotShape_IR3": 0,
    "LotShape_Reg": 1,
    // LandContour: Level
    "LandContour_Bnk": 0,
    "LandContour_HLS": 0,
    "LandContour_Low": 0,
    "LandContour_Lvl": 1,
    // Utilities: All public
    "Utilities_AllPub": 1,
    "Utilities_NoSeWa": 0,
    // LotConfig: Inside
    "LotConfig_Corner": 0,
    "LotConfig_CulDSac": 0,
    "LotConfig_FR2": 0,
    "LotConfig_FR3": 0,
    "LotConfig_Inside": 1,
    // LandSlope: Gentle
    "LandSlope_Gtl": 1,
    "LandSlope_Mod": 0,
    "LandSlope_Sev": 0,
    // Neighborhood: Assume NAmes (North Ames - common)
    "Neighborhood_Blmngtn": 0,
    "Neighborhood_Blueste": 0,
    "Neighborhood_BrDale": 0,
    "Neighborhood_BrkSide": 0,
    "Neighborhood_ClearCr": 0,
    "Neighborhood_CollgCr": 0,
    "Neighborhood_Crawfor": 0,
    "Neighborhood_Edwards": 0,
    "Neighborhood_Gilbert": 0,
    "Neighborhood_IDOTRR": 0,
    "Neighborhood_MeadowV": 0,
    "Neighborhood_Mitchel": 0,
    "Neighborhood_NAmes": 1,
    "Neighborhood_NPkVill": 0,
    "Neighborhood_NWAmes": 0,
    "Neighborhood_NoRidge": 0,
    "Neighborhood_NridgHt": 0,
    "Neighborhood_OldTown": 0,
    "Neighborhood_SWISU": 0,
    "Neighborhood_Sawyer": 0,
    "Neighborhood_SawyerW": 0,
    "Neighborhood_Somerst": 0,
    "Neighborhood_StoneBr": 0,
    "Neighborhood_Timber": 0,
    "Neighborhood_Veenker": 0,
    // Condition1: Normal
    "Condition1_Artery": 0,
    "Condition1_Feedr": 0,
    "Condition1_Norm": 1,
    "Condition1_PosA": 0,
    "Condition1_PosN": 0,
    "Condition1_RRAe": 0,
    "Condition1_RRAn": 0,
    "Condition1_RRNe": 0,
    "Condition1_RRNn": 0,
    // Condition2: Normal
    "Condition2_Artery": 0,
    "Condition2_Feedr": 0,
    "Condition2_Norm": 1,
    "Condition2_PosA": 0,
    "Condition2_PosN": 0,
    "Condition2_RRAe": 0,
    "Condition2_RRAn": 0,
    "Condition2_RRNn": 0,
    // BldgType: 1Fam
    "BldgType_1Fam": 1,
    "BldgType_2fmCon": 0,
    "BldgType_Duplex": 0,
    "BldgType_Twnhs": 0,
    "BldgType_TwnhsE": 0,
    // HouseStyle: 2Story
    "HouseStyle_1.5Fin": 0,
    "HouseStyle_1.5Unf": 0,
    "HouseStyle_1Story": 0,
    "HouseStyle_2.5Fin": 0,
    "HouseStyle_2.5Unf": 0,
    "HouseStyle_2Story": 1,
    "HouseStyle_SFoyer": 0,
    "HouseStyle_SLvl": 0,
    // RoofStyle: Gable
    "RoofStyle_Flat": 0,
    "RoofStyle_Gable": 1,
    "RoofStyle_Gambrel": 0,
    "RoofStyle_Hip": 0,
    "RoofStyle_Mansard": 0,
    "RoofStyle_Shed": 0,
    // RoofMatl: CompShg
    "RoofMatl_ClyTile": 0,
    "RoofMatl_CompShg": 1,
    "RoofMatl_Membran": 0,
    "RoofMatl_Metal": 0,
    "RoofMatl_Roll": 0,
    "RoofMatl_Tar&Grv": 0,
    "RoofMatl_WdShake": 0,
    "RoofMatl_WdShngl": 0,
    // Exterior1st: VinylSd
    "Exterior1st_AsbShng": 0,
    "Exterior1st_AsphShn": 0,
    "Exterior1st_BrkComm": 0,
    "Exterior1st_BrkFace": 0,
    "Exterior1st_CBlock": 0,
    "Exterior1st_CemntBd": 0,
    "Exterior1st_HdBoard": 0,
    "Exterior1st_ImStucc": 0,
    "Exterior1st_MetalSd": 0,
    "Exterior1st_Plywood": 0,
    "Exterior1st_Stone": 0,
    "Exterior1st_Stucco": 0,
    "Exterior1st_VinylSd": 1,
    "Exterior1st_Wd Sdng": 0,
    "Exterior1st_WdShing": 0,
    // Exterior2nd: VinylSd
    "Exterior2nd_AsbShng": 0,
    "Exterior2nd_AsphShn": 0,
    "Exterior2nd_Brk Cmn": 0,
    "Exterior2nd_BrkFace": 0,
    "Exterior2nd_CBlock": 0,
    "Exterior2nd_CmentBd": 0,
    "Exterior2nd_HdBoard": 0,
    "Exterior2nd_ImStucc": 0,
    "Exterior2nd_MetalSd": 0,
    "Exterior2nd_Other": 0,
    "Exterior2nd_Plywood": 0,
    "Exterior2nd_Stone": 0,
    "Exterior2nd_Stucco": 0,
    "Exterior2nd_VinylSd": 1,
    "Exterior2nd_Wd Sdng": 0,
    "Exterior2nd_Wd Shng": 0,
    // MasVnrType: None (not set)
    "MasVnrType_BrkCmn": 0,
    "MasVnrType_BrkFace": 0,
    "MasVnrType_Stone": 0,
    // ExterQual: TA (Typical/Average)
    "ExterQual_Ex": 0,
    "ExterQual_Fa": 0,
    "ExterQual_Gd": 0,
    "ExterQual_TA": 1,
    // ExterCond: TA
    "ExterCond_Ex": 0,
    "ExterCond_Fa": 0,
    "ExterCond_Gd": 0,
    "ExterCond_Po": 0,
    "ExterCond_TA": 1,
    // Foundation: PConc
    "Foundation_BrkTil": 0,
    "Foundation_CBlock": 0,
    "Foundation_PConc": 1,
    "Foundation_Slab": 0,
    "Foundation_Stone": 0,
    "Foundation_Wood": 0,
    // BsmtQual: TA
    "BsmtQual_Ex": 0,
    "BsmtQual_Fa": 0,
    "BsmtQual_Gd": 0,
    "BsmtQual_TA": 1,
    // BsmtCond: TA
    "BsmtCond_Fa": 0,
    "BsmtCond_Gd": 0,
    "BsmtCond_Po": 0,
    "BsmtCond_TA": 1,
    // BsmtExposure: No
    "BsmtExposure_Av": 0,
    "BsmtExposure_Gd": 0,
    "BsmtExposure_Mn": 0,
    "BsmtExposure_No": 1,
    // BsmtFinType1: Unf
    "BsmtFinType1_ALQ": 0,
    "BsmtFinType1_BLQ": 0,
    "BsmtFinType1_GLQ": 0,
    "BsmtFinType1_LwQ": 0,
    "BsmtFinType1_Rec": 0,
    "BsmtFinType1_Unf": 1,
    // BsmtFinType2: Unf
    "BsmtFinType2_ALQ": 0,
    "BsmtFinType2_BLQ": 0,
    "BsmtFinType2_GLQ": 0,
    "BsmtFinType2_LwQ": 0,
    "BsmtFinType2_Rec": 0,
    "BsmtFinType2_Unf": 1,
    // Heating: GasA
    "Heating_Floor": 0,
    "Heating_GasA": 1,
    "Heating_GasW": 0,
    "Heating_Grav": 0,
    "Heating_OthW": 0,
    "Heating_Wall": 0,
    // HeatingQC: Ex
    "HeatingQC_Ex": 1,
    "HeatingQC_Fa": 0,
    "HeatingQC_Gd": 0,
    "HeatingQC_Po": 0,
    "HeatingQC_TA": 0,
    // CentralAir: Y
    "CentralAir_N": 0,
    "CentralAir_Y": 1,
    // Electrical: SBrkr
    "Electrical_FuseA": 0,
    "Electrical_FuseF": 0,
    "Electrical_FuseP": 0,
    "Electrical_Mix": 0,
    "Electrical_SBrkr": 1,
    // KitchenQual: TA
    "KitchenQual_Ex": 0,
    "KitchenQual_Fa": 0,
    "KitchenQual_Gd": 0,
    "KitchenQual_TA": 1,
    // Functional: Typ
    "Functional_Maj1": 0,
    "Functional_Maj2": 0,
    "Functional_Min1": 0,
    "Functional_Min2": 0,
    "Functional_Mod": 0,
    "Functional_Sev": 0,
    "Functional_Typ": 1,
    // FireplaceQu: No fireplace
    "FireplaceQu_Ex": 0,
    "FireplaceQu_Fa": 0,
    "FireplaceQu_Gd": 0,
    "FireplaceQu_Po": 0,
    "FireplaceQu_TA": 0,
    // GarageType: Attchd
    "GarageType_2Types": 0,
    "GarageType_Attchd": 1,
    "GarageType_Basment": 0,
    "GarageType_BuiltIn": 0,
    "GarageType_CarPort": 0,
    "GarageType_Detchd": 0,
    // GarageFinish: Unf
    "GarageFinish_Fin": 0,
    "GarageFinish_RFn": 0,
    "GarageFinish_Unf": 1,
    // GarageQual: TA
    "GarageQual_Ex": 0,
    "GarageQual_Fa": 0,
    "GarageQual_Gd": 0,
    "GarageQual_Po": 0,
    "GarageQual_TA": 1,
    // GarageCond: TA
    "GarageCond_Ex": 0,
    "GarageCond_Fa": 0,
    "GarageCond_Gd": 0,
    "GarageCond_Po": 0,
    "GarageCond_TA": 1,
    // PavedDrive: Y
    "PavedDrive_N": 0,
    "PavedDrive_P": 0,
    "PavedDrive_Y": 1,
    // PoolQC: No pool
    "PoolQC_Ex": 0,
    "PoolQC_Fa": 0,
    "PoolQC_Gd": 0,
    // Fence: No fence
    "Fence_GdPrv": 0,
    "Fence_GdWo": 0,
    "Fence_MnPrv": 0,
    "Fence_MnWw": 0,
    // MiscFeature: None
    "MiscFeature_Gar2": 0,
    "MiscFeature_Othr": 0,
    "MiscFeature_Shed": 0,
    "MiscFeature_TenC": 0,
    // SaleType: WD
    "SaleType_COD": 0,
    "SaleType_CWD": 0,
    "SaleType_Con": 0,
    "SaleType_ConLD": 0,
    "SaleType_ConLI": 0,
    "SaleType_ConLw": 0,
    "SaleType_New": 0,
    "SaleType_Oth": 0,
    "SaleType_WD": 1,
    // SaleCondition: Normal
    "SaleCondition_Abnorml": 0,
    "SaleCondition_AdjLand": 0,
    "SaleCondition_Alloca": 0,
    "SaleCondition_Family": 0,
    "SaleCondition_Normal": 1,
    "SaleCondition_Partial": 0,
  };

  return { ...baseFeatures, ...categoricalDefaults };
}

// ✅ use /predict (the real model), not /predict_local
export async function predictPrice(body: PredictBody) {
  const url = `${API_BASE.replace(/\/$/, "")}/predict`;
  console.log("[predictPrice] POST ->", url, body);

  // Get API key from localStorage
  let apiKey = localStorage.getItem("api_key");

  // If no API key, use demo mode for immediate functionality
  if (!apiKey) {
    console.log("[predictPrice] No API key found, using demo mode");
    return await predictPriceDemo(body);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ features_by_name: body }),
    });
  } catch (err: any) {
    // Provide a clearer error message for network failures (e.g. connection refused,
    // mixed-content blocked, or server not running).
    const message = err?.message || String(err) || "Failed to reach backend";
    console.error("[predictPrice] Network error:", message);
    throw new Error(`Failed to reach backend at ${url}: ${message}`);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "(no body)");
    throw new Error(`API ${res.status}: ${txt}`);
  }
  const data = await res.json();
  console.log("[predictPrice] RESP <-", data);
  return data; // expects { price_usd, price_inr, currency }
}

// Demo prediction function for users without API keys
async function predictPriceDemo(body: PredictBody) {
  console.log("[predictPriceDemo] Using demo mode with body:", body);

  // Simple heuristic-based prediction for demo purposes
  const sqft = body.GrLivArea || 2000;
  const bedrooms = body.BedroomAbvGr || 3;
  const bathrooms = (body.FullBath || 2) + (body.HalfBath || 0) * 0.5;
  const yearBuilt = body.YearBuilt || 2000;
  const overallQual = body.OverallQual || 5;

  // Basic calculation: base price per sqft adjusted by quality and features
  const basePerSqft = 150 + (overallQual - 5) * 20; // $150-250/sqft based on quality
  const ageAdjustment = Math.max(0, (new Date().getFullYear() - yearBuilt) * -500); // depreciate $500/year
  const bedroomAdjustment = (bedrooms - 3) * 10000; // $10k per bedroom over 3
  const bathroomAdjustment = (bathrooms - 2) * 15000; // $15k per bathroom over 2

  const estimatedPrice = (sqft * basePerSqft) + ageAdjustment + bedroomAdjustment + bathroomAdjustment;

  // Add some randomness for demo variety (±10%)
  const variance = (Math.random() - 0.5) * 0.2;
  const finalPrice = Math.max(50000, estimatedPrice * (1 + variance));

  const result = {
    price_usd: Math.round(finalPrice),
    price_inr: Math.round(finalPrice * 83), // Current USD to INR rate
    currency: "INR",
    source: "DEMO_MODE - Sign up for accurate AI predictions!"
  };

  console.log("[predictPriceDemo] Returning:", result);
  return result;
}

export async function predictPropertyPrice(details: PropertyDetails) {
  const body = transformPropertyDetails(details);
  return await predictPrice(body);
}
