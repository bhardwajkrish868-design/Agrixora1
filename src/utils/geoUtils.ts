/**
 * Geo-Location & 10 KM Hyper-Local Auto-Connect Utility
 * Provides built-in India agricultural coordinates database,
 * GPS live location detection, Haversine accurate distance calculation,
 * and automatic 10 km radius buyer-farmer-hub auto-pairing.
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
  name: string;
  district: string;
  state: string;
  pincode: string;
}

// Built-in Indian Agricultural Locations Database (Feeds lat/lng automatically)
export const KNOWN_AGRI_LOCATIONS: Record<string, GeoCoordinate> = {
  // Maharashtra - Nashik & Pune Agri Belt
  '422209': { lat: 20.1700, lng: 73.9800, name: 'Pimpalgaon Baswant', district: 'Nashik', state: 'Maharashtra', pincode: '422209' },
  '422003': { lat: 20.0110, lng: 73.7903, name: 'Nashik City Central', district: 'Nashik', state: 'Maharashtra', pincode: '422003' },
  '422202': { lat: 20.2000, lng: 73.8300, name: 'Dindori Farmgate Hub', district: 'Nashik', state: 'Maharashtra', pincode: '422202' },
  '422306': { lat: 20.1472, lng: 74.2281, name: 'Lasalgaon Onion Mandi', district: 'Nashik', state: 'Maharashtra', pincode: '422306' },
  '422303': { lat: 20.0800, lng: 74.1100, name: 'Niphad Grape & Grain Zone', district: 'Nashik', state: 'Maharashtra', pincode: '422303' },
  '410503': { lat: 19.0000, lng: 73.9400, name: 'Manchar / Narayangaon', district: 'Pune', state: 'Maharashtra', pincode: '410503' },
  '411001': { lat: 18.5204, lng: 73.8567, name: 'Pune City APMC', district: 'Pune', state: 'Maharashtra', pincode: '411001' },
  '400703': { lat: 19.0760, lng: 72.9980, name: 'Vashi Navi Mumbai APMC', district: 'Thane', state: 'Maharashtra', pincode: '400703' },

  // Haryana - GT Road Grain Belt
  '132001': { lat: 29.6857, lng: 76.9905, name: 'Karnal Grain Hub', district: 'Karnal', state: 'Haryana', pincode: '132001' },
  '132116': { lat: 29.8000, lng: 76.9200, name: 'Taraori Basmati Zone', district: 'Karnal', state: 'Haryana', pincode: '132116' },
  '136118': { lat: 29.9695, lng: 76.8783, name: 'Kurukshetra Agri Yard', district: 'Kurukshetra', state: 'Haryana', pincode: '136118' },
  '131001': { lat: 28.9931, lng: 77.0151, name: 'Sonipat Industrial Agri', district: 'Sonipat', state: 'Haryana', pincode: '131001' },

  // Punjab - Food Bowl
  '141001': { lat: 30.9010, lng: 75.8573, name: 'Ludhiana Central Agri Hub', district: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  '141401': { lat: 30.7071, lng: 76.2166, name: 'Khanna Asia Largest Mandi', district: 'Ludhiana', state: 'Punjab', pincode: '141401' },
  '143001': { lat: 31.6340, lng: 74.8723, name: 'Amritsar Agro Hub', district: 'Amritsar', state: 'Punjab', pincode: '143001' },

  // Uttar Pradesh - Potato & Sugar Belt
  '282001': { lat: 27.1767, lng: 78.0081, name: 'Agra Cold Storage Hub', district: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
  '202001': { lat: 27.8974, lng: 78.0880, name: 'Aligarh Iglas Potato Belt', district: 'Aligarh', state: 'Uttar Pradesh', pincode: '202001' },
  '281401': { lat: 27.4924, lng: 77.6737, name: 'Mathura Chatha Agro Zone', district: 'Mathura', state: 'Uttar Pradesh', pincode: '281401' },

  // Madhya Pradesh - Soybean & Wheat
  '452001': { lat: 22.7196, lng: 75.8577, name: 'Indore Sanwer Road Hub', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  '456001': { lat: 23.1765, lng: 75.7885, name: 'Ujjain Soy Mandi', district: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001' },
  '462001': { lat: 23.2599, lng: 77.4126, name: 'Bhopal Central Hub', district: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },

  // Karnataka & South
  '563101': { lat: 13.1367, lng: 78.1291, name: 'Kolar Tomato Market', district: 'Kolar', state: 'Karnataka', pincode: '563101' },
  '560001': { lat: 12.9716, lng: 77.5946, name: 'Bangalore Yeshwanthpur APMC', district: 'Bangalore', state: 'Karnataka', pincode: '560001' },

  // Delhi NCR
  '110033': { lat: 28.7150, lng: 77.1780, name: 'Azadpur Mandi Complex', district: 'North Delhi', state: 'Delhi', pincode: '110033' },
  '110001': { lat: 28.6139, lng: 77.2090, name: 'Central Delhi Fulfillment', district: 'New Delhi', state: 'Delhi', pincode: '110001' }
};

// Default User Center (Pimpalgaon / Nashik)
export const DEFAULT_USER_LOCATION: GeoCoordinate = KNOWN_AGRI_LOCATIONS['422209'];

/**
 * Accurate Haversine Distance Formula
 * Calculates real spherical distance in Kilometers
 */
