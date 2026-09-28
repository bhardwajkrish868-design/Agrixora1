/**
 * Unit conversion and formatting utilities for Agrixora
 * 
 * Standard Conversions:
 * - 1 Qtl (Quintal) = 100 Kg
 * - 1 Ton (Metric Ton) = 1,000 Kg
 * - 1 Ton = 10 Qtl
 */

export type StandardUnit = 'Kg' | 'Qtl' | 'Ton';

/**
 * Normalizes any unit string to one of: 'Kg', 'Qtl', 'Ton'
 */
export function normalizeUnit(rawUnit?: string): StandardUnit {
  if (!rawUnit) return 'Kg';
  const u = rawUnit.trim().toLowerCase();
  if (u === 'ton' || u === 'tons' || u === 't' || u.includes('metric ton')) {
    return 'Ton';
  }
  if (u === 'qtl' || u === 'quintal' || u === 'quintals' || u === 'q') {
    return 'Qtl';
  }
  return 'Kg';
}

/**
 * Returns formatted unit string for display (e.g. 'Kg', 'Qtl', 'Ton')
 */
export function formatUnitLabel(rawUnit?: string): string {
  return normalizeUnit(rawUnit);
}

/**
 * Converts a quantity in any unit into Kilograms (Kg)
 */
export function toKilograms(quantity: number, rawUnit?: string): number {
  const unit = normalizeUnit(rawUnit);
  if (unit === 'Ton') return quantity * 1000;
  if (unit === 'Qtl') return quantity * 100;
  return quantity;
}

/**
 * Generates human-friendly secondary unit conversions
 * 
 * Examples:
 * - 60 Kg   -> [ "= 0.60 Qtl", "= 0.06 Ton" ]
 * - 5 Qtl   -> [ "= 500 Kg", "= 0.5 Ton" ]
 * - 2 Ton   -> [ "= 2,000 Kg", "= 20 Qtl" ]
 */
export interface UnitConversionItem {
  unit: StandardUnit;
  value: string;
}

export function getUnitConversions(quantity: number, rawUnit?: string): UnitConversionItem[] {
  const unit = normalizeUnit(rawUnit);
  const conversions: UnitConversionItem[] = [];

  if (unit === 'Kg') {
    const qtl = quantity / 100;
    const ton = quantity / 1000;
    conversions.push({
      unit: 'Qtl',
      value: `= ${qtl >= 1 && Number.isInteger(qtl) ? qtl.toString() : qtl.toFixed(2).replace(/\.?0+$/, '') || '0'} Qtl`
    });
    conversions.push({
      unit: 'Ton',
      value: `= ${ton >= 1 && Number.isInteger(ton) ? ton.toString() : ton.toFixed(3).replace(/\.?0+$/, '') || '0'} Ton`
    });
  } else if (unit === 'Qtl') {
    const kg = quantity * 100;
    const ton = quantity / 10;
    conversions.push({
      unit: 'Kg',
      value: `= ${kg.toLocaleString('en-IN')} Kg`
    });
    conversions.push({
      unit: 'Ton',
      value: `= ${ton >= 1 && Number.isInteger(ton) ? ton.toString() : ton.toFixed(2).replace(/\.?0+$/, '') || '0'} Ton`
    });
  } else if (unit === 'Ton') {
    const kg = quantity * 1000;
    const qtl = quantity * 10;
    conversions.push({
      unit: 'Kg',
      value: `= ${kg.toLocaleString('en-IN')} Kg`
    });
    conversions.push({
      unit: 'Qtl',
      value: `= ${qtl.toLocaleString('en-IN')} Qtl`
    });
  }

  return conversions;
}

/**
 * Calculates aggregated produce statistics across farmer listings
 * preserving original units or converting accurately.
 */
export function calculateProduceSummary(listings: Array<{ quantity: number; unit?: string }>) {
  if (!listings || listings.length === 0) {
    return {
      displayValue: '0 Qtl',
      totalLots: 0,
      lotSubtitle: '0 Active Crop Lots'
    };
  }

  const lotCount = listings.length;
  const lotSubtitle = `${lotCount} Active Crop Lot${lotCount === 1 ? '' : 's'}`;

  // Check unique normalized units
  const units = Array.from(new Set(listings.map(l => normalizeUnit(l.unit))));

  if (units.length === 1) {
    // All listings share the exact same unit
    const singleUnit = units[0];
    const totalQty = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);
    return {
      displayValue: `${totalQty.toLocaleString('en-IN')} ${singleUnit}`,
      totalLots: lotCount,
      lotSubtitle
    };
  }

  // Mixed units: sum total in Kg and pick most appropriate standard display
  const totalKg = listings.reduce((sum, l) => sum + toKilograms(l.quantity || 0, l.unit), 0);

  let displayValue = '';
  if (totalKg >= 1000 && totalKg % 1000 === 0) {
    displayValue = `${(totalKg / 1000).toLocaleString('en-IN')} Ton`;
  } else if (totalKg >= 100) {
    const qtl = totalKg / 100;
    displayValue = `${Number.isInteger(qtl) ? qtl.toLocaleString('en-IN') : qtl.toFixed(1)} Qtl`;
  } else {
    displayValue = `${totalKg.toLocaleString('en-IN')} Kg`;
  }

  return {
    displayValue,
    totalLots: lotCount,
    lotSubtitle
  };
}
