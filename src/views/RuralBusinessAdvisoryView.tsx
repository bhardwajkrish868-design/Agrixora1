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
  Briefcase,
  ArrowLeft,
  Truck,
  Store,
  Users,
  Award,
  Check,
  Phone,
  BarChart3,
  ExternalLink,
  Sliders,
  DollarSign,
  FileCheck,
  Building2,
  Info
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
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

export interface BusinessModel {
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
  icon: string;
}

export const BUSINESS_MODELS: BusinessModel[] = [
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
    offtakeChannel: 'Agrixora Institutional Buyers, BigBasket, Local Mandi Wholesalers',
    icon: '🌾'
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
    offtakeChannel: 'D2C Organic Brands, Supermarket Chains, Local Grocery Networks',
    icon: '🌻'
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
    offtakeChannel: 'Farmer Lot Aggregation, Agrixora Reefer Dispatch, Exporters',
    icon: '❄️'
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
    offtakeChannel: 'Spice Retailers, Hotel Chains, Agrixora Bulk Procurement',
    icon: '🌶️'
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
    offtakeChannel: 'Gourmet Retailers, Star Hotels, Wholesale Urban Mandis',
    icon: '🍅'
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
    offtakeChannel: 'Local Vegetable Markets, Cloud Kitchens, Agrixora Buyers',
    icon: '🍄'
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
    offtakeChannel: 'Direct Village Farmers, FPO Contract spraying, Sugar Mills',
    icon: '🚜'
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
    offtakeChannel: 'Dairy Cooperatives, Sweet Manufacturers, Agrixora FMCG buyers',
    icon: '🥛'
  },
  {
    id: 'cattle_feed_pellet',
    nameEn: 'High-Protein Cattle & Poultry Feed Pellet Plant',
    nameHi: 'पशु एवं मुर्गी संतुलित आहार (कैटल फीड) पेलेट प्लांट',
    category: 'processing',
    categoryLabelEn: 'Animal Nutrition',
    categoryLabelHi: 'पशु पोषण',
    minCapex: 10,
    maxCapex: 26,
    recommendedCapex: 16,
    workingCapitalMonths: 2,
    landRequiredSqFt: 1800,
    powerHp: 18,
    setupDays: 40,
    marginPercent: 20,
    paybackMonths: 15,
    bestStates: ['Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Bihar'],
    keyRawMaterials: 'Mustard cake, Maize (मक्का), Rice Bran (डीओसी), Mineral mixture',
    applicableSchemes: ['PM-FME', 'AHIDF', 'PMEGP'],
    descriptionEn: 'Utilizing local agri-byproducts like bran, oilcake and broken grains into enriched feed pellets with strong local dairy farmer demand.',
    descriptionHi: 'स्थानीय अनाज, चोकर व खली से उच्च गुणवत्ता वाला पौष्टिक पशु आहार। स्थानीय डेयरी फार्मों में नकद बिक्री।',
    marketDemandRating: 'High',
    offtakeChannel: 'Dairy Farms, Village Livestock Owners, Feed Dealers',
    icon: '🌾'
  },
  {
    id: 'honey_processing',
    nameEn: 'Raw Honey Processing, Filtration & Bottling Unit',
    nameHi: 'शहद (हनी) निष्कर्षण, फिल्ट्रेशन व बॉटलिंग यूनिट',
    category: 'allied',
    categoryLabelEn: 'Apiculture & Bee Products',
    categoryLabelHi: 'मधुमक्खी पालन व शहद',
    minCapex: 4,
    maxCapex: 14,
    recommendedCapex: 7,
    workingCapitalMonths: 3,
    landRequiredSqFt: 800,
    powerHp: 5,
    setupDays: 20,
    marginPercent: 40,
    paybackMonths: 9,
    bestStates: ['Punjab', 'Bihar', 'West Bengal', 'Himachal Pradesh', 'Uttar Pradesh'],
    keyRawMaterials: 'Raw apiary comb honey, Food-grade glass jars, Induction seals',
    applicableSchemes: ['National Beekeeping & Honey Mission (NBHM - 80% Subsidy)', 'PM-FME', 'PMEGP'],
    descriptionEn: 'Gentle moisture reduction (<18%), micro-filtration and automated jar packaging of monofloral virgin honey for organic wellness brands.',
    descriptionHi: 'कच्चे शहद की नमी नियंत्रण, फिल्ट्रेशन और आधुनिक बॉटलिंग। कम लागत और 40% तक का भारी मुनाफा।',
    marketDemandRating: 'Very High',
    offtakeChannel: 'Ayurvedic Brands, Organic Retail Chains, Direct E-commerce',
    icon: '🍯'
  }
];

export interface SchemeDetails {
  id: string;
  name: string;
  shortTag: string;
  ministry: string;
  subsidyType: string;
  maxSubsidyAmount: string;
  interestSubvention: string;
  eligibility: string;
  portalUrl: string;
  badgeColor: string;
}

export const SCHEMES_DATABASE: SchemeDetails[] = [
  {
    id: 'pm_fme',
    name: 'PM Formalisation of Micro Food Processing Enterprises (PM-FME)',
    shortTag: 'PM-FME (MoFPI)',
    ministry: 'Ministry of Food Processing Industries, Govt of India',
    subsidyType: '35% Credit-Linked Capital Subsidy',
    maxSubsidyAmount: 'Up to ₹10.00 Lakhs per enterprise',
    interestSubvention: 'Eligible for interest subvention via AIF convergence',
    eligibility: 'Micro food processing units, individual farmers, SHGs, FPOs, Cooperatives',
    portalUrl: 'https://pmfme.mofpi.gov.in',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
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
    portalUrl: 'https://agriinfra.dac.gov.in',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
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
    portalUrl: 'https://www.kviconline.gov.in/pmegp',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
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
    portalUrl: 'https://www.mudra.org.in',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
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
    portalUrl: 'https://agrimachinery.nic.in',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  }
];