export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 0;
  }
  
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Auto-Geocoder: Extracts coordinates by matching Location Name, PIN, or District
 */
export function geocodeLocation(
  query: string = '',
  state: string = '',
  pincode: string = ''
): GeoCoordinate {
  const cleanPin = pincode.replace(/\D/g, '');
  if (cleanPin && KNOWN_AGRI_LOCATIONS[cleanPin]) {
    return KNOWN_AGRI_LOCATIONS[cleanPin];
  }

  const combined = `${query} ${state} ${pincode}`.toLowerCase();

  for (const key of Object.keys(KNOWN_AGRI_LOCATIONS)) {
    const loc = KNOWN_AGRI_LOCATIONS[key];
    if (
      combined.includes(loc.name.toLowerCase()) ||
      combined.includes(loc.district.toLowerCase()) ||
      combined.includes(loc.pincode)
    ) {
      return loc;
    }
  }

  if (combined.includes('nashik') || combined.includes('pimpalgaon')) return KNOWN_AGRI_LOCATIONS['422209'];
  if (combined.includes('dindori')) return KNOWN_AGRI_LOCATIONS['422202'];
  if (combined.includes('lasalgaon')) return KNOWN_AGRI_LOCATIONS['422306'];
  if (combined.includes('pune') || combined.includes('manchar') || combined.includes('narayangaon')) return KNOWN_AGRI_LOCATIONS['410503'];
  if (combined.includes('mumbai') || combined.includes('vashi') || combined.includes('thane')) return KNOWN_AGRI_LOCATIONS['400703'];
  if (combined.includes('karnal') || combined.includes('taraori')) return KNOWN_AGRI_LOCATIONS['132001'];
  if (combined.includes('ludhiana') || combined.includes('khanna') || combined.includes('punjab')) return KNOWN_AGRI_LOCATIONS['141001'];
  if (combined.includes('agra') || combined.includes('aligarh') || combined.includes('mathura')) return KNOWN_AGRI_LOCATIONS['282001'];
  if (combined.includes('indore') || combined.includes('ujjain') || combined.includes('bhopal')) return KNOWN_AGRI_LOCATIONS['452001'];
  if (combined.includes('kolar') || combined.includes('bangalore') || combined.includes('karnataka')) return KNOWN_AGRI_LOCATIONS['563101'];
  if (combined.includes('delhi') || combined.includes('azadpur')) return KNOWN_AGRI_LOCATIONS['110033'];

  // Default fallback
  return DEFAULT_USER_LOCATION;
}

/**
 * 10 KM Hyper-Local Matching Engine
 * Tests if distance is within specified radius (default 10 km)
 */
export function isWithin10Km(
  userLat: number,
  userLng: number,
  targetLat?: number,
  targetLng?: number,
  maxKm: number = 10
): boolean {
  if (!targetLat || !targetLng) return false;
  const distance = calculateDistanceKm(userLat, userLng, targetLat, targetLng);
  return distance <= maxKm;
}

/**
 * Dispatch estimate based on hyper-local distance
 */
export function getHyperlocalDispatchEstimate(distanceKm: number): {
  timeMinutes: number;
  label: string;
  badgeColor: string;
  deliveryFee: number;
} {
  if (distanceKm <= 3) {
    return {
      timeMinutes: 15,
      label: '⚡ 15-Min Direct Farmgate Dispatch',
      badgeColor: 'bg-emerald-500 text-white',
      deliveryFee: 25
    };
  } else if (distanceKm <= 7) {
    return {
      timeMinutes: 25,
      label: '⚡ 25-Min Local Hub Transit',
      badgeColor: 'bg-emerald-600 text-white',
      deliveryFee: 35
    };
  } else if (distanceKm <= 10) {
    return {
      timeMinutes: 40,
      label: '⚡ 40-Min Same-Day Delivery',
      badgeColor: 'bg-teal-600 text-white',
      deliveryFee: 45
    };
  } else {
    return {
      timeMinutes: Math.round(distanceKm * 2.5),
      label: `${Math.round(distanceKm)} km Regional Freight`,
      badgeColor: 'bg-slate-700 text-white',
      deliveryFee: Math.round(50 + distanceKm * 1.5)
    };
  }
}
