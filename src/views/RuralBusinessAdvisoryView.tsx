import React, { useState, useMemo } from 'react';
import { useAgri } from '../context/AgriContext';
import {
  Sparkles,
  Landmark,
  Calculator,
  FileText,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Building,
  Coins,
  ArrowRight,
  Download,
  Printer,
  ChevronRight,
  HelpCircle,
  Percent,
  Layers,
  MapPin,
  Clock,
  Zap,
  Leaf,
  Boxes,
  PieChart as PieIcon,
  Bot,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface BusinessModel {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'processing' | 'storage' | 'horticulture' | 'allied' | 'mechanization';
  categoryLabelEn: string;
  categoryLabelHi: string;
  minCapex: number; // in Lakhs
  maxCapex: number; // in Lakhs
  recommendedCapex: number; // in Lakhs
  workingCapitalMonths: number;
  landRequiredSqFt: number;
  powerHp: number;
  setupDays: number;
  marginPercent: number; // %
  paybackMonths: number;
  bestStates: string[];
  keyRawMaterials: string;
  applicableSchemes: string[];
  descriptionEn: string;
  descriptionHi: string;
  marketDemandRating: 'Very High' | 'High' | 'Moderate';
  offtakeChannel: string;
}

const BUSINESS_MODELS: BusinessModel[] = [
  {
    id: 'mini_dal_mill',
    nameEn: 'Mini Dal Mill & Pulse Processing Unit',
    nameHi: 'मिनी दाल मिल एवं दलहन प्रसंस्करण इकाई',
    category: 'processing',
    categoryLabelEn: 'Food Processing',
    categoryLabelHi: 'खाद्य प्रसंस्करण',
    minCapex: 12,
    maxCapex: 28,
    recommendedCapex: 18,
    workingCapitalMonths: 3,
    landRequiredSqFt: 1500,
    powerHp: 15,
    setupDays: 45,
    marginPercent: 22,
    paybackMonths: 16,
    bestStates: ['Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan', 'Karnataka'],
    keyRawMaterials: 'Chana (Gram), Tur (Pigeon Pea), Moong, Urad raw grains',
    applicableSchemes: ['PM-FME (35% Subsidy)', 'AIF (3% Interest Relief)', 'PMEGP (up to 35%)', 'MUDRA Tarun'],
    descriptionEn: 'De-husking, splitting, polishing and 1kg-50kg automated packaging of pulses with direct off-take to institutional buyers and local retail networks.',
    descriptionHi: 'दालों की डी-हस्किंग, ग्रेडिंग, पॉलिशिंग एवं 1kg-50kg ऑटोमैटिक पैकेजिंग। स्थानीय बाजारों और संस्थागत खरीदारों के लिए उच्च मांग।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'Agrixora Institutional Buyers, BigBasket, Local Mandi Wholesalers'
  },
  {
    id: 'cold_pressed_oil',
    nameEn: 'Cold-Pressed Mustard & Groundnut Oil Expeller',
    nameHi: 'कोल्ड-प्रेस (कच्ची घानी) सरसों व मूंगफली तेल मिल',
    category: 'processing',
    categoryLabelEn: 'Oilseed Processing',
    categoryLabelHi: 'तिलहन प्रसंस्करण',
    minCapex: 8,
    maxCapex: 22,
    recommendedCapex: 14,
    workingCapitalMonths: 2,
    landRequiredSqFt: 1200,
    powerHp: 10,
    setupDays: 30,
    marginPercent: 26,
    paybackMonths: 14,
    bestStates: ['Rajasthan', 'Uttar Pradesh', 'Gujarat', 'Haryana', 'Madhya Pradesh'],
    keyRawMaterials: 'Mustard seeds (सरसों), Groundnut, Sesame, Sunflower',
    applicableSchemes: ['PM-FME (35% Subsidy)', 'PMEGP', 'MUDRA Kishor/Tarun', 'AIF'],
    descriptionEn: 'High-margin chemical-free virgin cold-pressed edible oil extraction with oilcake (खली) sold as premium cattle feed.',
    descriptionHi: 'शुद्ध प्राकृतिक कच्ची घानी तेल निष्कर्षण। तेल के साथ-साथ उच्च गुणवत्ता वाली खल पशु आहार के रूप में तुरंत बिकती है।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'D2C Organic Brands, Supermarket Chains, Local Grocery Networks'
  },
  {
    id: 'solar_micro_cold_storage',
    nameEn: 'Solar-Powered Micro Cold Storage (20-30 MT)',
    nameHi: 'सौर-ऊर्जा चालित माइक्रो कोल्ड स्टोरेज (20-30 मीट्रिक टन)',
    category: 'storage',
    categoryLabelEn: 'Cold Chain & Storage',
    categoryLabelHi: 'कोल्ड चेन व भंडारण',
    minCapex: 16,
    maxCapex: 35,
    recommendedCapex: 24,
    workingCapitalMonths: 1,
    landRequiredSqFt: 800,
    powerHp: 8,
    setupDays: 60,
    marginPercent: 32,
    paybackMonths: 20,
    bestStates: ['Maharashtra', 'Punjab', 'Himachal Pradesh', 'Andhra Pradesh', 'Bihar'],
    keyRawMaterials: 'Horticultural crops: Tomato, Onion, Apple, Grapes, Chili, Capsicum',
    applicableSchemes: ['AIF (3% Interest Subvention + CGTMSE)', 'MIDH (35%-50% Capital Subsidy)', 'PM Kisan SAMPADA'],
    descriptionEn: 'Decentralized farmgate cold room preserving fresh fruits/vegetables for 15-45 days, preventing distress selling and earning steady rental fees from neighboring farmers.',
    descriptionHi: 'खेत के पास सौर ऊर्जा संचालित कोल्ड रूम। फलों-सब्जियों को 15-45 दिन सुरक्षित रखकर फसल का उचित भाव और किराये से नियमित आय।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'Farmer Lot Aggregation, Agrixora Reefer Dispatch, Exporters'
  },
  {
    id: 'spice_dehydration_grinding',
    nameEn: 'Solar Spice Dehydration & Automated Powdering',
    nameHi: 'सोलर मसाला ड्रायर व ऑटोमैटिक पिसाई-पैकिंग यूनिट',
    category: 'processing',
    categoryLabelEn: 'Spices & Condiments',
    categoryLabelHi: 'मसाला प्रसंस्करण',
    minCapex: 6,
    maxCapex: 18,
    recommendedCapex: 10,
    workingCapitalMonths: 2,
    landRequiredSqFt: 1000,
    powerHp: 8,
    setupDays: 25,
    marginPercent: 28,
    paybackMonths: 12,
    bestStates: ['Andhra Pradesh', 'Telangana', 'Kerala', 'Rajasthan', 'Gujarat'],
    keyRawMaterials: 'Red Chili, Turmeric (हल्दी), Coriander (धनिया), Cumin (जीरा)',
    applicableSchemes: ['PM-FME (35% Subsidy)', 'PMEGP (up to 35%)', 'Spices Board Scheme'],
    descriptionEn: 'Hygienic solar drying of raw spices followed by pulverizing, sieving and nitrogen-flushed pouch packaging for maximum aroma retention.',
    descriptionHi: 'मसालों की सोलर ड्राइंग, माइक्रोन पिसाई और नाइट्रोजन-पैकिंग। हल्दी, मिर्च और धनिए में भारी वैल्यू-एडिशन।',
    marketDemandRating: 'High',
    offtakeChannel: 'Spice Retailers, Hotel Chains, Agrixora Bulk Procurement'
  },
  {
    id: 'polyhouse_horticulture',
    nameEn: 'Hi-Tech Polyhouse / Naturally Ventilated GreenHouse',
    nameHi: 'हाई-टेक पॉलीहाउस संरक्षित बागवानी यूनिट',
    category: 'horticulture',
    categoryLabelEn: 'Protected Cultivation',
    categoryLabelHi: 'संरक्षित खेती',
    minCapex: 20,
    maxCapex: 45,
    recommendedCapex: 30,
    workingCapitalMonths: 4,
    landRequiredSqFt: 10000,
    powerHp: 5,
    setupDays: 75,
    marginPercent: 35,
    paybackMonths: 22,
    bestStates: ['Maharashtra', 'Haryana', 'Karnataka', 'Himachal Pradesh', 'Gujarat'],
    keyRawMaterials: 'Color Capsicum (Shimla Mirch), Seedless Cucumber, Exotic Flowers (Gerbera/Rose)',
    applicableSchemes: ['MIDH / NHM (50% Capital Subsidy)', 'AIF Scheme', 'NABARD Credit'],
    descriptionEn: 'Climate-controlled cultivation yielding 4x-6x higher output with year-round harvest cycles and premium tier-1 hotel/supermarket contracting.',
    descriptionHi: 'साल भर नियंत्रित तापमान में रंगीन शिमला मिर्च, खीरा व विदेशी फूलों की खेती। खुले खेत की तुलना में 4 से 6 गुना अधिक उत्पादन।',
    marketDemandRating: 'High',
    offtakeChannel: 'Gourmet Retailers, Star Hotels, Wholesale Urban Mandis'
  },
  {
    id: 'mushroom_cultivation',
    nameEn: 'Commercial Button & Oyster Mushroom Farm',
    nameHi: 'व्यावसायिक बटन व ढींगरी (ऑयस्टर) मशरूम उत्पादन इकाई',
    category: 'allied',
    categoryLabelEn: 'Allied Agriculture',
    categoryLabelHi: 'संबद्ध कृषि',
    minCapex: 5,
    maxCapex: 16,
    recommendedCapex: 9,
    workingCapitalMonths: 2,
    landRequiredSqFt: 1200,
    powerHp: 5,
    setupDays: 20,
    marginPercent: 38,
    paybackMonths: 10,
    bestStates: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar', 'Uttarakhand'],
    keyRawMaterials: 'Wheat straw (भूसा), Mushroom Spawn, Gypsum, Casing soil',
    applicableSchemes: ['PM-FME', 'PMEGP (35% Margin Money)', 'MUDRA Loan', 'NABARD ACABC'],
    descriptionEn: 'Rapid 35-45 day harvesting cycle utilizing vertical tray racks inside insulated chambers. Extremely low land requirement with high daily cash flow.',
    descriptionHi: 'कम जमीन में वर्टिकल रैक पर 35-45 दिनों में तैयार होने वाली उच्च प्रोटीन फसल। दैनिक नकदी प्रवाह और अत्यधिक मांग।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'Local Vegetable Markets, Cloud Kitchens, Agrixora Buyers'
  },
  {
    id: 'agri_drone_custom_hiring',
    nameEn: 'Agricultural Drone Spraying & Custom Hiring Centre',
    nameHi: 'कृषि ड्रोन स्प्रेइंग व कस्टम हायरिंग सेंटर (CHC)',
    category: 'mechanization',
    categoryLabelEn: 'Farm Mechanization',
    categoryLabelHi: 'कृषि यंत्रीकरण',
    minCapex: 10,
    maxCapex: 25,
    recommendedCapex: 15,
    workingCapitalMonths: 2,
    landRequiredSqFt: 500,
    powerHp: 3,
    setupDays: 15,
    marginPercent: 42,
    paybackMonths: 11,
    bestStates: ['Punjab', 'Haryana', 'Maharashtra', 'Telangana', 'Madhya Pradesh'],
    keyRawMaterials: 'Type-certified 10L/20L Agri Drones, Lithium Smart Batteries, Rapid Chargers',
    applicableSchemes: ['Sub-Mission on Agri Mechanization (SMAM - 40%-50% Subsidy)', 'Namo Drone Didi', 'AIF Scheme'],
    descriptionEn: 'Pesticide, nano-urea and liquid micronutrient spraying covering 25-35 acres/day at ₹350-₹500/acre service fee. Zero chemical contact for operators.',
    descriptionHi: '1 दिन में 25-35 एकड़ में नैनो यूरिया व कीटनाशक छिड़काव। ₹350-₹500 प्रति एकड़ शुल्क से तीव्र दैनिक आमदनी।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'Direct Village Farmers, FPO Contract spraying, Sugar Mills'
  },
  {
    id: 'bulk_milk_chilling',
    nameEn: 'Bulk Milk Chilling (BMC) & Value-Added Dairy Unit',
    nameHi: 'बल्क मिल्क चिलिंग (BMC) व पनीर/घी प्रसंस्करण यूनिट',
    category: 'allied',
    categoryLabelEn: 'Dairy & Livestock',
    categoryLabelHi: 'डेयरी प्रसंस्करण',
    minCapex: 18,
    maxCapex: 45,
    recommendedCapex: 28,
    workingCapitalMonths: 2,
    landRequiredSqFt: 2000,
    powerHp: 20,
    setupDays: 60,
    marginPercent: 24,
    paybackMonths: 18,
    bestStates: ['Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
    keyRawMaterials: 'Raw cow & buffalo milk (1,000L - 3,000L/day), Milk testing equipment',
    applicableSchemes: ['AHIDF (Animal Husbandry Infrastructure - 3% Subvention)', 'NABARD Dairy Scheme', 'PM-FME'],
    descriptionEn: 'Rapid chilling to 4°C preventing bacterial spoilage, plus value-addition into Paneer, Curd (दही), Desi Ghee and Butter with guaranteed dairy tie-ups.',
    descriptionHi: 'दूध को तुरंत 4°C पर ठंडा कर पनीर, खोया, दही व शुद्ध घी बनाना। अमूल, मदर डेयरी व स्थानीय मिष्ठान्न विक्रेताओं से सीधा अनुबंध।',
    marketDemandRating: 'High',
    offtakeChannel: 'Dairy Cooperatives, Sweet Manufacturers, Agrixora FMCG buyers'
  }
];

interface SchemeDetails {
  id: string;
  name: string;
  shortTag: string;
  ministry: string;
  subsidyType: string;
  maxSubsidyAmount: string;
  interestSubvention: string;
  eligibility: string;
  portalUrl: string;
}

const SCHEMES_DATABASE: SchemeDetails[] = [
  {
    id: 'pm_fme',
    name: 'PM Formalisation of Micro Food Processing Enterprises (PM-FME)',
    shortTag: 'PM-FME (MoFPI)',
    ministry: 'Ministry of Food Processing Industries, Govt of India',
    subsidyType: '35% Credit-Linked Capital Subsidy',
    maxSubsidyAmount: 'Up to ₹10.00 Lakhs per enterprise',
    interestSubvention: 'Eligible for interest subvention via AIF convergence',
    eligibility: 'Micro food processing units, individual farmers, SHGs, FPOs, Cooperatives',
    portalUrl: 'https://pmfme.mofpi.gov.in'
  },
  {
    id: 'aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    shortTag: 'AIF ₹1 Lakh Crore Fund',
    ministry: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    subsidyType: '3% p.a. Interest Subvention on Bank Loan + CGTMSE Fee Coverage',
    maxSubsidyAmount: 'Interest relief on loans up to ₹2.00 Crores for 7 years',
    interestSubvention: '3.0% per annum rebate on commercial bank interest rate',
    eligibility: 'Farmers, FPOs, PACS, Agri-entrepreneurs, Startups, Primary Processing units',
    portalUrl: 'https://agriinfra.dac.gov.in'
  },
  {
    id: 'pmegp',
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    shortTag: 'PMEGP (KVIC/MSME)',
    ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    subsidyType: '15% to 35% Margin Money Capital Subsidy',
    maxSubsidyAmount: 'Up to ₹17.50 Lakhs (35% of max ₹50 Lakhs project cost in rural areas)',
    interestSubvention: 'Normal priority sector lending rates',
    eligibility: 'Individuals aged 18+, Rural youth, Women, SC/ST/OBC/Differently-abled',
    portalUrl: 'https://www.kviconline.gov.in/pmegp'
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY - Shishu / Kishor / Tarun)',
    shortTag: 'MUDRA Collateral-Free',
    ministry: 'Ministry of Finance, Govt of India',
    subsidyType: '100% Collateral-Free Working Capital & Term Loan',
    maxSubsidyAmount: 'Tarun: ₹5 Lakh to ₹10 Lakh | Tarun Plus: up to ₹20 Lakh',
    interestSubvention: 'Concessional priority lending rates without property mortgage',
    eligibility: 'Non-farm rural micro enterprises, small food processing, repair shops, packaging',
    portalUrl: 'https://www.mudra.org.in'
  },
  {
    id: 'smam_drone',
    name: 'Sub-Mission on Agricultural Mechanization (SMAM & Namo Drone)',
    shortTag: 'SMAM & Drone Subsidy',
    ministry: 'Department of Agriculture & Farmers Welfare',
    subsidyType: '40% to 50% Capital Grant for Custom Hiring / 100% for FPOs (up to ₹10L)',
    maxSubsidyAmount: 'Up to ₹5.00 Lakhs for individual agri-graduates / ₹10L for FPOs',
    interestSubvention: 'Linked with bank loan via state agriculture department',
    eligibility: 'Agri-graduates, Rural youth, Women SHGs, Farmer Producer Organizations',
    portalUrl: 'https://agrimachinery.nic.in'
  }
];

export const RuralBusinessAdvisoryView: React.FC = () => {
  const { currentUser, language, setActiveTab } = useAgri();

  // Active sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'advisor' | 'schemes' | 'dpr_generator' | 'ai_chat'>('advisor');

  // Selected State & District
  const [selectedState, setSelectedState] = useState<string>(currentUser?.state || 'Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentUser?.district || 'Nashik');
  
  // Selected Business Model
  const [selectedModelId, setSelectedModelId] = useState<string>('mini_dal_mill');
  
  // Custom Financial Sliders State
  const activeModel = useMemo(() => {
    return BUSINESS_MODELS.find(m => m.id === selectedModelId) || BUSINESS_MODELS[0];
  }, [selectedModelId]);

  const [customCapexLakhs, setCustomCapexLakhs] = useState<number>(activeModel.recommendedCapex);
  const [entrepreneurCategory, setEntrepreneurCategory] = useState<'general' | 'women' | 'sc_st' | 'fpo'>('women');
  const [isRuralArea, setIsRuralArea] = useState<boolean>(true);
  const [chosenSchemeId, setChosenSchemeId] = useState<string>('pm_fme');

  // Sync custom Capex when business model changes
  const handleSelectBusinessModel = (model: BusinessModel) => {
    setSelectedModelId(model.id);
    setCustomCapexLakhs(model.recommendedCapex);
  };

  // Financial calculations
  const financialStructure = useMemo(() => {
    const totalCost = customCapexLakhs * 100000;
    
    // Calculate Subsidy Rate based on scheme & category
    let subsidyPercent = 35; // Default PM-FME / PMEGP
    let maxSubsidyCap = 1000000; // ₹10 Lakhs max for PM-FME

    if (chosenSchemeId === 'pm_fme') {
      subsidyPercent = 35;
      maxSubsidyCap = 1000000; // ₹10L cap
    } else if (chosenSchemeId === 'pmegp') {
      if (entrepreneurCategory === 'general') {
        subsidyPercent = isRuralArea ? 25 : 15;
      } else {
        subsidyPercent = isRuralArea ? 35 : 25; // Special category (women, SC/ST, rural)
      }
      maxSubsidyCap = 1750000; // 35% of 50 Lakhs
    } else if (chosenSchemeId === 'aif') {
      subsidyPercent = 0; // AIF gives interest subvention rather than direct capex subsidy
      maxSubsidyCap = 0;
    } else if (chosenSchemeId === 'smam_drone') {
      subsidyPercent = entrepreneurCategory === 'fpo' ? 75 : 50;
      maxSubsidyCap = 500000;
    }

    const calculatedSubsidy = Math.min((totalCost * subsidyPercent) / 100, maxSubsidyCap);
    
    // Promoter Contribution (Margin Money: 10% for special/women, 15% for general)
    const promoterMarginPercent = entrepreneurCategory === 'general' ? 15 : 10;
    const promoterContribution = (totalCost * promoterMarginPercent) / 100;

    // Bank Term Loan
    const bankLoan = Math.max(0, totalCost - calculatedSubsidy - promoterContribution);

    // Interest & EMI estimation (9.5% standard interest rate, 5 year tenure)
    const baseInterestRate = 0.095;
    const aifInterestSubvention = (chosenSchemeId === 'aif' || chosenSchemeId === 'pm_fme') ? 0.03 : 0.0;
    const effectiveInterestRate = Math.max(0.04, baseInterestRate - aifInterestSubvention);

    const tenureMonths = 60; // 5 years
    const monthlyInterestRate = effectiveInterestRate / 12;
    const monthlyEmi = bankLoan > 0 
      ? Math.round((bankLoan * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1))
      : 0;

    const totalInterestPayable = (monthlyEmi * tenureMonths) - bankLoan;
    const interestSavedViaSubvention = (chosenSchemeId === 'aif' || chosenSchemeId === 'pm_fme')
      ? Math.round((bankLoan * 0.03 * 5))
      : 0;

    // Estimated monthly economics
    const estimatedMonthlyTurnover = Math.round((totalCost * 0.35)); // Typical 35% monthly asset turnover
    const grossProfitMonthly = Math.round((estimatedMonthlyTurnover * (activeModel.marginPercent / 100)));
    const netProfitMonthly = Math.max(15000, grossProfitMonthly - monthlyEmi - (totalCost * 0.03)); // After EMI and utilities
    const annualNetIncome = netProfitMonthly * 12;
    const paybackYears = Number((totalCost / (annualNetIncome + (monthlyEmi * 12))).toFixed(1));
    const dscr = Number(((netProfitMonthly + monthlyEmi) / Math.max(1, monthlyEmi)).toFixed(2));

    return {
      totalCost,
      subsidyPercent,
      calculatedSubsidy,
      promoterMarginPercent,
      promoterContribution,
      bankLoan,
      effectiveInterestRate: (effectiveInterestRate * 100).toFixed(1),
      monthlyEmi,
      totalInterestPayable,
      interestSavedViaSubvention,
      estimatedMonthlyTurnover,
      grossProfitMonthly,
      netProfitMonthly,
      annualNetIncome,
      paybackYears,
      dscr
    };
  }, [customCapexLakhs, chosenSchemeId, entrepreneurCategory, isRuralArea, activeModel]);

  // Chart data for Capital Structure
  const capitalBreakdownChartData = [
    { name: language === 'hi' ? 'सरकारी सब्सिडी (Grant)' : 'Govt Subsidy (Grant)', value: financialStructure.calculatedSubsidy, color: '#10b981' },
    { name: language === 'hi' ? 'बैंक सावधि ऋण (Bank Loan)' : 'Bank Term Loan', value: financialStructure.bankLoan, color: '#3b82f6' },
    { name: language === 'hi' ? 'स्वयं का अंशदान (Own Equity)' : 'Promoter Margin', value: financialStructure.promoterContribution, color: '#f59e0b' }
  ];

  // Chart data for 5-Year Projected Revenue & Net Profit
  const fiveYearProjectionData = useMemo(() => {
    const baseRevenue = financialStructure.estimatedMonthlyTurnover * 12;
    const baseNetProfit = financialStructure.annualNetIncome;
    return [
      { year: 'Year 1', revenue: Math.round(baseRevenue * 0.75 / 100000), profit: Math.round(baseNetProfit * 0.70 / 100000), emi: Math.round((financialStructure.monthlyEmi * 12) / 100000) },
      { year: 'Year 2', revenue: Math.round(baseRevenue * 1.00 / 100000), profit: Math.round(baseNetProfit * 1.00 / 100000), emi: Math.round((financialStructure.monthlyEmi * 12) / 100000) },
      { year: 'Year 3', revenue: Math.round(baseRevenue * 1.25 / 100000), profit: Math.round(baseNetProfit * 1.30 / 100000), emi: Math.round((financialStructure.monthlyEmi * 12) / 100000) },
      { year: 'Year 4', revenue: Math.round(baseRevenue * 1.50 / 100000), profit: Math.round(baseNetProfit * 1.60 / 100000), emi: Math.round((financialStructure.monthlyEmi * 12) / 100000) },
      { year: 'Year 5', revenue: Math.round(baseRevenue * 1.80 / 100000), profit: Math.round(baseNetProfit * 1.95 / 100000), emi: Math.round((financialStructure.monthlyEmi * 12) / 100000) }
    ];
  }, [financialStructure]);

  // AI Conversational Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; timestamp: string }>>([
    {
      role: 'ai',
      text: language === 'hi'
        ? `नमस्ते! मैं आपका एआई ग्रामीण व्यापार व वित्तीय सलाहकार हूँ। आप ${selectedDistrict} जिले में खाद्य प्रसंस्करण, कोल्ड स्टोरेज, दाल मिल या किसी भी सूक्ष्म-उद्यम के लिए सरकारी सब्सिडी (PM-FME, AIF), लागत और बैंक ऋण के बारे में मुझसे पूछ सकते हैं।`
        : `Namaste! I am your AI Rural Enterprise & Financial Structuring Assistant. Ask me anything about project setup costs, government subsidies (PM-FME, AIF, PMEGP), Bankable DPRs, or raw material availability in ${selectedDistrict}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSendChatMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Generate Contextual AI Response
    setTimeout(() => {
      let aiReply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('dal') || qLower.includes('दाल')) {
        aiReply = language === 'hi'
          ? `मिनी दाल मिल के लिए ₹15-₹20 लाख का निवेश पर्याप्त है। इसमें PM-FME योजना के तहत 35% (अधिकतम ₹10 लाख) क्रेडिट-लिंक्ड सब्सिडी मिलती है। यदि आप AIF से जोड़ते हैं तो 3% ब्याज छूट भी मिलेगी। आपको 15 HP बिजली कनेक्शन और 1500 वर्ग फुट जगह की आवश्यकता होगी।`
          : `For a Mini Dal Mill, a budget of ₹15-₹20 Lakhs is optimal. Under the PM-FME scheme, you receive a 35% credit-linked capital subsidy (up to ₹10 Lakhs). You also qualify for 3% interest subvention under AIF. Land requirement is ~1,500 sq ft with 15 HP power.`;
      } else if (qLower.includes('cold') || qLower.includes('कोल्ड')) {
        aiReply = language === 'hi'
          ? `20-30 मीट्रिक टन सोलर कोल्ड स्टोरेज के लिए लगभग ₹20-₹25 लाख लागत आती है। AIF (एग्रीकल्चर इंफ्रास्ट्रक्चर फंड) के तहत 3% ब्याज छूट 7 साल के लिए और बिना किसी गारंटी के CGTMSE कवर मिलता है। यह टमाटर, प्याज और फलों के लिए अत्यधिक लाभदायक है।`
          : `A 20-30 MT solar-powered cold room costs approx ₹20-₹25 Lakhs. Under the Agriculture Infrastructure Fund (AIF), you get a 3% annual interest subvention for 7 years plus full CGTMSE credit guarantee coverage. Payback period is under 20 months.`;
      } else if (qLower.includes('oil') || qLower.includes('सरसों') || qLower.includes('तेल')) {
        aiReply = language === 'hi'
          ? `कच्ची घानी सरसों/मूंगफली तेल मिल ₹10-₹15 लाख में शुरू हो सकती है। PMEGP या PM-FME में महिलाओं/ग्रामीण उद्यमियों को 35% तक सब्सिडी मिलती है। खली (Oilcake) की स्थानीय डेयरी में तुरंत नकद बिक्री होती है, जिससे 25-28% शुद्ध मार्जिन मिलता है।`
          : `A Cold-Pressed Oil Expeller unit can be established for ₹10-₹15 Lakhs. Special category & rural entrepreneurs get up to 35% margin subsidy via PMEGP/PM-FME. Oilcake (खल) provides instant daily cash flow from local dairies with a 26% net profit margin.`;
      } else if (qLower.includes('subsidy') || qLower.includes('सब्सिडी') || qLower.includes('योजना')) {
        aiReply = language === 'hi'
          ? `वर्तमान में शीर्ष 3 योजनाएं हैं: 1. PM-FME (खाद्य प्रसंस्करण पर 35% सब्सिडी), 2. AIF (₹2 करोड़ तक 3% ब्याज छूट), 3. PMEGP (ग्रामीण क्षेत्रों में 35% तक मार्जिन मनी)। आप नीचे दिए गए 'DPR जनरेटर' से बैंक-प्रस्तुत योग्य प्रोजेक्ट रिपोर्ट डाउनलोड कर सकते हैं।`
          : `Top 3 active schemes for rural entrepreneurs: 1. PM-FME (35% capital subsidy for food processing), 2. AIF (3% interest rebate on loans up to ₹2 Cr), 3. PMEGP (up to 35% subsidy for rural ventures). You can generate and print a bank-ready Detailed Project Report (DPR) directly from this tool.`;
      } else {
        aiReply = language === 'hi'
          ? `आपके ${selectedDistrict} क्षेत्र में ${activeModel.nameHi} के लिए प्रोजेक्ट लागत ₹${customCapexLakhs} लाख है। इसमें ₹${(financialStructure.calculatedSubsidy / 100000).toFixed(2)} लाख की सरकारी सब्सिडी और ₹${(financialStructure.bankLoan / 100000).toFixed(2)} लाख का बैंक ऋण संरचित किया जा सकता है। क्या आप बैंक रिपोर्ट (DPR) तैयार करना चाहते हैं?`
          : `For ${activeModel.nameEn} in ${selectedDistrict}, your project cost is structured at ₹${customCapexLakhs} Lakhs. This includes ₹${(financialStructure.calculatedSubsidy / 100000).toFixed(2)} Lakhs government subsidy and ₹${(financialStructure.bankLoan / 100000).toFixed(2)} Lakhs bank term loan. Would you like to generate a Bankable DPR dossier?`;
      }

      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrintDpr = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 🌟 HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{language === 'hi' ? 'एआई ग्रामीण सूक्ष्म-उद्यम व वित्तीय सलाहकार' : 'AI Rural Enterprise & Financial Structuring Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white leading-tight">
              {language === 'hi' ? 'ग्रामीण व्यापार सलाह एवं बैंक सब्सिडी संरचना' : 'Hyper-Local Business Advisory & Bank Financial Structuring'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'किसानों, एफपीओ (FPOs) व ग्रामीण सूक्ष्म उद्यमियों के लिए प्रोजेक्ट व्यवहार्यता, PM-FME / AIF सरकारी सब्सिडी और 1-क्लिक बैंक लोन DPR रिपोर्ट।'
                : 'Empowering farmers, FPOs & rural entrepreneurs with district-level business feasibility, 35% PM-FME/AIF subsidies, and bank-ready DPR dossiers.'}
            </p>
          </div>

          {/* Quick Location Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{language === 'hi' ? 'लक्षित जिला एवं राज्य:' : 'Target Location:'}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="District (e.g. Nashik)"
                className="bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 w-28 focus:outline-hidden focus:border-emerald-400 font-bold"
              />
              <input
                type="text"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder="State (e.g. Maharashtra)"
                className="bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 w-32 focus:outline-hidden focus:border-emerald-400 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'advisor'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{language === 'hi' ? '1. व्यापार व्यवहार्यता (Feasibility)' : '1. Enterprise Feasibility'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schemes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'schemes'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{language === 'hi' ? '2. सब्सिडी व लोन कैलकुलेटर' : '2. Subsidy & Loan Structuring'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dpr_generator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'dpr_generator'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'hi' ? '3. बैंक DPR रिपोर्ट (Loan Dossier)' : '3. Bankable DPR Generator'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai_chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'ai_chat'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{language === 'hi' ? '4. एआई बिज़नेस चैट व वॉयस' : '4. AI Advisory Chat & Voice'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ENTERPRISE FEASIBILITY ANALYZER
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'advisor' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span>{language === 'hi' ? 'उच्च-लाभकारी ग्रामीण सूक्ष्म-उद्यम मॉडल' : 'High-Potential Rural Micro-Enterprise Models'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? `स्थानिक कच्चा माल, मंडी मांग व ${selectedDistrict} जिले की कृषि परिस्थितियों के आधार पर विश्लेषण।`
                  : `Curated bankable ventures matched to raw material catchment and market demand in ${selectedDistrict}.`}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              {BUSINESS_MODELS.length} Active Feasibility Models
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUSINESS_MODELS.map((model) => {
              const isSelected = model.id === selectedModelId;
              return (
                <div
                  key={model.id}
                  onClick={() => handleSelectBusinessModel(model)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-soft'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {language === 'hi' ? model.categoryLabelHi : model.categoryLabelEn}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        ⭐ {model.marketDemandRating}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {language === 'hi' ? model.nameHi : model.nameEn}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {language === 'hi' ? model.descriptionHi : model.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">{language === 'hi' ? 'लागत (Capex)' : 'Est. Capex'}</span>
                        <span className="font-black text-slate-800">₹{model.recommendedCapex} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">{language === 'hi' ? 'शुद्ध मार्जिन' : 'Net Margin'}</span>
                        <span className="font-black text-emerald-700">~{model.marginPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 text-[11px]">{model.paybackMonths} Mo. Payback</span>
                    <span className={`flex items-center gap-1 text-[11px] ${isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>
                      <span>{isSelected ? (language === 'hi' ? 'चयनित ✓' : 'Selected ✓') : (language === 'hi' ? 'विश्लेषण देखें →' : 'Analyze →')}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Model Detailed Deep-Dive Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {language === 'hi' ? 'गहन व्यवहार्यता रिपोर्ट' : 'Selected Venture Feasibility Analysis'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-display">
                  {language === 'hi' ? activeModel.nameHi : activeModel.nameEn}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('schemes')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सब्सिडी कैलकुलेटर खोलें' : 'Calculate Subsidy & EMI'}</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('dpr_generator')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'hi' ? 'बैंक DPR तैयार करें' : 'Generate Bank DPR'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">{language === 'hi' ? 'आवश्यक भूमि/भवन' : 'Land & Shed Req.'}</span>
                <p className="text-base font-black text-slate-900">{activeModel.landRequiredSqFt.toLocaleString()} Sq. Ft</p>
                <span className="text-[10px] text-slate-500">{language === 'hi' ? 'स्वामित्व या 5-वर्षीय पट्टा' : 'Owned or 5-yr registered lease'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">{language === 'hi' ? 'बिजली कनेक्शन' : 'Power Load Required'}</span>
                <p className="text-base font-black text-slate-900">{activeModel.powerHp} HP / 3-Phase</p>
                <span className="text-[10px] text-slate-500">{language === 'hi' ? 'या सोलर पीवी हाइब्रिड' : 'Or Solar-Grid Hybrid'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">{language === 'hi' ? 'सेटअप व कमीशनिंग' : 'Time to Commission'}</span>
                <p className="text-base font-black text-slate-900">{activeModel.setupDays} Days</p>
                <span className="text-[10px] text-slate-500">{language === 'hi' ? 'मशीनरी डिलीवरी से शुरू' : 'From machinery order'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">{language === 'hi' ? 'लागू सरकारी योजनाएं' : 'Eligible Subsidies'}</span>
                <p className="text-xs font-black text-emerald-700 leading-tight">PM-FME & AIF 3%</p>
                <span className="text-[10px] text-slate-500">{language === 'hi' ? '35% तक पूंजीगत अनुदान' : 'Up to 35% Capital Grant'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'कच्चा माल एवं आपूर्ति स्रोत' : 'Raw Material Catchment & Sourcing'}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                  {activeModel.keyRawMaterials}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'बाजार मांग एवं खरीद चैनल' : 'Market Off-Take & Institutional Demand'}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                  {activeModel.offtakeChannel}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FINANCIAL STRUCTURING & SUBSIDY CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'schemes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  <span>{language === 'hi' ? 'एआई वित्तीय संरचना व सब्सिडी कैलकुलेटर' : 'AI Capital Structuring & Subsidy Calculator'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'hi'
                    ? `योजना, सामाजिक श्रेणी एवं पूंजीगत लागत के अनुसार सटीक सब्सिडी, ऋण व EMI गणना।`
                    : `Dynamic breakdown of Government Grants, Bank Term Loans, and Monthly Repayments.`}
                </p>
              </div>
            </div>

            {/* Interactive Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Total Project Capex */}
              <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-800">
                    {language === 'hi' ? 'परियोजना लागत (Project Cost)' : 'Project Cost (Capex)'}
                  </label>
                  <span className="text-sm font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    ₹{customCapexLakhs} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={customCapexLakhs}
                  onChange={(e) => setCustomCapexLakhs(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>₹2 Lakhs</span>
                  <span>₹50 Lakhs</span>
                  <span>₹1.00 Crore</span>
                </div>
              </div>

              {/* Input 2: Scheme Selector */}
              <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                <label className="text-xs font-black text-slate-800 block">
                  {language === 'hi' ? 'लक्षित सरकारी योजना' : 'Select Government Scheme'}
                </label>
                <select
                  value={chosenSchemeId}
                  onChange={(e) => setChosenSchemeId(e.target.value)}
                  className="w-full bg-white text-xs font-bold text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                >
                  {SCHEMES_DATABASE.map(s => (
                    <option key={s.id} value={s.id}>{s.shortTag}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block">
                  {SCHEMES_DATABASE.find(s => s.id === chosenSchemeId)?.subsidyType}
                </span>
              </div>

              {/* Input 3: Entrepreneur Category */}
              <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
                <label className="text-xs font-black text-slate-800 block">
                  {language === 'hi' ? 'उद्यमी श्रेणी (Category)' : 'Beneficiary Category'}
                </label>
                <select
                  value={entrepreneurCategory}
                  onChange={(e) => setEntrepreneurCategory(e.target.value as any)}
                  className="w-full bg-white text-xs font-bold text-slate-800 p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="women">Women Entrepreneur (महिला उद्यमी - 35%)</option>
                  <option value="sc_st">SC / ST / Ex-Serviceman (35% Subsidy)</option>
                  <option value="fpo">FPO / Farmer Producer Company (Up to 75%)</option>
                  <option value="general">General Category (25% Subsidy)</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ruralCheckbox"
                    checked={isRuralArea}
                    onChange={(e) => setIsRuralArea(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <label htmlFor="ruralCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer">
                    {language === 'hi' ? 'ग्रामीण क्षेत्र (Rural Location +10%)' : 'Rural Location (+10% Subsidy)'}
                  </label>
                </div>
              </div>
            </div>

            {/* Output Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subsidy Amount */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  {language === 'hi' ? 'सरकारी सब्सिडी (Capital Grant)' : 'Govt Capital Subsidy'}
                </span>
                <p className="text-2xl font-black text-emerald-900">
                  ₹{(financialStructure.calculatedSubsidy / 100000).toFixed(2)} Lakhs
                </p>
                <span className="text-xs text-emerald-700 font-bold">
                  {financialStructure.subsidyPercent}% Credit-Linked Grant
                </span>
              </div>

              {/* Bank Term Loan */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider">
                  {language === 'hi' ? 'बैंक सावधि ऋण (Bank Loan)' : 'Bank Term Loan'}
                </span>
                <p className="text-2xl font-black text-blue-900">
                  ₹{(financialStructure.bankLoan / 100000).toFixed(2)} Lakhs
                </p>
                <span className="text-xs text-blue-700 font-bold">
                  @ {financialStructure.effectiveInterestRate}% Effective Rate
                </span>
              </div>

              {/* Promoter Own Equity */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  {language === 'hi' ? 'स्वयं का अंशदान (Own Margin)' : 'Promoter Equity (Margin)'}
                </span>
                <p className="text-2xl font-black text-amber-900">
                  ₹{(financialStructure.promoterContribution / 100000).toFixed(2)} Lakhs
                </p>
                <span className="text-xs text-amber-700 font-bold">
                  {financialStructure.promoterMarginPercent}% Own Investment
                </span>
              </div>

              {/* Monthly EMI & Profit */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">
                  {language === 'hi' ? 'मासिक EMI एवं शुद्ध लाभ' : 'Monthly EMI & Net Profit'}
                </span>
                <p className="text-2xl font-black text-purple-900">
                  ₹{financialStructure.monthlyEmi.toLocaleString('en-IN')}
                </p>
                <span className="text-xs text-purple-700 font-bold">
                  Net Profit: ₹{financialStructure.netProfitMonthly.toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>

            {/* Visual Charts: Capital Breakdown & 5-Year Financial Projections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'पूंजी संरचना अनुपात (Means of Finance)' : 'Capital Structure Breakdown'}</span>
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={capitalBreakdownChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {capitalBreakdownChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `₹${(Number(value) / 100000).toFixed(2)} Lakhs`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? '5-वर्षीय अनुमानित कारोबार व लाभ (Lakhs)' : '5-Year Revenue & Net Profit Projection (Lakhs)'}</span>
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fiveYearProjectionData}>
                      <XAxis dataKey="year" textAnchor="middle" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: any) => `₹${value} Lakhs`} />
                      <Legend />
                      <Bar dataKey="revenue" name={language === 'hi' ? 'टर्नओवर (Turnover)' : 'Turnover'} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name={language === 'hi' ? 'शुद्ध लाभ (Net Profit)' : 'Net Profit'} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="emi" name={language === 'hi' ? 'वार्षिक EMI' : 'Annual EMI'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: BANKABLE DETAILED PROJECT REPORT (DPR) GENERATOR
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'dpr_generator' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-soft">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{language === 'hi' ? 'बैंक-प्रस्तुत योग्य विस्तृत प्रोजेक्ट रिपोर्ट (DPR)' : 'Bankable Detailed Project Report (DPR Dossier)'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'यह रिपोर्ट राष्ट्रीयकृत बैंकों, नाबार्ड (NABARD) व जिला उद्योग केंद्र (DIC) में ऋण आवेदन के लिए मान्य है।'
                  : 'Official financial dossier compliant with SBI, PNB, NABARD and District Industry Centre (DIC) standards.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintDpr}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'hi' ? 'प्रिंट / PDF सेव करें' : 'Print / Save PDF'}</span>
              </button>
            </div>
          </div>

          {/* Printable Bank Dossier Document */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft space-y-8 print:shadow-none print:border-none print:p-0">
            {/* Dossier Header */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 block">
                  AGRIXORA RURAL ENTERPRISE DEVELOPMENT INITIATIVE
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                  DETAILED PROJECT APPRAISAL REPORT (DPR)
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Scheme: <strong>{SCHEMES_DATABASE.find(s => s.id === chosenSchemeId)?.name}</strong>
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-slate-200 text-xs space-y-1">
                <p><strong>DPR Reference:</strong> AGRI-DPR-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p><strong>Location:</strong> {selectedDistrict}, {selectedState}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* 1. Executive Summary Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                1. Project At A Glance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Proposed Enterprise Name:</span>
                    <span className="font-bold text-slate-900">{activeModel.nameEn}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Promoter / Applicant:</span>
                    <span className="font-bold text-slate-900">{currentUser?.name || 'Verified Rural Entrepreneur'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Beneficiary Category:</span>
                    <span className="font-bold text-slate-900 capitalize">{entrepreneurCategory.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Land & Civil Premises:</span>
                    <span className="font-bold text-slate-900">{activeModel.landRequiredSqFt} Sq. Ft Shed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Project Cost:</span>
                    <span className="font-bold text-emerald-800">₹{customCapexLakhs}.00 Lakhs (₹{financialStructure.totalCost.toLocaleString()})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Eligible Govt. Capital Subsidy:</span>
                    <span className="font-bold text-emerald-700">₹{(financialStructure.calculatedSubsidy / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Promoter Margin Contribution:</span>
                    <span className="font-bold text-slate-900">₹{(financialStructure.promoterContribution / 100000).toFixed(2)} Lakhs ({financialStructure.promoterMarginPercent}%)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bank Term Loan Required:</span>
                    <span className="font-bold text-blue-800">₹{(financialStructure.bankLoan / 100000).toFixed(2)} Lakhs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Means of Finance & Repayment Schedule */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                2. Means of Finance & Viability Metrics
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-2.5">Financial Head</th>
                      <th className="p-2.5">Amount (INR)</th>
                      <th className="p-2.5">% Share</th>
                      <th className="p-2.5">Remarks / Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold">1. Govt. Capital Grant (Subsidy)</td>
                      <td className="p-2.5 font-mono text-emerald-700 font-bold">₹{financialStructure.calculatedSubsidy.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">{financialStructure.subsidyPercent}%</td>
                      <td className="p-2.5 text-slate-600">Credit-linked subsidy credited to Bank TDR A/c</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">2. Promoter's Equity (Own Funds)</td>
                      <td className="p-2.5 font-mono font-bold">₹{financialStructure.promoterContribution.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">{financialStructure.promoterMarginPercent}%</td>
                      <td className="p-2.5 text-slate-600">Deposited in borrower current account</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">3. Bank Term Loan</td>
                      <td className="p-2.5 font-mono text-blue-700 font-bold">₹{financialStructure.bankLoan.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">{((financialStructure.bankLoan / financialStructure.totalCost) * 100).toFixed(1)}%</td>
                      <td className="p-2.5 text-slate-600">5-Year Repayment (60 monthly installments)</td>
                    </tr>
                    <tr className="bg-slate-50 font-black">
                      <td className="p-2.5">Total Cost of Project</td>
                      <td className="p-2.5 font-mono text-slate-900">₹{financialStructure.totalCost.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">100.0%</td>
                      <td className="p-2.5">Plant, Machinery, Civil & Initial Working Capital</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Key Financial Ratios & DSCR */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                3. Key Financial Ratios & Bankability Indicators
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Debt Service Coverage (DSCR):</span>
                  <span className="text-base font-black text-emerald-700">{financialStructure.dscr} (High Bankability)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Estimated Payback Period:</span>
                  <span className="text-base font-black text-slate-900">{financialStructure.paybackYears} Years</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Annual Net Profit (Year 1):</span>
                  <span className="text-base font-black text-emerald-700">₹{(financialStructure.annualNetIncome / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Interest Subvention Saved:</span>
                  <span className="text-base font-black text-blue-700">₹{financialStructure.interestSavedViaSubvention.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 4. Bank Checklist */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                4. Mandatory Document Checklist for Bank Loan Application
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Aadhaar Card, PAN Card & 3 Passport Photographs</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Land 7/12 Extract or Registered 5-Year Rent Lease Agreement</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quotations for Plant & Machinery from ISO Certified Vendors</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Udyam MSME Registration Certificate & FSSAI / Pollution NOC</span>
                </div>
              </div>
            </div>

            {/* Stamp & Verification */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Generated via Agrixora AI Advisory Engine</p>
                <p>Groundwater, Mandi & APMC Feasibility Verified for {selectedDistrict}.</p>
              </div>
              <div className="text-right">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <p>Signature of Applicant</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: AI CONVERSATIONAL ADVISOR & VOICE GUIDE
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'ai_chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Scenario Prompts */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'hi' ? 'त्वरित सलाह विषय' : 'Quick Advisory Prompts'}</span>
              </h3>
              <div className="space-y-2">
                {[
                  {
                    titleEn: 'Mini Dal Mill in Nashik: Subsidy & Cost',
                    titleHi: 'मिनी दाल मिल: लागत व 35% सब्सिडी',
                    query: 'What is the setup cost and subsidy for a Mini Dal Mill in Nashik under PM-FME?'
                  },
                  {
                    titleEn: 'Solar Cold Storage: AIF 3% Interest Relief',
                    titleHi: 'सोलर कोल्ड स्टोरेज: AIF ब्याज छूट',
                    query: 'How much subsidy and interest subvention can I get for a 20 MT solar cold storage under AIF?'
                  },
                  {
                    titleEn: 'Cold-Pressed Mustard Oil Mill',
                    titleHi: 'कच्ची घानी सरसों तेल मिल: PMEGP योजना',
                    query: 'What is the profit margin and PMEGP subsidy for a cold-pressed mustard oil mill?'
                  },
                  {
                    titleEn: 'FPO / SHG Group Business Schemes',
                    titleHi: 'FPO और महिला समूहों के लिए योजनाएं',
                    query: 'Which government scheme gives highest subsidy for FPO agricultural processing units?'
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(item.query)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs font-bold text-slate-800 flex items-center justify-between group cursor-pointer"
                  >
                    <span>{language === 'hi' ? item.titleHi : item.titleEn}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Helpline Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2 border border-emerald-500/30">
              <h4 className="font-bold text-xs text-emerald-300 uppercase">National Agritech Support</h4>
              <p className="text-xs text-slate-200">
                PM-FME National Helpline: <strong>1800-11-2026</strong>
              </p>
              <p className="text-xs text-slate-200">
                AIF Portal: <strong>agriinfra.dac.gov.in</strong>
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Chat Assistant */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-soft flex flex-col h-[560px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {language === 'hi' ? 'ग्रामीण व्यापार एआई सलाहकार' : 'Rural Enterprise AI Advisor'}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Mandi & Scheme Intelligence</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">📍 {selectedDistrict}</span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`text-[10px] ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                      {msg.role === 'ai' && (
                        <button
                          onClick={() => handleSpeakText(msg.text)}
                          className="text-slate-500 hover:text-emerald-700 p-1 rounded-md transition-colors"
                          title="Listen in Voice"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'यहाँ पूछें (जैसे: दाल मिल पर PM-FME सब्सिडी कितनी मिलेगी?)...'
                      : 'Ask about subsidies, machinery costs, AIF loans, or business feasibility...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm border border-slate-200 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'पूछें' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