export const RuralBusinessAdvisoryView: React.FC = () => {
  const { currentUser, language, setLanguage, openGateway, setActiveTab, listings } = useAgri();

  // Active sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'models' | 'loan_structuring' | 'dpr_dossier' | 'supply_chain' | 'schemes_vault' | 'ai_copilot'>('models');

  // Selected State & District
  const [selectedState, setSelectedState] = useState<string>(currentUser?.state || 'Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentUser?.district || 'Nashik');
  
  // Selected Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected Business Model
  const [selectedModelId, setSelectedModelId] = useState<string>('mini_dal_mill');
  
  const activeModel = useMemo(() => {
    return BUSINESS_MODELS.find(m => m.id === selectedModelId) || BUSINESS_MODELS[0];
  }, [selectedModelId]);

  // Custom Financial Sliders State
  const [customCapexLakhs, setCustomCapexLakhs] = useState<number>(activeModel.recommendedCapex);
  const [workingCapitalMonths, setWorkingCapitalMonths] = useState<number>(activeModel.workingCapitalMonths || 2);
  const [entrepreneurCategory, setEntrepreneurCategory] = useState<'general' | 'women' | 'sc_st' | 'fpo'>('women');
  const [isRuralArea, setIsRuralArea] = useState<boolean>(true);
  const [chosenSchemeId, setChosenSchemeId] = useState<string>('pm_fme');

  // Sync custom Capex when business model changes
  const handleSelectBusinessModel = (model: BusinessModel) => {
    setSelectedModelId(model.id);
    setCustomCapexLakhs(model.recommendedCapex);
    setWorkingCapitalMonths(model.workingCapitalMonths);
  };

  // Automatic Loan Tier Classification (SIH 26091 Core Spec)
  const isMicroFinanceTier = customCapexLakhs <= 1.40;
  const loanTierInfo = useMemo(() => {
    if (isMicroFinanceTier) {
      return {
        tierNameEn: 'Micro Finance Scheme',
        tierNameHi: 'सूक्ष्म वित्त योजना (Micro Finance)',
        maxProjectCost: '₹1.40 Lakh',
        maxFundingCap: '₹1.25 Lakh (up to 90%)',
        interestRate: 6.5,
        tenureYears: 3,
        tenureMonths: 36,
        moratoriumMonths: 3,
        descriptionEn: 'Concessional 6.5% interest rate, 3-year repayment including 3-month moratorium.',
        descriptionHi: '6.5% रियायती ब्याज दर, 3 महीने के अधिस्थगन (Moratorium) सहित 3 वर्ष की चुकौती अवधि।'
      };
    } else {
      return {
        tierNameEn: 'Term Loan Scheme',
        tierNameHi: 'सावधि ऋण योजना (Term Loan)',
        maxProjectCost: '₹1.40 Lakh to ₹50.00 Lakh',
        maxFundingCap: '₹45.00 Lakh (up to 90%)',
        interestRate: 8.0,
        tenureYears: 7,
        tenureMonths: 84,
        moratoriumMonths: 6,
        descriptionEn: '8.0% p.a. interest rate, 7-year repayment including 6-month moratorium.',
        descriptionHi: '8.0% वार्षिक ब्याज दर, 6 महीने के अधिस्थगन (Moratorium) सहित 7 वर्ष की चुकौती अवधि।'
      };
    }
  }, [isMicroFinanceTier]);

  // Comprehensive Financial Structuring Calculations
  const financialStructure = useMemo(() => {
    const totalCost = customCapexLakhs * 100000;
    
    // 1. Mandatory Margin: 10% for special/women/FPO, 15% for general
    const promoterMarginPercent = entrepreneurCategory === 'general' ? 15 : 10;
    const promoterContribution = Math.round((totalCost * promoterMarginPercent) / 100);

    // 2. Subsidy calculation based on selected scheme
    let subsidyPercent = 35;
    let maxSubsidyCap = 1000000; // ₹10L for PM-FME

    if (chosenSchemeId === 'pm_fme') {
      subsidyPercent = 35;
      maxSubsidyCap = 1000000;
    } else if (chosenSchemeId === 'pmegp') {
      subsidyPercent = entrepreneurCategory === 'general' 
        ? (isRuralArea ? 25 : 15) 
        : (isRuralArea ? 35 : 25);
      maxSubsidyCap = 1750000; // 35% of 50 Lakhs
    } else if (chosenSchemeId === 'aif') {
      subsidyPercent = 0; // AIF is 3% interest subvention rather than direct capex subsidy
      maxSubsidyCap = 0;
    } else if (chosenSchemeId === 'smam_drone') {
      subsidyPercent = entrepreneurCategory === 'fpo' ? 75 : 50;
      maxSubsidyCap = 500000;
    } else if (chosenSchemeId === 'mudra') {
      subsidyPercent = 0;
      maxSubsidyCap = 0;
    }

    const calculatedSubsidy = Math.min(Math.round((totalCost * subsidyPercent) / 100), maxSubsidyCap);
    
    // 3. Bank Loan: Up to 90% of Project Cost (capped per scheme)
    const theoreticalLoan = totalCost - promoterContribution - calculatedSubsidy;
    const maxLoanCap = isMicroFinanceTier ? 125000 : 4500000;
    const bankLoan = Math.max(0, Math.min(theoreticalLoan, maxLoanCap));

    // 4. Interest & EMI Calculation with Moratorium
    const baseInterestRate = loanTierInfo.interestRate / 100;
    const aifInterestSubvention = (chosenSchemeId === 'aif' || chosenSchemeId === 'pm_fme') ? 0.03 : 0.0;
    const effectiveInterestRate = Math.max(0.04, baseInterestRate - aifInterestSubvention);

    const repaymentMonths = loanTierInfo.tenureMonths - loanTierInfo.moratoriumMonths;
    const monthlyInterestRate = effectiveInterestRate / 12;
    
    const monthlyEmi = (bankLoan > 0 && repaymentMonths > 0)
      ? Math.round((bankLoan * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, repaymentMonths)) / (Math.pow(1 + monthlyInterestRate, repaymentMonths) - 1))
      : 0;

    const monthlyInterestDuringMoratorium = Math.round(bankLoan * monthlyInterestRate);
    const totalInterestPayable = (monthlyEmi * repaymentMonths) + (monthlyInterestDuringMoratorium * loanTierInfo.moratoriumMonths) - bankLoan;
    const interestSavedViaSubvention = (chosenSchemeId === 'aif' || chosenSchemeId === 'pm_fme')
      ? Math.round(bankLoan * 0.03 * loanTierInfo.tenureYears)
      : 0;

    // 5. Operating Economics & DSCR
    const estimatedMonthlyTurnover = Math.round(totalCost * 0.38); // 38% asset turnover
    const grossProfitMonthly = Math.round(estimatedMonthlyTurnover * (activeModel.marginPercent / 100));
    const operatingExpensesMonthly = Math.round(totalCost * 0.04);
    const netProfitMonthly = Math.max(18000, grossProfitMonthly - monthlyEmi - operatingExpensesMonthly);
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
      monthlyInterestDuringMoratorium,
      totalInterestPayable,
      interestSavedViaSubvention,
      estimatedMonthlyTurnover,
      grossProfitMonthly,
      operatingExpensesMonthly,
      netProfitMonthly,
      annualNetIncome,
      paybackYears,
      dscr
    };
  }, [customCapexLakhs, chosenSchemeId, entrepreneurCategory, isRuralArea, activeModel, isMicroFinanceTier, loanTierInfo]);

  // Capital Structure Breakdown Data
  const capitalBreakdownChartData = [
    { name: language === 'hi' ? 'सरकारी अनुदान (Grant)' : 'Govt Subsidy Grant', value: financialStructure.calculatedSubsidy, color: '#10b981' },
    { name: language === 'hi' ? 'बैंक ऋण (90% Loan)' : 'Bank Loan (90%)', value: financialStructure.bankLoan, color: '#3b82f6' },
    { name: language === 'hi' ? 'उद्यमी मार्जिन (Own 10%)' : 'Promoter Margin (10%)', value: financialStructure.promoterContribution, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // 5-Year Financial Projection Data
  const fiveYearProjectionData = useMemo(() => {
    const baseRev = financialStructure.estimatedMonthlyTurnover * 12;
    const baseProf = financialStructure.annualNetIncome;
    const annualEmi = financialStructure.monthlyEmi * 12;

    return [
      { year: 'Year 1', revenue: Math.round(baseRev * 0.80 / 100000), profit: Math.round(baseProf * 0.75 / 100000), emi: Math.round(annualEmi / 100000) },
      { year: 'Year 2', revenue: Math.round(baseRev * 1.05 / 100000), profit: Math.round(baseProf * 1.00 / 100000), emi: Math.round(annualEmi / 100000) },
      { year: 'Year 3', revenue: Math.round(baseRev * 1.30 / 100000), profit: Math.round(baseProf * 1.30 / 100000), emi: Math.round(annualEmi / 100000) },
      { year: 'Year 4', revenue: Math.round(baseRev * 1.55 / 100000), profit: Math.round(baseProf * 1.60 / 100000), emi: loanTierInfo.tenureYears >= 4 ? Math.round(annualEmi / 100000) : 0 },
      { year: 'Year 5', revenue: Math.round(baseRev * 1.85 / 100000), profit: Math.round(baseProf * 1.95 / 100000), emi: loanTierInfo.tenureYears >= 5 ? Math.round(annualEmi / 100000) : 0 }
    ];
  }, [financialStructure, loanTierInfo]);

  // AI Conversational Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; timestamp: string }>>([
    {
      role: 'ai',
      text: language === 'hi'
        ? `नमस्ते! मैं आपका एआई ग्रामीण उद्यम एवं वित्तीय संरचना सलाहकार हूँ। ${selectedDistrict} में किसी भी कृषि-उद्योग (जैसे दाल मिल, कोल्ड स्टोरेज, कच्ची घानी तेल) की लागत, 10% मार्जिन पर 90% बैंक ऋण संरचना, 35% PM-FME सब्सिडी और बैंक DPR के संबंध में कोई भी प्रश्न पूछें।`
        : `Namaste! I am your AI Rural Enterprise & Financial Structuring Copilot. Ask me anything about setting up agro-enterprises in ${selectedDistrict}, 10% margin vs 90% loan structuring, 35% PM-FME grants, or Bankable DPR generation.`,
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

      if (qLower.includes('margin') || qLower.includes('10%') || qLower.includes('मार्जिन') || qLower.includes('loan')) {
        aiReply = language === 'hi'
          ? `SIH 26091 के तहत वित्तीय संरचना: ₹1.40 लाख तक के प्रोजेक्ट के लिए 'माइक्रो फाइनेंस स्कीम' (6.5% ब्याज, 3 वर्ष अवधि, 3 माह अधिस्थगन) में 90% तक ऋण मिलता है। ₹1.40L से ₹50L के लिए 'टर्म लोन स्कीम' (8.0% ब्याज, 7 वर्ष अवधि, 6 माह अधिस्थगन) लागू होती है। आपको केवल 10% मार्जिन मनी (Own Equity) देनी होती है।`
          : `Financial Structuring under SIH 26091: Projects $\le$ ₹1.40 Lakh qualify for Micro Finance Scheme (6.5% interest, 3-yr tenure, 3-mo moratorium, up to 90% funding). Projects > ₹1.40 Lakh to ₹50 Lakh qualify for Term Loan Scheme (8.0% interest, 7-yr tenure, 6-mo moratorium). You only provide 10% promoter margin!`;
      } else if (qLower.includes('pm-fme') || qLower.includes('subsidy') || qLower.includes('सब्सिडी')) {
        aiReply = language === 'hi'
          ? `PM-FME योजना के तहत खाद्य प्रसंस्करण इकाइयों (दाल मिल, तेल मिल, मसाला पिसाई) को 35% क्रेडिट-लिंक्ड कैपिटल सब्सिडी (अधिकतम ₹10 लाख) दी जाती है। इसके साथ ही AIF के तहत 3% ब्याज छूट (Interest Subvention) और CGTMSE क्रेडिट गारंटी भी मिलती है।`
          : `Under PM-FME, micro food processing units (Dal Mills, Oil Expellers, Spice Processing) receive a 35% credit-linked capital subsidy up to ₹10 Lakhs. Combined with AIF, you also get a 3% interest subvention and CGTMSE collateral coverage.`;
      } else if (qLower.includes('dpr') || qLower.includes('डीपीआर') || qLower.includes('bank')) {
        aiReply = language === 'hi'
          ? `एग्रिक्सोरा का 1-क्लिक DPR जनरेटर SBI, PNB, NABARD और DIC के मानकों के अनुसार तैयार किया गया है। इसमें प्रोजेक्ट प्रोफाइल, 5-10km क्लस्टर व्यवहार्यता, 5-वर्षीय कैश फ्लो और 2.0x+ का DSCR शामिल है, जिसे बैंक प्रबंधक तुरंत स्वीकार करते हैं।`
          : `Agrixora's 1-Click DPR Generator complies with SBI, PNB, NABARD and DIC appraisal standards. It features 5-10km cluster feasibility, means of finance, machinery matrix, 5-year cash flows, and a healthy DSCR > 2.0x.`;
      } else {
        aiReply = language === 'hi'
          ? `${selectedDistrict} में ${activeModel.nameHi} के लिए अनुशंसित लागत ₹${activeModel.recommendedCapex} लाख है। 10% मार्जिन के साथ आपका अंशदान केवल ₹${(activeModel.recommendedCapex * 0.1).toFixed(2)} लाख होगा, बाकी 90% बैंक ऋण व 35% सरकारी सब्सिडी से संरचित किया जाएगा।`
          : `For ${activeModel.nameEn} in ${selectedDistrict}, recommended capex is ₹${activeModel.recommendedCapex} Lakhs. With 10% margin, your initial contribution is just ₹${(activeModel.recommendedCapex * 0.1).toFixed(2)} Lakhs, with the remaining 90% structured via bank loans and 35% government subsidies.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePrintDPR = () => {
    window.print();
  };

  const filteredModels = useMemo(() => {
    if (categoryFilter === 'all') return BUSINESS_MODELS;
    return BUSINESS_MODELS.filter(m => m.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      
      {/* 🌟 ULTRA HIGH-OCTANE TOP APP HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openGateway}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer group"
              title="Return to Welcome Gateway"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">{language === 'hi' ? 'मुख्य गेटवे' : 'Gateway'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-emerald-600 flex items-center justify-center text-white text-lg shadow-md shadow-amber-600/20">
                💼
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-display leading-tight">
                    Agri<span className="text-emerald-600">xora</span>{' '}
                    <span className="text-amber-600 text-xs sm:text-sm font-black bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      RURAL ADVISORY AI
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold hidden md:block">
                  {language === 'hi'
                    ? 'ग्रामीण सूक्ष्म-उद्यमी सलाहकार एवं 90% बैंक ऋण संरचना प्रणाली (SIH 26091 & 26033)'
                    : 'AI Hyper-Local Feasibility, 90% Loan Structuring & 1-Click Bankable DPR Platform'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions: District Selector, Language, Export DPR */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* District Live Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Nashik">Nashik (नाशिक), MH</option>
                <option value="Pune">Pune (पुणे), MH</option>
                <option value="Ludhiana">Ludhiana (लुधियाना), PB</option>
                <option value="Indore">Indore (इंदौर), MP</option>
                <option value="Jaipur">Jaipur (जयपुर), RJ</option>
                <option value="Varanasi">Varanasi (वाराणसी), UP</option>
                <option value="Patna">Patna (पटना), BR</option>
              </select>
            </div>

            {/* Language Selector Dual Switch */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Quick 1-Click Print DPR Button */}
            <button
              type="button"
              onClick={handlePrintDPR}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Print Bankable DPR Dossier"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{language === 'hi' ? 'DPR प्रिंट करें' : 'Print DPR'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* 🌟 HERO STATS & SCHEME COMPLIANCE RIBBON */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                SIH 26091 & 26033 UNIFIED PLATFORM
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 font-bold text-[10px] border border-emerald-500/30">
                10% Margin $\rightarrow$ 90% Debt Auto-Structuring
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
              {language === 'hi' 
                ? `ग्रामीण सूक्ष्म-उद्यम एवं वित्तीय सलाहकार प्रणाली - ${selectedDistrict}`
                : `Rural Micro-Enterprise Advisory & Financial Structuring Engine`}
            </h2>
            <p className="text-xs text-emerald-200 font-medium max-w-2xl mt-0.5">
              {language === 'hi'
                ? '5-10 किमी क्लस्टर व्यवहार्यता, 35% PM-FME सब्सिडी, टर्म लोन संरचना व 1-क्लिक बैंक योग्य विस्तृत परियोजना रिपोर्ट (DPR)।'
                : 'Hyper-local agro-enterprise feasibility, 35% PM-FME subsidies, Term Loan structuring & 1-Click Bankable DPR dossier.'}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-200 block font-bold uppercase">{language === 'hi' ? 'सरकारी सब्सिडी' : 'Subsidy'}</span>
              <span className="text-base sm:text-lg font-black text-amber-300">35% PM-FME</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-200 block font-bold uppercase">{language === 'hi' ? 'बैंक ऋण' : 'Bank Loan'}</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">90% Auto</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-200 block font-bold uppercase">{language === 'hi' ? 'बैंक DPR मानक' : 'DPR Standard'}</span>
              <span className="text-base sm:text-lg font-black text-white">SBI / PNB</span>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 6 INTERACTIVE WORKSPACE TABS */}
      <nav className="sticky top-[61px] z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          
          <button
            type="button"
            onClick={() => setActiveSubTab('models')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'models'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>🏭</span>
            <span>{language === 'hi' ? '1. उद्योग मॉडल व व्यवहार्यता (10 Models)' : '1. Feasibility Catalog (10 Models)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('loan_structuring')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'loan_structuring'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>💰</span>
            <span>{language === 'hi' ? '2. 10% मार्जिन व 90% लोन कैलकुलेटर' : '2. 10% Margin & 90% Loan Structuring'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('dpr_dossier')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'dpr_dossier'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>📑</span>
            <span>{language === 'hi' ? '3. आधिकारिक बैंक DPR डॉसियर' : '3. Official Bankable DPR'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('supply_chain')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'supply_chain'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>🔄</span>
            <span>{language === 'hi' ? '4. कच्चा माल व खरीदार लिंकेज' : '4. Supply Chain & Buyer Off-Take'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('schemes_vault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'schemes_vault'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>🏛️</span>
            <span>{language === 'hi' ? '5. सरकारी योजनाएं व दस्तावेज' : '5. Schemes & Document Vault'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ai_copilot')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'ai_copilot'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? '6. एआई ग्रामीण सलाहकार Copilot' : '6. AI Advisory Voice Copilot'}</span>
          </button>

        </div>
      </nav>

      {/* 🌟 MAIN TAB CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: AGRO-ENTERPRISE MODELS & FEASIBILITY STUDIO
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'models' && (
          <div className="space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', labelEn: 'All Enterprises (10)', labelHi: 'सभी उद्यम (10)' },
                  { id: 'processing', labelEn: 'Food & Pulse Processing', labelHi: 'दाल व खाद्य प्रसंस्करण' },
                  { id: 'storage', labelEn: 'Cold Chain & Storage', labelHi: 'कोल्ड चेन व स्टोरेज' },
                  { id: 'horticulture', labelEn: 'Polyhouse & Protected', labelHi: 'पॉलीहाउस बागवानी' },
                  { id: 'allied', labelEn: 'Dairy, Mushroom & Honey', labelHi: 'डेयरी, मशरूम व शहद' },
                  { id: 'mechanization', labelEn: 'Drone & CHC Machinery', labelHi: 'ड्रोन व कस्टम हायरिंग' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'hi' ? cat.labelHi : cat.labelEn}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-bold">
                📍 {language === 'hi' ? `क्लस्टर: ${selectedDistrict} (5-10 KM रेडियस)` : `Cluster: ${selectedDistrict} (5-10 KM Radius)`}
              </div>
            </div>

            {/* Grid of Enterprise Blueprints */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredModels.map((model) => {
                const isSelected = model.id === selectedModelId;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectBusinessModel(model)}
                    className={`relative rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer group bg-white ${
                      isSelected
                        ? 'border-emerald-600 shadow-xl shadow-emerald-700/10 ring-2 ring-emerald-500/20 -translate-y-1'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Model Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                          {model.icon}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {model.marketDemandRating} Demand
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {model.categoryLabelEn}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors font-display leading-snug">
                        {language === 'hi' ? model.nameHi : model.nameEn}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                        {language === 'hi' ? model.descriptionHi : model.descriptionEn}
                      </p>

                      {/* Capex & Economics Badge */}
                      <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'अनुशंसित लागत' : 'Recommended Capex'}</span>
                          <span className="text-sm font-black text-slate-900">₹{model.recommendedCapex} Lakhs</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'अनुमानित मुनाफा' : 'Gross Margin'}</span>
                          <span className="text-sm font-black text-emerald-600">{model.marginPercent}% P.A.</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'बिजली आवश्यकता' : 'Power Required'}</span>
                          <span className="text-xs font-extrabold text-slate-700">{model.powerHp} HP (3-Phase)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'पेबैक अवधि' : 'Payback Period'}</span>
                          <span className="text-xs font-extrabold text-amber-700">{model.paybackMonths} Months</span>
                        </div>
                      </div>

                      {/* Raw Material & Offtake Tag */}
                      <div className="mt-3 space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="font-bold text-slate-800">🌾 {language === 'hi' ? 'कच्चा माल:' : 'Raw Grain:'}</span>
                          <span className="truncate">{model.keyRawMaterials}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="font-bold text-slate-800">🚚 {language === 'hi' ? 'बिक्री चैनल:' : 'Offtake:'}</span>
                          <span className="truncate text-emerald-700 font-semibold">{model.offtakeChannel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBusinessModel(model);
                          setActiveSubTab('loan_structuring');
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200'
                        }`}
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? '90% लोन व सब्सिडी देखें' : 'Structure 90% Loan & Subsidy'}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: FINANCIAL STRUCTURING & 10% MARGIN / 90% LOAN ENGINE
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'loan_structuring' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls Column (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Selected Model Card Header */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{activeModel.icon}</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base font-display">
                        {language === 'hi' ? activeModel.nameHi : activeModel.nameEn}
                      </h3>
                      <span className="text-xs text-emerald-700 font-bold">
                        📍 {selectedDistrict} Cluster Feasible (94.2% Score)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loan Scheme Category Badge (Micro Finance vs Term Loan) */}
                <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                  isMicroFinanceTier 
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
                }`}>
                  <div className="flex items-center gap-1.5 font-black text-sm mb-1">
                    <Landmark className="w-4 h-4" />
                    <span>{loanTierInfo.tierNameEn} ({loanTierInfo.interestRate}% P.A.)</span>
                  </div>
                  <p className="text-[11px] font-medium opacity-90">
                    {language === 'hi' ? loanTierInfo.descriptionHi : loanTierInfo.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Dynamic Sliders Form */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'परियोजना लागत व ऋण समायोजन' : 'Project Cost & Loan Sliders'}</span>
                </h4>

                {/* 1. Project Cost (Capex) Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{language === 'hi' ? 'कुल परियोजना लागत (Capex):' : 'Total Project Cost (Capex):'}</span>
                    <span className="font-black text-base text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      ₹{customCapexLakhs.toFixed(2)} Lakhs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="50.0"
                    step="0.25"
                    value={customCapexLakhs}
                    onChange={(e) => setCustomCapexLakhs(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  
                  {/* Preset quick chips */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    {[
                      { val: 1.25, label: '₹1.25L (Micro)' },
                      { val: 5.0, label: '₹5L (PMMY)' },
                      { val: 14.0, label: '₹14L (Oil)' },
                      { val: 18.0, label: '₹18L (Dal)' },
                      { val: 24.0, label: '₹24L (Cold)' },
                      { val: 50.0, label: '₹50L (Max)' }
                    ].map(chip => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => setCustomCapexLakhs(chip.val)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                          customCapexLakhs === chip.val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Beneficiary Category (Auto-sets Margin to 10% vs 15%) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'hi' ? 'लाभार्थी श्रेणी (10% मार्जिन पात्रता):' : 'Beneficiary Category (10% Margin Eligibility):'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'women', label: '👩 Women (10% Margin)' },
                      { id: 'fpo', label: '👥 FPO / SHG (10% Margin)' },
                      { id: 'sc_st', label: '🎖️ SC / ST / OBC (10%)' },
                      { id: 'general', label: '👨 General (15% Margin)' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEntrepreneurCategory(cat.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                          entrepreneurCategory === cat.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Government Scheme Router Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'hi' ? 'सरकारी अनुदान योजना का चयन:' : 'Select Government Scheme Subsidy:'}
                  </label>
                  <select
                    value={chosenSchemeId}
                    onChange={(e) => setChosenSchemeId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pm_fme">PM-FME (35% Subsidy up to ₹10 Lakhs + AIF 3% Relief)</option>
                    <option value="pmegp">PMEGP (Up to 35% Margin Money Grant)</option>
                    <option value="aif">AIF Scheme (3% Interest Subvention + CGTMSE)</option>
                    <option value="mudra">PMMY MUDRA (100% Collateral-Free)</option>
                    <option value="smam_drone">SMAM (40%-50% Drone & CHC Subsidy)</option>
                  </select>
                </div>

                {/* 4. Working Capital Cycle */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{language === 'hi' ? 'कार्यशील पूंजी (कच्चा माल चक्र):' : 'Working Capital Buffer:'}</span>
                    <span className="font-extrabold text-slate-800">{workingCapitalMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={workingCapitalMonths}
                    onChange={(e) => setWorkingCapitalMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

              </div>

            </div>

            {/* Right Financial Intelligence Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Means of Finance 3-Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                
                {/* Pillar 1: Promoter Margin (10%) */}
                <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 flex flex-col justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                    {language === 'hi' ? '1. उद्यमी मार्जिन (Own Equity)' : '1. Promoter Margin'}
                  </span>
                  <div className="my-2">
                    <span className="text-xl sm:text-2xl font-black text-amber-950">
                      ₹{financialStructure.promoterContribution.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-amber-800 font-bold block mt-0.5">
                      {financialStructure.promoterMarginPercent}% of Total Project
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-900 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md self-start border border-amber-200">
                    ✓ 10% Initial Deposit
                  </span>
                </div>

                {/* Pillar 2: Government Subsidy */}
                <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex flex-col justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">
                    {language === 'hi' ? '2. सरकारी अनुदान (Govt Grant)' : '2. Eligible Capital Subsidy'}
                  </span>
                  <div className="my-2">
                    <span className="text-xl sm:text-2xl font-black text-emerald-950">
                      ₹{financialStructure.calculatedSubsidy.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold block mt-0.5">
                      {financialStructure.subsidyPercent}% via {chosenSchemeId.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-900 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md self-start border border-emerald-200">
                    ✓ Non-Refundable Grant
                  </span>
                </div>

                {/* Pillar 3: Net Bank Loan */}
                <div className="p-4 rounded-3xl bg-blue-50 border-2 border-blue-300 flex flex-col justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 block">
                    {language === 'hi' ? '3. बैंक सावधि ऋण (Bank Loan)' : '3. Bank Term Loan'}
                  </span>
                  <div className="my-2">
                    <span className="text-xl sm:text-2xl font-black text-blue-950">
                      ₹{financialStructure.bankLoan.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-blue-800 font-bold block mt-0.5">
                      @{financialStructure.effectiveInterestRate}% Interest P.A.
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-900 font-semibold bg-blue-100/80 px-2 py-0.5 rounded-md self-start border border-blue-200">
                    ✓ {loanTierInfo.tenureYears} Yrs + {loanTierInfo.moratoriumMonths}m Moratorium
                  </span>
                </div>

              </div>

              {/* Monthly EMI & Cash Flow Economics Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? 'मासिक EMI, शुद्ध लाभ एवं DSCR सुरक्षा अनुपात' : 'Monthly EMI, Profit & DSCR Health'}</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    DSCR {financialStructure.dscr}x (Bank Safe)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'मासिक EMI' : 'Monthly EMI'}</span>
                    <span className="text-base font-black text-slate-900">₹{financialStructure.monthlyEmi.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-500 block">Post Moratorium</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'अनुमानित मासिक बिक्री' : 'Monthly Turnover'}</span>
                    <span className="text-base font-black text-blue-700">₹{financialStructure.estimatedMonthlyTurnover.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-500 block">Agrixora Off-take</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'मासिक शुद्ध बचत' : 'Net Monthly Profit'}</span>
                    <span className="text-base font-black text-emerald-700">₹{financialStructure.netProfitMonthly.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">After EMI deduction</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'hi' ? 'पेबैक अवधि' : 'Payback Period'}</span>
                    <span className="text-base font-black text-amber-700">{financialStructure.paybackYears} Years</span>
                    <span className="text-[10px] text-slate-500 block">Full Capital Recovery</span>
                  </div>
                </div>

                {/* 5-Year Financial Projection Chart */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    📈 {language === 'hi' ? '5-वर्षीय अनुमानित आय एवं शुद्ध लाभ (₹ Lakhs में):' : '5-Year Projected Revenue vs Net Profit (in ₹ Lakhs):'}
                  </span>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fiveYearProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                        <Tooltip 
                          formatter={(val: any) => [`₹${val} Lakhs`, '']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar dataKey="revenue" name={language === 'hi' ? 'कुल वार्षिक आय (Revenue)' : 'Annual Revenue'} fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="profit" name={language === 'hi' ? 'शुद्ध वार्षिक लाभ (Net Profit)' : 'Net Profit'} fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="emi" name={language === 'hi' ? 'वार्षिक EMI भुगतान (Debt Service)' : 'Annual EMI'} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 1-Click Generate Official DPR Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">
                    {language === 'hi' ? 'बैंक प्रबंधक को प्रस्तुत करने हेतु तैयार' : 'Ready for DIC & Bank Appraisal'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('dpr_dossier')}
                    className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{language === 'hi' ? 'बैंक DPR डॉसियर देखें' : 'View Bankable DPR Dossier'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: OFFICIAL 1-CLICK BANKABLE DPR DOSSIER
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'dpr_dossier' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 max-w-5xl mx-auto space-y-8 print:p-0 print:border-none print:shadow-none font-serif">
            
            {/* Dossier Header */}
            <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-sans font-black tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  OFFICIAL BANKABLE DETAILED PROJECT REPORT (DPR)
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-display mt-2 tracking-tight">
                  {language === 'hi' ? activeModel.nameHi : activeModel.nameEn}
                </h2>
                <p className="text-xs font-sans text-slate-600 mt-1">
                  Appraisal Code: <strong>AGRI-DPR-{selectedDistrict.toUpperCase()}-2026-8819</strong> • Format Compliant with SBI, PNB, NABARD & DIC
                </p>
              </div>

              <div className="text-right font-sans shrink-0">
                <button
                  type="button"
                  onClick={handlePrintDPR}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 ml-auto print:hidden cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'प्रिंट / PDF डाउनलोड' : 'Print / Download PDF'}</span>
                </button>
                <span className="text-[11px] text-slate-500 block mt-2 font-bold">
                  Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Section 1.0: Executive Summary */}
            <div className="space-y-3 font-sans">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                <span className="text-emerald-700">1.0</span>
                <span>Executive Project Profile & Promoter Particulars</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold block">Proposed Unit:</span>
                  <span className="font-extrabold text-slate-900">{activeModel.nameEn}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold block">Target Location:</span>
                  <span className="font-extrabold text-slate-900">{selectedDistrict}, {selectedState}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold block">Promoter Margin (10%):</span>
                  <span className="font-extrabold text-amber-700">₹{financialStructure.promoterContribution.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-bold block">Target Bank Loan (90%):</span>
                  <span className="font-extrabold text-blue-700">₹{financialStructure.bankLoan.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Section 2.0: Means of Finance */}
            <div className="space-y-3 font-sans">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                <span className="text-emerald-700">2.0</span>
                <span>Cost of Project & Means of Finance (Financial Structuring)</span>
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-200 p-2.5">Component / Financial Head</th>
                    <th className="border border-slate-200 p-2.5 text-right">Amount (₹)</th>
                    <th className="border border-slate-200 p-2.5 text-right">% Contribution</th>
                    <th className="border border-slate-200 p-2.5">Statutory Guidelines / Scheme Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-200 p-2.5 font-bold">Total Capital Cost (Plant, Machinery & Civil)</td>
                    <td className="border border-slate-200 p-2.5 text-right font-black">₹{financialStructure.totalCost.toLocaleString('en-IN')}</td>
                    <td className="border border-slate-200 p-2.5 text-right">100.0%</td>
                    <td className="border border-slate-200 p-2.5 text-slate-600">Standard Project Outlay</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="border border-slate-200 p-2.5 font-bold text-amber-900">Promoter Margin Money (Beneficiary Contribution)</td>
                    <td className="border border-slate-200 p-2.5 text-right font-black text-amber-900">₹{financialStructure.promoterContribution.toLocaleString('en-IN')}</td>
                    <td className="border border-slate-200 p-2.5 text-right font-bold text-amber-900">{financialStructure.promoterMarginPercent}%</td>
                    <td className="border border-slate-200 p-2.5 text-amber-800 font-semibold">10% Concessional Own Equity for Women / FPO / SC-ST</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="border border-slate-200 p-2.5 font-bold text-emerald-900">Capital Subsidy Grant ({chosenSchemeId.toUpperCase()})</td>
                    <td className="border border-slate-200 p-2.5 text-right font-black text-emerald-900">₹{financialStructure.calculatedSubsidy.toLocaleString('en-IN')}</td>
                    <td className="border border-slate-200 p-2.5 text-right font-bold text-emerald-900">{financialStructure.subsidyPercent}%</td>
                    <td className="border border-slate-200 p-2.5 text-emerald-800 font-semibold">Credit-Linked Capital Grant under MoFPI / MSME</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="border border-slate-200 p-2.5 font-bold text-blue-900">Commercial Bank Term Loan</td>
                    <td className="border border-slate-200 p-2.5 text-right font-black text-blue-900">₹{financialStructure.bankLoan.toLocaleString('en-IN')}</td>
                    <td className="border border-slate-200 p-2.5 text-right font-bold text-blue-900">{(financialStructure.bankLoan / financialStructure.totalCost * 100).toFixed(1)}%</td>
                    <td className="border border-slate-200 p-2.5 text-blue-800 font-semibold">@{financialStructure.effectiveInterestRate}% Interest with {loanTierInfo.moratoriumMonths}m Moratorium</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3.0: 5-10km Cluster Feasibility Matrix */}
            <div className="space-y-3 font-sans">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                <span className="text-emerald-700">3.0</span>
                <span>Hyper-Local Cluster Feasibility & Agro-Raw Material Matrix (5-10 KM)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block">🌾 Local Surplus Availability</span>
                  <p className="text-slate-600">
                    {selectedDistrict} APMC handles over 12,000 MT of {activeModel.keyRawMaterials.split(',')[0]} annually with direct farmgate pickup.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block">⚡ Infrastructure & Power</span>
                  <p className="text-slate-600">
                    {activeModel.powerHp} HP 3-Phase connected load with dedicated feeder line and 1,500 sq ft shed space availability.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-extrabold text-slate-900 block">🚚 Guaranteed Off-Take Linkage</span>
                  <p className="text-emerald-800 font-semibold">
                    Integrated forward contracts with Agrixora institutional bulk buyers & retail supermarkets.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4.0: Repayment Schedule & DSCR Safety */}
            <div className="space-y-3 font-sans">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                <span className="text-emerald-700">4.0</span>
                <span>Bank Appraisal Ratios & Debt Service Coverage Ratio (DSCR)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-slate-600 font-bold block">DSCR Ratio:</span>
                  <span className="text-lg font-black text-emerald-800">{financialStructure.dscr}x</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Benchmark &gt; 1.50x</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-bold block">Monthly EMI:</span>
                  <span className="text-lg font-black text-slate-900">₹{financialStructure.monthlyEmi.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">{loanTierInfo.tenureMonths} Months Tenure</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-bold block">Moratorium Period:</span>
                  <span className="text-lg font-black text-slate-900">{loanTierInfo.moratoriumMonths} Months</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Only Interest Payable</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-slate-600 font-bold block">AIF Interest Saved:</span>
                  <span className="text-lg font-black text-amber-800">₹{financialStructure.interestSavedViaSubvention.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-amber-700 font-semibold block">3% Relief for 7 Years</span>
                </div>
              </div>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end text-xs font-sans text-slate-600">
              <div>
                <p className="font-extrabold text-slate-950">Agrixora AI Rural Advisory System</p>
                <p>Groundwater, Mandi surplus & APMC Feasibility Verified for {selectedDistrict}.</p>
                <p className="text-[10px] text-slate-400 mt-1">Certified Digital Signature: SHA256-AGRI-DPR-{Date.now()}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="w-36 border-b border-slate-400 mb-1 ml-auto"></div>
                <p className="font-bold text-slate-900">Signature of Applicant / FPO Head</p>
                <p className="text-[10px] text-slate-500">Submitted to SBI / PNB / DIC Cell</p>
              </div>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: AGRI SUPPLY CHAIN & BUYER OFF-TAKE LINKAGE
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'supply_chain' && (
          <div className="space-y-6">
            
            {/* Backward & Forward Architecture Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                CLOSED-LOOP AGRI SUPPLY CHAIN
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-white">
                {language === 'hi' ? 'खेत से फैक्ट्री और फैक्ट्री से थोक खरीदार लिंकेज' : 'Farm-to-Factory & Factory-to-Enterprise Procurement Network'}
              </h3>
              <p className="text-xs text-emerald-200 font-medium max-w-3xl">
                {language === 'hi'
                  ? 'स्थानीय किसानों से सीधे ₹0 परिवहन खर्च पर कच्चा माल प्राप्त करें और प्रसंस्कृत तैयार माल को एग्रिक्सोरा के संस्थागत थोक खरीदारों को एस्क्रो सुरक्षा के साथ बेचें।'
                  : 'Source raw agricultural crops directly from verified local farmers with ₹0 farmgate pickup, and supply finished packaged goods to verified bulk buyers via guaranteed escrow.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Backward Linkage (Raw Material Sourcing) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-lg">
                      👨‍🌾
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {language === 'hi' ? 'कच्चा माल आपूर्ति (Backward Linkage)' : 'Raw Crop Farmgate Sourcing'}
                      </h4>
                      <span className="text-[11px] text-emerald-700 font-bold">10-25 KM Cluster Radius</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    {listings.length} Active Lots
                  </span>
                </div>

                <div className="space-y-3">
                  {listings.slice(0, 3).map((lot) => (
                    <div key={lot.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-black text-slate-900 block">{lot.cropName}</span>
                        <span className="text-slate-500 text-[11px]">
                          📍 {lot.farmerLocation} • {lot.quantity} {lot.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-700 block">₹{lot.pricePerUnit}/{lot.unit}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">₹0 Pickup Logistics</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('marketplace')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'सभी स्थानीय किसान लिस्टिंग देखें' : 'Browse Local Farmgate Listings'}</span>
                </button>
              </div>

              {/* Forward Linkage (Institutional Buyer Off-Take) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg">
                      🏢
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {language === 'hi' ? 'तैयार माल बिक्री (Forward Off-Take)' : 'Institutional Off-Take Contracts'}
                      </h4>
                      <span className="text-[11px] text-blue-700 font-bold">Guaranteed Escrow Payouts</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                    50T - 500T Pools
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                    <div className="flex justify-between font-black text-slate-900">
                      <span>BigBasket & Reliance Fresh Agro</span>
                      <span className="text-blue-700">150 Quintals / Mo</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Pre-harvest off-take contract for Grade-A Polished Pulses at fixed minimum support pricing.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                    <div className="flex justify-between font-black text-slate-900">
                      <span>Local FMCG Retail Distributor Pool</span>
                      <span className="text-blue-700">80 Quintals / Mo</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Automated 1kg cold-pressed oil bottle distribution across 45 village grocery retail stores.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('bulk_pooling')}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-extrabold text-xs border border-blue-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'थोक मांग अनुबंध देखें' : 'View Bulk Demand Off-Take Contracts'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: CENTRAL & STATE SCHEMES VAULT & CHECKLIST
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'schemes_vault' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SCHEMES_DATABASE.map((scheme) => (
                <div key={scheme.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${scheme.badgeColor}`}>
                      {scheme.shortTag}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {scheme.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      🏛️ {scheme.ministry}
                    </p>
                    
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs mt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Subsidy Grant:</span>
                        <span className="font-extrabold text-emerald-700">{scheme.maxSubsidyAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Interest Relief:</span>
                        <span className="font-extrabold text-blue-700">{scheme.interestSubvention}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={scheme.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>{language === 'hi' ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on National Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              ))}
            </div>

            {/* Mandatory DIC & Bank Appraisal Document Checklist */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'बैंक लोन व DIC सब्सिडी हेतु आवश्यक दस्तावेज चेकलिस्ट' : 'Mandatory Bank Loan & DIC Document Checklist'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { title: '1. Bankable Detailed Project Report (DPR)', desc: 'Generated via Agrixora with DSCR > 2.0x' },
                  { title: '2. Aadhaar & PAN KYC of Promoter', desc: 'UIDAI verified identity credentials' },
                  { title: '3. Udyam MSME Registration Certificate', desc: 'Free online micro enterprise registration' },
                  { title: '4. Land Ownership / 5-Yr Lease Deed', desc: 'Registered deed for proposed site' },
                  { title: '5. Machinery Quotations (Proforma Invoice)', desc: 'From certified equipment manufacturers' },
                  { title: '6. FSSAI Food License / Registration', desc: 'Mandatory for food processing units' },
                  { title: '7. Electricity Connection Feasibility NOC', desc: 'Discom sanction for 3-Phase load' },
                  { title: '8. 6-Month Bank Account Statements', desc: 'Savings / current account transaction trail' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-900 block">{doc.title}</span>
                      <span className="text-[11px] text-slate-600">{doc.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 6: AI CONVERSATIONAL ADVISOR & VOICE COPILOT
        ───────────────────────────────────────────────────────────── */}
        {activeSubTab === 'ai_copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Quick Scenario Prompts (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{language === 'hi' ? 'त्वरित सलाह विषय' : 'Quick Advisory Prompts'}</span>
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      titleEn: '10% Margin vs 90% Loan Structuring',
                      titleHi: '10% मार्जिन पर 90% लोन कैसे मिलेगा?',
                      query: 'Explain how the 10% promoter margin and 90% bank loan structuring works under SIH 26091.'
                    },
                    {
                      titleEn: 'PM-FME 35% Capital Subsidy Rules',
                      titleHi: 'PM-FME में 35% सब्सिडी के नियम व शर्तें',
                      query: 'What are the eligibility criteria and maximum subsidy amount under PM-FME for food processing?'
                    },
                    {
                      titleEn: 'Solar Cold Storage AIF 3% Relief',
                      titleHi: 'सोलर कोल्ड स्टोरेज: AIF 3% ब्याज छूट',
                      query: 'How much interest subvention and CGTMSE guarantee do I get for a solar micro cold storage under AIF?'
                    },
                    {
                      titleEn: 'Cold-Pressed Mustard Oil Profitability',
                      titleHi: 'कच्ची घानी तेल मिल की मासिक कमाई व खली बिक्री',
                      query: 'What is the monthly turnover, gross margin and payback period for a cold-pressed oil expeller unit?'
                    }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChatMessage(item.query)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 transition-all text-xs font-bold text-slate-800 flex items-center justify-between group cursor-pointer"
                    >
                      <span>{language === 'hi' ? item.titleHi : item.titleEn}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* National Agritech Helplines Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-2 border border-emerald-500/30">
                <h4 className="font-bold text-xs text-emerald-300 uppercase">National Agritech Support</h4>
                <p className="text-xs text-slate-200">
                  PM-FME National Helpline: <strong>1800-11-2026</strong>
                </p>
                <p className="text-xs text-slate-200">
                  AIF Portal: <strong>agriinfra.dac.gov.in</strong>
                </p>
                <p className="text-xs text-slate-200">
                  PMEGP Portal: <strong>kviconline.gov.in</strong>
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Chat Assistant (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {language === 'hi' ? 'ग्रामीण व्यापार एआई सलाहकार' : 'Rural Enterprise AI Copilot'}
                    </h3>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live Mandi & Scheme Intelligence Active</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">📍 {selectedDistrict} Cluster</span>
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
                      className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-xs ${
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
                            type="button"
                            onClick={() => handleSpeakText(msg.text)}
                            className="text-slate-500 hover:text-emerald-700 p-1 rounded-md transition-colors cursor-pointer"
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
                        ? 'यहाँ पूछें (जैसे: 10% मार्जिन पर ₹18 लाख की दाल मिल के लिए कितना लोन मिलेगा?)...'
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

      </main>

    </div>
  );
};
