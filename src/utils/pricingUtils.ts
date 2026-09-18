/**
 * Smart Pricing & Logistics Fee Calculation Utility
 * Handles realistic prorated logistics, collection, QC, and platform escrow fees
 * for everything from 1 Kg consumer retail orders to 500 Ton bulk industrial orders.
 */

export interface OrderFeeBreakdown {
  produceAmount: number;
  platformFee: number;
  collectionFee: number;
  logisticsFee: number;
  logisticsLabel: string;
  totalPayable: number;
  farmerPayout: number;
  effectiveKg: number;
}

export function calculateOrderFees(
  quantity: number,
  pricePerUnit: number,
  unit: string = 'Quintals'
): OrderFeeBreakdown {
  const safeQty = Math.max(0.1, Number(quantity) || 1);
  const safePrice = Math.max(0, Number(pricePerUnit) || 0);

  const produceAmount = Math.round(safeQty * safePrice);
  
  // Normalized weight in Kilograms
  let effectiveKg = safeQty;
  const unitLower = (unit || '').toLowerCase();

  if (unitLower.includes('ton')) {
    effectiveKg = safeQty * 1000;
  } else if (unitLower.includes('quintal') || unitLower.includes('qtl')) {
    effectiveKg = safeQty * 100;
  } else if (unitLower.includes('crate') || unitLower.includes('bag') || unitLower.includes('box')) {
    effectiveKg = safeQty * 25; // Standard 25kg packaging
  } else {
    // Default unit is Kg
    effectiveKg = safeQty;
  }

  // Fair & Tiered Logistics Rates
  let logisticsFee = 35;
  let logisticsLabel = 'Local Hub Courier (2-Wheeler / EV)';

  if (effectiveKg <= 5) {
    // 1 - 5 Kg Micro Consumer Order (₹35 base)
    logisticsFee = 35;
    logisticsLabel = 'Local Eco Express (2-Wheeler / Hub)';
  } else if (effectiveKg <= 15) {
    // 6 - 15 Kg Consumer / Household (₹45 - ₹60)
    logisticsFee = Math.round(35 + (effectiveKg - 5) * 2.5);
    logisticsLabel = 'Local Express Hub Delivery';
  } else if (effectiveKg <= 50) {
    // 16 - 50 Kg Small Retail / Farm-to-Kitchen (₹70 - ₹150)
    logisticsFee = Math.round(60 + (effectiveKg - 15) * 2.5);
    logisticsLabel = 'Express Cargo Delivery (EV Van)';
  } else if (effectiveKg <= 250) {
    // 51 - 250 Kg (0.5 to 2.5 Quintals)
    logisticsFee = Math.round(150 + (effectiveKg - 50) * 1.4);
    logisticsLabel = 'LCV / Mini Cargo Freight';
  } else if (effectiveKg <= 1000) {
    // 251 - 1,000 Kg (2.5 to 10 Quintals / 1 Ton)
    logisticsFee = Math.round(450 + (effectiveKg - 250) * 1.2);
    logisticsLabel = 'Dedicated Tempo / LCV Freight';
  } else if (effectiveKg <= 5000) {
    // 1 - 5 Tons Commercial Reefer
    logisticsFee = Math.round(1800 + (effectiveKg - 1000) * 0.55);
    logisticsLabel = 'Reefer Logistics & Telemetry (GPS Van)';
  } else {
    // Heavy Freight (> 5 Tons)
    logisticsFee = Math.min(9500, Math.round(4200 + (effectiveKg - 5000) * 0.4));
    logisticsLabel = 'Heavy Multi-Axle Commercial Freight';
  }

  // QC & Hub Consolidation Fee: 1% (min ₹1)
  const collectionFee = Math.max(1, Math.round(produceAmount * 0.01));

  // Platform Fee: 1.5% (min ₹1)
  const platformFee = Math.max(1, Math.round(produceAmount * 0.015));

  // Total amount payable by the buyer (Escrow Locked)
  const totalPayable = produceAmount + platformFee + collectionFee + logisticsFee;

  // Farmer payout (Produce cost minus standard 1.5% tech facilitation)
  const farmerPayout = Math.max(0, produceAmount - platformFee);

  return {
    produceAmount,
    platformFee,
    collectionFee,
    logisticsFee,
    logisticsLabel,
    totalPayable,
    farmerPayout,
    effectiveKg
  };
}
