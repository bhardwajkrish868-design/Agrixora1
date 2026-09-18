import { RouteCheckpoint, DispatchDetails, OrderStage } from '../types';

export interface RoutePreset {
  routeHighway: string;
  totalDistanceKm: number;
  defaultSpeedKmph: number;
  checkpoints: { name: string; distancePercent: number; type: RouteCheckpoint['type']; description?: string }[];
}

export const ROUTE_PRESETS: Record<string, RoutePreset> = {
  'nashik_mumbai': {
    routeHighway: 'NH-60 & NH-160 Mumbai-Nashik Express Corridor',
    totalDistanceKm: 165,
    defaultSpeedKmph: 48,
    checkpoints: [
      { name: 'Pimpalgaon Baswant Hub Loading Gate', distancePercent: 0, type: 'origin', description: 'Consignment Sealed & GPS Telemetry Online' },
      { name: 'Kasara Ghat Summit Fastag Toll Plaza', distancePercent: 26, type: 'toll', description: 'Toll Clearance & Sensor Check 14.2°C' },
      { name: 'Shahapur Agri-Transit Inspection Post', distancePercent: 54, type: 'checkpoint', description: 'Weight & Seal Integrity Verified' },
      { name: 'Bhiwandi-Kalyan Logistics Bypass Ring', distancePercent: 82, type: 'junction', description: 'Approaching Mumbai Metropolitan Boundary' },
      { name: 'Vashi APMC Mega Mandi Terminal', distancePercent: 100, type: 'destination', description: 'Inbound Receiving Dock & Unloading Gate' }
    ]
  },
  'karnal_delhi': {
    routeHighway: 'NH-44 North-South Agri Freight Corridor',
    totalDistanceKm: 128,
    defaultSpeedKmph: 52,
    checkpoints: [
      { name: 'Karnal Grain Consolidation Hub', distancePercent: 0, type: 'origin', description: 'Paddy & Wheat Sealed in Aerated Reefer' },
      { name: 'Panipat Fastag Toll Gate', distancePercent: 28, type: 'toll', description: 'Fastag Automated Entry Pass' },
      { name: 'Murthal Agri Weighbridge Checkpoint', distancePercent: 62, type: 'checkpoint', description: 'Gross Vehicle Weight Checked' },
      { name: 'Kundli-Singhu Delhi Border Gate', distancePercent: 88, type: 'junction', description: 'Delhi Municipal Inbound Clearance' },
      { name: 'Azadpur Wholesale Mandi Terminal', distancePercent: 100, type: 'destination', description: 'Final Unloading & Escrow Intake' }
    ]
  },
  'punjab_delhi': {
    routeHighway: 'NH-44 Grand Trunk Agri Express (Ludhiana-Delhi)',
    totalDistanceKm: 310,
    defaultSpeedKmph: 58,
    checkpoints: [
      { name: 'Ludhiana Grain Hub Terminal', distancePercent: 0, type: 'origin', description: 'High Grade Wheat Sealed' },
      { name: 'Ambala Cantt Multi-Modal Junction', distancePercent: 36, type: 'junction', description: 'Haryana State Inbound Fastag' },
      { name: 'Karnal Agri Corridor Bypass', distancePercent: 60, type: 'checkpoint', description: 'Reefer Temp 18.5°C Normal' },
      { name: 'Sonipat Industrial Belt Toll', distancePercent: 84, type: 'toll', description: 'Approaching Capital Territory' },
      { name: 'Azadpur Mega Terminal Mandi', distancePercent: 100, type: 'destination', description: 'Destination Dock Intake' }
    ]
  },
  'pune_mumbai': {
    routeHighway: 'Mumbai-Pune Yashwantrao Chavan Expressway',
    totalDistanceKm: 148,
    defaultSpeedKmph: 56,
    checkpoints: [
      { name: 'Pune Aggregation Hub #02 (Manchar)', distancePercent: 0, type: 'origin', description: 'Cold Reefer Calibrated at 4.0°C' },
      { name: 'Talegaon Expressway Toll Gate', distancePercent: 25, type: 'toll', description: 'Expressway Inbound Access Granted' },
      { name: 'Lonavala Ghat Sensor Checkpoint', distancePercent: 55, type: 'checkpoint', description: 'Reefer Temp Log: 4.1°C Optimal' },
      { name: 'Khalapur Main Toll Plaza', distancePercent: 81, type: 'toll', description: 'Expressway Exit Fastag Cleared' },
      { name: 'Navi Mumbai Central Depot', distancePercent: 100, type: 'destination', description: 'Buyer Receiving Warehouse' }
    ]
  },
  'agra_lucknow': {
    routeHighway: 'Agra-Lucknow 6-Lane Greenfield Expressway',
    totalDistanceKm: 330,
    defaultSpeedKmph: 65,
    checkpoints: [
      { name: 'Agra Cold Storage & Logistics Hub', distancePercent: 0, type: 'origin', description: 'Cold-chain potato batch dispatched' },
      { name: 'Firozabad Interchange Toll', distancePercent: 24, type: 'toll', description: 'Expressway Fastag Passage' },
      { name: 'Mainpuri Mid-Way Agri Service Station', distancePercent: 52, type: 'checkpoint', description: 'Driver Rest & Continuous Telemetry Scan' },
      { name: 'Kannauj Bypass Toll Plaza', distancePercent: 78, type: 'toll', description: 'Approaching Central UP Agro Belt' },
      { name: 'Lucknow Mega Food Distribution Hub', distancePercent: 100, type: 'destination', description: 'Consignment Delivery Dock' }
    ]
  },
  'indore_bhopal': {
    routeHighway: 'SH-18 & NH-46 Indore-Bhopal Highway Corridor',
    totalDistanceKm: 195,
    defaultSpeedKmph: 50,
    checkpoints: [
      { name: 'Indore Sanwer Road Central Hub', distancePercent: 0, type: 'origin', description: 'Oilseeds lot loaded & eWay bill linked' },
      { name: 'Dewas Industrial Bypass Toll', distancePercent: 23, type: 'toll', description: 'Fastag Verified' },
      { name: 'Ashta Agro Transit Rest Area', distancePercent: 54, type: 'checkpoint', description: 'Midway sensor reading sync' },
      { name: 'Sehore Mandi Junction Ring Road', distancePercent: 82, type: 'junction', description: 'State Capital approach corridor' },
      { name: 'Bhopal Central Food Grain Depot', distancePercent: 100, type: 'destination', description: 'Intake and quality check station' }
    ]
  },
  'gujarat_mumbai': {
    routeHighway: 'NE-1 & NH-48 Western Golden Agro Corridor (Ahmedabad-Mumbai)',
    totalDistanceKm: 525,
    defaultSpeedKmph: 62,
    checkpoints: [
      { name: 'Ahmedabad APMC Mega Terminal', distancePercent: 0, type: 'origin', description: 'Fresh produce & spices dispatched' },
      { name: 'Vadodara Expressway Toll Plaza', distancePercent: 22, type: 'toll', description: 'Gujarat Highway Fastag Cleared' },
      { name: 'Surat Kim Agro Inspection Hub', distancePercent: 50, type: 'checkpoint', description: 'Weight & Cold Temp 6.2°C Verified' },
      { name: 'Vapi-Bhilad Maharashtra Border Gate', distancePercent: 74, type: 'junction', description: 'Inter-State Border Entry Clearance' },
      { name: 'Vashi Mega Terminal Mumbai', distancePercent: 100, type: 'destination', description: 'Final Unloading & Escrow Settlement' }
    ]
  },
  'karnataka_tamilnadu': {
    routeHighway: 'NH-44 & NH-48 Bengaluru-Chennai Agro Expressway Corridor',
    totalDistanceKm: 345,
    defaultSpeedKmph: 58,
    checkpoints: [
      { name: 'Bengaluru Yeshwanthpur Agro Terminal', distancePercent: 0, type: 'origin', description: 'Cold chain produce sealed in reefer' },
      { name: 'Hosur Border Agri Toll Plaza', distancePercent: 18, type: 'toll', description: 'Tamil Nadu State Entry' },
      { name: 'Krishnagiri Junction Weighbridge', distancePercent: 42, type: 'checkpoint', description: 'Telemetry check 4.2°C Optimal' },
      { name: 'Vellore Bypass Agro Rest Point', distancePercent: 70, type: 'junction', description: 'Approaching Coastal Belt' },
      { name: 'Koyambedu Wholesale Market Chennai', distancePercent: 100, type: 'destination', description: 'Consignment Receiving Terminal' }
    ]
  },
  'rajasthan_delhi': {
    routeHighway: 'NH-48 Jaipur-Delhi Pink City Agro Highway',
    totalDistanceKm: 270,
    defaultSpeedKmph: 54,
    checkpoints: [
      { name: 'Jaipur Muhana Mandi Terminal', distancePercent: 0, type: 'origin', description: 'Mustard & Spices batch sealed' },
      { name: 'Shahpura Fastag Toll Plaza', distancePercent: 26, type: 'toll', description: 'Fastag Cleared' },
      { name: 'Kotputli Agri Checkpoint', distancePercent: 50, type: 'checkpoint', description: 'Weighbridge check verified' },
      { name: 'Gurugram-Manesar Express Toll', distancePercent: 80, type: 'toll', description: 'NCR Inbound Lane' },
      { name: 'Azadpur Wholesale Mandi Terminal', distancePercent: 100, type: 'destination', description: 'Intake Bay #08' }
    ]
  },
  'andhra_telangana': {
    routeHighway: 'NH-65 Vijayawada-Hyderabad Deccan Grain Corridor',
    totalDistanceKm: 275,
    defaultSpeedKmph: 55,
    checkpoints: [
      { name: 'Guntur/Vijayawada Agri Terminal', distancePercent: 0, type: 'origin', description: 'Chilli & Grains Loaded' },
      { name: 'Nandigama Border Toll Gate', distancePercent: 25, type: 'toll', description: 'Toll passed' },
      { name: 'Suryapet Midway Logistics Bay', distancePercent: 52, type: 'checkpoint', description: 'GPS & Temp check online' },
      { name: 'Choutuppal Outer Ring Road', distancePercent: 82, type: 'junction', description: 'Hyderabad Approach' },
      { name: 'Bowenpally Mega Mandi Hyderabad', distancePercent: 100, type: 'destination', description: 'Unloading dock' }
    ]
  },
  'bengal_bihar': {
    routeHighway: 'NH-19 Grand Trunk Eastern Corridor (Patna-Kolkata)',
    totalDistanceKm: 580,
    defaultSpeedKmph: 50,
    checkpoints: [
      { name: 'Patna Mithapur Agricultural Hub', distancePercent: 0, type: 'origin', description: 'Consignment sealed' },
      { name: 'Bakhtiyarpur Toll Plaza', distancePercent: 18, type: 'toll', description: 'Fastag clearance' },
      { name: 'Dhanbad-Asansol Coal & Agro Belt', distancePercent: 52, type: 'checkpoint', description: 'Bengal Border check' },
      { name: 'Durgapur Expressway Toll', distancePercent: 78, type: 'toll', description: 'Approaching Kolkata ring' },
      { name: 'Kolkata Posta Mandi Terminal', distancePercent: 100, type: 'destination', description: 'Destination dock' }
    ]
  },
  'himachal_delhi': {
    routeHighway: 'NH-5 & NH-44 Himalayan Apple Corridor (Shimla-Delhi)',
    totalDistanceKm: 340,
    defaultSpeedKmph: 42,
    checkpoints: [
      { name: 'Shimla-Theog Apple Consolidation Hub', distancePercent: 0, type: 'origin', description: 'Sub-zero apple reefer calibrated at 2°C' },
      { name: 'Solan Mountain Ghats Checkpoint', distancePercent: 22, type: 'checkpoint', description: 'Hill brake & reefer temp check' },
      { name: 'Himalayan Expressway Toll (Parwanoo)', distancePercent: 44, type: 'toll', description: 'Entry to plains' },
      { name: 'Ambala-Karnal GT Road Junction', distancePercent: 72, type: 'junction', description: 'High speed NH-44 corridor' },
      { name: 'Azadpur Mega Cold Storage Terminal', distancePercent: 100, type: 'destination', description: 'Final Unloading & Escrow release' }
    ]
  }
};

