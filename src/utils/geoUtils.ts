/**
 * Geo-Location & 10 KM Hyper-Local Auto-Connect Utility
 * Provides built-in India agricultural coordinates database,
 * GPS live location detection, Haversine accurate distance calculation,
 * and automatic 10 km radius buyer-farmer-hub auto-pairing.
 */

import { CollectionHub } from '../types';
import { getNearestTargetMandi } from '../data/indiaLocations';

export interface GeoCoordinate {
  lat: number;
  lng: number;
  name: string;
  district: string;
  state: string;
  pincode: string;
}

// State & UT Central Agricultural Coordinates Map (Guarantees every State resolves locally)
export const STATE_CENTROIDS: Record<string, GeoCoordinate> = {
  'Bihar': { lat: 25.5941, lng: 85.1376, name: 'Patna Central', district: 'Patna', state: 'Bihar', pincode: '800001' },
  'Maharashtra': { lat: 20.0110, lng: 73.7903, name: 'Nashik Agro Center', district: 'Nashik', state: 'Maharashtra', pincode: '422003' },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, name: 'Lucknow Central', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  'Punjab': { lat: 30.9010, lng: 75.8573, name: 'Ludhiana Central', district: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  'Haryana': { lat: 29.6857, lng: 76.9905, name: 'Karnal Central', district: 'Karnal', state: 'Haryana', pincode: '132001' },
  'Madhya Pradesh': { lat: 22.7196, lng: 75.8577, name: 'Indore Central', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  'Rajasthan': { lat: 26.9124, lng: 75.7873, name: 'Jaipur Central', district: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  'Gujarat': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad Central', district: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  'West Bengal': { lat: 22.5726, lng: 88.3639, name: 'Kolkata Central', district: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  'Karnataka': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Central', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001' },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707, name: 'Chennai Central', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  'Telangana': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad Central', district: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  'Andhra Pradesh': { lat: 16.5062, lng: 80.6480, name: 'Vijayawada Central', district: 'Krishna', state: 'Andhra Pradesh', pincode: '520001' },
  'Kerala': { lat: 9.9312, lng: 76.2673, name: 'Kochi Central', district: 'Ernakulam', state: 'Kerala', pincode: '682001' },
  'Odisha': { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar Central', district: 'Khordha', state: 'Odisha', pincode: '751001' },
  'Chhattisgarh': { lat: 21.2514, lng: 81.6296, name: 'Raipur Central', district: 'Raipur', state: 'Chhattisgarh', pincode: '492001' },
  'Jharkhand': { lat: 23.3441, lng: 85.3096, name: 'Ranchi Central', district: 'Ranchi', state: 'Jharkhand', pincode: '834001' },
  'Assam': { lat: 26.1445, lng: 91.7362, name: 'Guwahati Central', district: 'Kamrup Metropolitan', state: 'Assam', pincode: '781001' },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734, name: 'Shimla Central', district: 'Shimla', state: 'Himachal Pradesh', pincode: '171001' },
  'Uttarakhand': { lat: 30.3165, lng: 78.0322, name: 'Dehradun Central', district: 'Dehradun', state: 'Uttarakhand', pincode: '248001' },
  'Jammu and Kashmir': { lat: 32.7266, lng: 74.8570, name: 'Jammu Central', district: 'Jammu', state: 'Jammu and Kashmir', pincode: '180001' },
  'Delhi': { lat: 28.7150, lng: 77.1780, name: 'Azadpur Terminal', district: 'North Delhi', state: 'Delhi', pincode: '110033' },
  'Goa': { lat: 15.2993, lng: 74.1240, name: 'Goa Agro Center', district: 'North Goa', state: 'Goa', pincode: '403001' }
};

// Built-in Indian Agricultural Locations Database (Feeds lat/lng automatically)
export const KNOWN_AGRI_LOCATIONS: Record<string, GeoCoordinate> = {
  // 🇮🇳 Bihar - Ganga & Kosi Fertile Agricultural Belt
  '844101': { lat: 25.6858, lng: 85.2146, name: 'Vaishali / Hajipur Banana & Vegetable Belt', district: 'Vaishali', state: 'Bihar', pincode: '844101' },
  '800001': { lat: 25.5941, lng: 85.1376, name: 'Patna Central / Digha Agro Corridor', district: 'Patna', state: 'Bihar', pincode: '800001' },
  '803302': { lat: 25.3980, lng: 85.9180, name: 'Mokama Pulse & Wheat Railhead', district: 'Patna', state: 'Bihar', pincode: '803302' },
  '842001': { lat: 26.1226, lng: 85.3906, name: 'Muzaffarpur Litchi & Maize Belt', district: 'Muzaffarpur', state: 'Bihar', pincode: '842001' },
  '854301': { lat: 25.7770, lng: 87.4750, name: 'Purnea Gulabbagh Mega Maize Mandi', district: 'Purnea', state: 'Bihar', pincode: '854301' },
  '848101': { lat: 25.8629, lng: 85.7811, name: 'Samastipur Agro Center', district: 'Samastipur', state: 'Bihar', pincode: '848101' },
  '851101': { lat: 25.4182, lng: 86.1272, name: 'Begusarai Agri Complex', district: 'Begusarai', state: 'Bihar', pincode: '851101' },
  '823001': { lat: 24.7914, lng: 85.0002, name: 'Gaya Agro Yard', district: 'Gaya', state: 'Bihar', pincode: '823001' },
  '812001': { lat: 25.2425, lng: 87.0169, name: 'Bhagalpur Silk & Grain Yard', district: 'Bhagalpur', state: 'Bihar', pincode: '812001' },
  '841301': { lat: 25.7811, lng: 84.7543, name: 'Saran / Chapra Mandi', district: 'Saran', state: 'Bihar', pincode: '841301' },
  '846004': { lat: 26.1542, lng: 85.8918, name: 'Darbhanga Makhana & Grain Hub', district: 'Darbhanga', state: 'Bihar', pincode: '846004' },
  '803101': { lat: 25.2000, lng: 85.5200, name: 'Bihar Sharif / Nalanda Potato Belt', district: 'Nalanda', state: 'Bihar', pincode: '803101' },
  '821115': { lat: 24.9500, lng: 84.0100, name: 'Sasaram / Rohtas Rice Bowl', district: 'Rohtas', state: 'Bihar', pincode: '821115' },
  '845401': { lat: 26.6500, lng: 84.9200, name: 'Motihari / East Champaran Agro', district: 'East Champaran', state: 'Bihar', pincode: '845401' },

  // Maharashtra - Nashik & Pune Agri Belt
  '422209': { lat: 20.1700, lng: 73.9800, name: 'Pimpalgaon Baswant', district: 'Nashik', state: 'Maharashtra', pincode: '422209' },
  '422003': { lat: 20.0110, lng: 73.7903, name: 'Nashik City Central', district: 'Nashik', state: 'Maharashtra', pincode: '422003' },
  '422202': { lat: 20.2000, lng: 73.8300, name: 'Dindori Farmgate Hub', district: 'Nashik', state: 'Maharashtra', pincode: '422202' },
  '422306': { lat: 20.1472, lng: 74.2281, name: 'Lasalgaon Onion Mandi', district: 'Nashik', state: 'Maharashtra', pincode: '422306' },
  '422303': { lat: 20.0800, lng: 74.1100, name: 'Niphad Grape & Grain Zone', district: 'Nashik', state: 'Maharashtra', pincode: '422303' },
  '410503': { lat: 19.0000, lng: 73.9400, name: 'Manchar / Narayangaon', district: 'Pune', state: 'Maharashtra', pincode: '410503' },
  '411001': { lat: 18.5204, lng: 73.8567, name: 'Pune City APMC', district: 'Pune', state: 'Maharashtra', pincode: '411001' },
  '400703': { lat: 19.0760, lng: 72.9980, name: 'Vashi Navi Mumbai APMC', district: 'Thane', state: 'Maharashtra', pincode: '400703' },
  '440001': { lat: 21.1458, lng: 79.0882, name: 'Nagpur Orange & Soybean Hub', district: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  '416001': { lat: 16.7050, lng: 74.2433, name: 'Kolhapur Sugar & Jaggery Market', district: 'Kolhapur', state: 'Maharashtra', pincode: '416001' },

  // Haryana - GT Road Grain Belt
  '132001': { lat: 29.6857, lng: 76.9905, name: 'Karnal Grain Hub', district: 'Karnal', state: 'Haryana', pincode: '132001' },
  '132116': { lat: 29.8000, lng: 76.9200, name: 'Taraori Basmati Zone', district: 'Karnal', state: 'Haryana', pincode: '132116' },
  '136118': { lat: 29.9695, lng: 76.8783, name: 'Kurukshetra Agri Yard', district: 'Kurukshetra', state: 'Haryana', pincode: '136118' },
  '131001': { lat: 28.9931, lng: 77.0151, name: 'Sonipat Industrial Agri', district: 'Sonipat', state: 'Haryana', pincode: '131001' },
  '136027': { lat: 29.8015, lng: 76.3998, name: 'Kaithal Silo Terminal', district: 'Kaithal', state: 'Haryana', pincode: '136027' },
  '125055': { lat: 29.5349, lng: 75.0298, name: 'Sirsa Grain Yard', district: 'Sirsa', state: 'Haryana', pincode: '125055' },

  // Punjab - Food Bowl
  '141001': { lat: 30.9010, lng: 75.8573, name: 'Ludhiana Central Agri Hub', district: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  '141401': { lat: 30.7071, lng: 76.2166, name: 'Khanna Asia Largest Mandi', district: 'Ludhiana', state: 'Punjab', pincode: '141401' },
  '143001': { lat: 31.6340, lng: 74.8723, name: 'Amritsar Agro Hub', district: 'Amritsar', state: 'Punjab', pincode: '143001' },
  '148001': { lat: 30.2458, lng: 75.8421, name: 'Sangrur Grain Hub', district: 'Sangrur', state: 'Punjab', pincode: '148001' },
  '151001': { lat: 30.2110, lng: 74.9455, name: 'Bathinda Transshipment Silo', district: 'Bathinda', state: 'Punjab', pincode: '151001' },

  // Uttar Pradesh - Potato & Sugar Belt
  '282001': { lat: 27.1767, lng: 78.0081, name: 'Agra Cold Storage Hub', district: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
  '202001': { lat: 27.8974, lng: 78.0880, name: 'Aligarh Iglas Potato Belt', district: 'Aligarh', state: 'Uttar Pradesh', pincode: '202001' },
  '281401': { lat: 27.4924, lng: 77.6737, name: 'Mathura Chatha Agro Zone', district: 'Mathura', state: 'Uttar Pradesh', pincode: '281401' },
  '226001': { lat: 26.8467, lng: 80.9462, name: 'Lucknow Central Mandi', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  '221001': { lat: 25.3176, lng: 82.9739, name: 'Varanasi Cantt Agro Yard', district: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' },
  '211001': { lat: 25.4358, lng: 81.8463, name: 'Prayagraj Naini Grain Yard', district: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001' },

  // Madhya Pradesh - Soybean & Wheat
  '452001': { lat: 22.7196, lng: 75.8577, name: 'Indore Sanwer Road Hub', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  '456001': { lat: 23.1765, lng: 75.7885, name: 'Ujjain Soy Mandi', district: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001' },
  '462001': { lat: 23.2599, lng: 77.4126, name: 'Bhopal Central Hub', district: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
  '482001': { lat: 23.1815, lng: 79.9864, name: 'Jabalpur Grain Terminal', district: 'Jabalpur', state: 'Madhya Pradesh', pincode: '482001' },

  // Rajasthan
  '302001': { lat: 26.9124, lng: 75.7873, name: 'Jaipur Agro Yard', district: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  '324001': { lat: 25.1800, lng: 75.8300, name: 'Kota Chambal Grain Silo', district: 'Kota', state: 'Rajasthan', pincode: '324001' },
  '335001': { lat: 29.9038, lng: 73.8772, name: 'Sri Ganganagar Silo', district: 'Sri Ganganagar', state: 'Rajasthan', pincode: '335001' },

  // Gujarat
  '380001': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad APMC Market', district: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  '395001': { lat: 21.1702, lng: 72.8311, name: 'Surat Agro Corridor', district: 'Surat', state: 'Gujarat', pincode: '395001' },
  '360001': { lat: 22.3039, lng: 70.8022, name: 'Rajkot Cotton & Groundnut Mandi', district: 'Rajkot', state: 'Gujarat', pincode: '360001' },

  // West Bengal
  '700001': { lat: 22.5726, lng: 88.3639, name: 'Kolkata Posta Market', district: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  '712311': { lat: 22.6860, lng: 88.2910, name: 'Dankuni Freight Hub', district: 'Hooghly', state: 'West Bengal', pincode: '712311' },
  '734001': { lat: 26.7271, lng: 88.3850, name: 'Siliguri Agri Gateway', district: 'Darjeeling', state: 'West Bengal', pincode: '734001' },

  // Karnataka & South
  '563101': { lat: 13.1367, lng: 78.1291, name: 'Kolar Tomato Market', district: 'Kolar', state: 'Karnataka', pincode: '563101' },
  '560001': { lat: 12.9716, lng: 77.5946, name: 'Bangalore Yeshwanthpur APMC', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001' },

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
 * Auto-Geocoder: Extracts coordinates by matching Location Name, State, District or PIN
 * Supports both (query, state, pincode) and (query, state, district, pincode).
 */
export function geocodeLocation(
  query: string = '',
  state: string = '',
  districtOrPincode: string = '',
  maybePincode: string = ''
): GeoCoordinate {
  let district = '';
  let pincode = '';

  if (/^\d{6}$/.test(districtOrPincode.trim())) {
    pincode = districtOrPincode.trim();
    district = '';
  } else {
    district = districtOrPincode.trim();
    pincode = maybePincode.trim();
  }

  const normState = state.trim();
  const normDistrict = district.trim();
  const cleanPin = pincode.replace(/\D/g, '');

  // 1. PIN Code Match - ONLY valid if state matches or state is not specified
  if (cleanPin && KNOWN_AGRI_LOCATIONS[cleanPin]) {
    const pinLoc = KNOWN_AGRI_LOCATIONS[cleanPin];
    if (!normState || pinLoc.state.toLowerCase() === normState.toLowerCase()) {
      return pinLoc;
    }
  }

  // 2. Direct District Match within State
  if (normDistrict) {
    for (const key of Object.keys(KNOWN_AGRI_LOCATIONS)) {
      const loc = KNOWN_AGRI_LOCATIONS[key];
      const stateMatches = !normState || loc.state.toLowerCase() === normState.toLowerCase();
      if (stateMatches && loc.district.toLowerCase() === normDistrict.toLowerCase()) {
        return loc;
      }
    }
  }

  // 3. Match by name or query within specified State
  const combined = `${query} ${normDistrict} ${normState}`.toLowerCase();
  for (const key of Object.keys(KNOWN_AGRI_LOCATIONS)) {
    const loc = KNOWN_AGRI_LOCATIONS[key];
    const stateMatches = !normState || loc.state.toLowerCase() === normState.toLowerCase();
    if (stateMatches) {
      if (
        combined.includes(loc.name.toLowerCase()) ||
        combined.includes(loc.district.toLowerCase())
      ) {
        return loc;
      }
    }
  }

  // 4. Special Bihar Districts Mapping
  if (normState.toLowerCase() === 'bihar') {
    if (combined.includes('vaishali') || combined.includes('hajipur')) {
      return KNOWN_AGRI_LOCATIONS['844101'];
    }
    if (combined.includes('patna')) {
      return KNOWN_AGRI_LOCATIONS['800001'];
    }
    if (combined.includes('muzaffarpur')) {
      return KNOWN_AGRI_LOCATIONS['842001'];
    }
    if (combined.includes('purnea') || combined.includes('purnia')) {
      return KNOWN_AGRI_LOCATIONS['854301'];
    }
    if (combined.includes('samastipur')) {
      return KNOWN_AGRI_LOCATIONS['848101'];
    }
    if (combined.includes('begusarai')) {
      return KNOWN_AGRI_LOCATIONS['851101'];
    }
    if (combined.includes('gaya')) {
      return KNOWN_AGRI_LOCATIONS['823001'];
    }
    if (combined.includes('bhagalpur')) {
      return KNOWN_AGRI_LOCATIONS['812001'];
    }
    return {
      ...STATE_CENTROIDS['Bihar'],
      district: normDistrict || 'Patna',
      name: normDistrict ? `${normDistrict} Agro Hub` : 'Patna Central'
    };
  }

  // 5. State Centroid Fallback - Guarantees we NEVER jump to another state
  if (normState) {
    const matchedStateKey = Object.keys(STATE_CENTROIDS).find(
      s => s.toLowerCase() === normState.toLowerCase()
    );
    if (matchedStateKey && STATE_CENTROIDS[matchedStateKey]) {
      const centroid = STATE_CENTROIDS[matchedStateKey];
      return {
        ...centroid,
        district: normDistrict || centroid.district,
        name: normDistrict ? `${normDistrict} Farmgate` : centroid.name
      };
    }
  }

  // 6. Default fallback
  return DEFAULT_USER_LOCATION;
}

/**
 * State-Wide Procurement Matcher
 * Tests if buyer and farmer are located within the same state
 */
export function isWithinSameState(stateA?: string, stateB?: string): boolean {
  if (!stateA || !stateB) return false;
  return stateA.trim().toLowerCase() === stateB.trim().toLowerCase();
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
 * Dispatch estimate based on distance & state-wide freight
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
  } else if (distanceKm <= 15) {
    return {
      timeMinutes: 40,
      label: '⚡ 40-Min Same-Day Cluster Delivery',
      badgeColor: 'bg-teal-600 text-white',
      deliveryFee: 45
    };
  } else if (distanceKm <= 60) {
    return {
      timeMinutes: 90,
      label: '🏛️ Same-District Express Corridor (1.5 Hr)',
      badgeColor: 'bg-emerald-700 text-white',
      deliveryFee: Math.round(50 + distanceKm * 0.8)
    };
  } else if (distanceKm <= 200) {
    return {
      timeMinutes: Math.round(distanceKm * 2),
      label: '🏛️ Intra-State Regional Transport (Same-Day / 24 Hr)',
      badgeColor: 'bg-sky-700 text-white',
      deliveryFee: Math.round(75 + distanceKm * 0.9)
    };
  } else {
    return {
      timeMinutes: Math.round(distanceKm * 2.5),
      label: `🏛️ State-Wide Express Fleet (${Math.round(distanceKm)} km)`,
      badgeColor: 'bg-slate-700 text-white',
      deliveryFee: Math.round(100 + distanceKm * 1.0)
    };
  }
}

export interface NearestFciHubMatch {
  hub: CollectionHub;
  distanceKm: number;
  nearestMandi: string;
}

/**
 * ⚡ Auto-detect nearest FCI (Food Corporation of India) Procurement Hub / Silo
 * and matching target APMC Mandi based on location, state, district, or PIN code.
 * Strictly guarantees that if a state is chosen, hubs in that state are chosen!
 */
export function findNearestFciHub(
  location: string = '',
  state: string = '',
  district: string = '',
  pincode: string = '',
  hubs: CollectionHub[] = []
): NearestFciHubMatch | null {
  if (!hubs || hubs.length === 0) return null;

  const geo = geocodeLocation(location, state, district, pincode);
  const effectiveState = (state || geo.state || '').trim();
  const effectiveDistrict = (district || geo.district || '').trim();

  // 1. FIRST PRIORITY: Always pick hubs within the farmer's state if present
  const stateHubs = effectiveState
    ? hubs.filter(h => h && h.state && h.state.toLowerCase() === effectiveState.toLowerCase())
    : [];

  const candidateHubs = (stateHubs.length > 0 ? stateHubs : hubs).filter(Boolean);
  if (candidateHubs.length === 0) return null;

  let bestHub = candidateHubs[0];
  let minDistance = 99999;

  for (const h of candidateHubs) {
    if (!h) continue;
    // If exact district match
    if (effectiveDistrict && h.district && h.district.toLowerCase() === effectiveDistrict.toLowerCase()) {
      bestHub = h;
      minDistance = calculateDistanceKm(geo.lat, geo.lng, h.latitude, h.longitude);
      break;
    }
    const d = calculateDistanceKm(geo.lat, geo.lng, h.latitude, h.longitude);
    if (d < minDistance) {
      minDistance = d;
      bestHub = h;
    }
  }

  if (minDistance === 99999) {
    minDistance = calculateDistanceKm(geo.lat, geo.lng, bestHub.latitude, bestHub.longitude);
  }

  const mandi = getNearestTargetMandi(effectiveState, effectiveDistrict);

  return {
    hub: bestHub,
    distanceKm: minDistance,
    nearestMandi: mandi
  };
}