/**
 * Identify closest preset or dynamically build intelligent route checkpoints
 */
export function getRouteTripDetails(
  origin: string = '',
  destination: string = '',
  stage: OrderStage = 'in_transit',
  existing?: Partial<DispatchDetails>
): {
  routeHighway: string;
  totalDistanceKm: number;
  coveredDistanceKm: number;
  currentSpeedKmph: number;
  estimatedMinutesRemaining: number;
  checkpoints: RouteCheckpoint[];
} {
  const originNorm = origin.toLowerCase();
  const destNorm = destination.toLowerCase();

  let preset: RoutePreset = ROUTE_PRESETS['nashik_mumbai'];

  if (originNorm.includes('shimla') || originNorm.includes('himachal') || destNorm.includes('himachal') || originNorm.includes('kashmir') || originNorm.includes('srinagar')) {
    preset = ROUTE_PRESETS['himachal_delhi'];
  } else if (originNorm.includes('ludhiana') || originNorm.includes('amritsar') || originNorm.includes('punjab')) {
    preset = ROUTE_PRESETS['punjab_delhi'];
  } else if (originNorm.includes('ahmedabad') || originNorm.includes('gujarat') || destNorm.includes('gujarat') || originNorm.includes('surat')) {
    preset = ROUTE_PRESETS['gujarat_mumbai'];
  } else if (originNorm.includes('bengaluru') || originNorm.includes('karnataka') || destNorm.includes('chennai') || destNorm.includes('tamil nadu')) {
    preset = ROUTE_PRESETS['karnataka_tamilnadu'];
  } else if (originNorm.includes('jaipur') || originNorm.includes('rajasthan') || destNorm.includes('rajasthan')) {
    preset = ROUTE_PRESETS['rajasthan_delhi'];
  } else if (originNorm.includes('guntur') || originNorm.includes('andhra') || originNorm.includes('hyderabad') || destNorm.includes('telangana')) {
    preset = ROUTE_PRESETS['andhra_telangana'];
  } else if (originNorm.includes('patna') || originNorm.includes('bihar') || originNorm.includes('kolkata') || destNorm.includes('bengal')) {
    preset = ROUTE_PRESETS['bengal_bihar'];
  } else if (originNorm.includes('karnal') || destNorm.includes('delhi') || destNorm.includes('haryana') || destNorm.includes('azadpur')) {
    preset = ROUTE_PRESETS['karnal_delhi'];
  } else if (originNorm.includes('pune') || destNorm.includes('pune') || (destNorm.includes('mumbai') && originNorm.includes('pune'))) {
    preset = ROUTE_PRESETS['pune_mumbai'];
  } else if (originNorm.includes('agra') || destNorm.includes('lucknow') || destNorm.includes('uttar pradesh') || destNorm.includes('kanpur')) {
    preset = ROUTE_PRESETS['agra_lucknow'];
  } else if (originNorm.includes('indore') || destNorm.includes('bhopal') || destNorm.includes('madhya pradesh')) {
    preset = ROUTE_PRESETS['indore_bhopal'];
  } else if (originNorm.includes('nashik') || destNorm.includes('mumbai') || destNorm.includes('vashi') || destNorm.includes('maharashtra')) {
    preset = ROUTE_PRESETS['nashik_mumbai'];
  }

  const totalDistanceKm = existing?.totalDistanceKm || preset.totalDistanceKm;
  const routeHighway = existing?.routeHighway || preset.routeHighway;
  const currentSpeedKmph = existing?.currentSpeedKmph || (stage === 'delivered' ? 0 : preset.defaultSpeedKmph);

  // Determine distance covered based on stage and existing data
  let coveredDistanceKm = 0;
  if (existing?.coveredDistanceKm !== undefined) {
    coveredDistanceKm = existing.coveredDistanceKm;
  } else if (stage === 'delivered') {
    coveredDistanceKm = totalDistanceKm;
  } else if (stage === 'in_transit') {
    // Realistic default: ~70% of total distance covered
    coveredDistanceKm = Math.round(totalDistanceKm * 0.715);
  } else {
    coveredDistanceKm = 0;
  }

  // Ensure within bounds [0, totalDistanceKm]
  coveredDistanceKm = Math.max(0, Math.min(totalDistanceKm, coveredDistanceKm));

  const remainingKm = totalDistanceKm - coveredDistanceKm;
  const speed = currentSpeedKmph > 0 ? currentSpeedKmph : 45;
  const estimatedMinutesRemaining = stage === 'delivered' ? 0 : Math.round((remainingKm / speed) * 60);

  // Generate checkpoints
  const checkpoints: RouteCheckpoint[] = preset.checkpoints.map((cp, idx) => {
    const cpDistanceKm = Math.round((cp.distancePercent / 100) * totalDistanceKm);
    
    let cpStatus: 'passed' | 'current' | 'upcoming' = 'upcoming';
    if (stage === 'delivered' || coveredDistanceKm >= cpDistanceKm + 3) {
      cpStatus = 'passed';
    } else if (
      Math.abs(coveredDistanceKm - cpDistanceKm) <= (totalDistanceKm * 0.15) || 
      (coveredDistanceKm >= cpDistanceKm && coveredDistanceKm < (preset.checkpoints[idx + 1] ? (preset.checkpoints[idx + 1].distancePercent / 100) * totalDistanceKm : totalDistanceKm))
    ) {
      cpStatus = 'current';
    } else {
      cpStatus = 'upcoming';
    }

    return {
      id: `cp_${idx + 1}`,
      name: cp.name,
      distanceKm: cpDistanceKm,
      status: cpStatus,
      type: cp.type,
      description: cp.description,
      passedAt: cpStatus === 'passed' ? 'Recorded' : undefined
    };
  });

  return {
    routeHighway,
    totalDistanceKm,
    coveredDistanceKm,
    currentSpeedKmph,
    estimatedMinutesRemaining,
    checkpoints
  };
}
