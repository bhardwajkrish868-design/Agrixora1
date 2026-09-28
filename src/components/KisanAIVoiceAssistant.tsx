import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  X, 
  RefreshCw, 
  TrendingUp, 
  CloudSun, 
  Bug, 
  ShieldCheck, 
  Truck, 
  Languages, 
  HelpCircle, 
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { useAgri } from '../context/AgriContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'general' | 'price' | 'weather' | 'disease' | 'scheme' | 'action';
  cardData?: any;
}

export const KisanAIVoiceAssistant: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    setActiveTab, 
    switchRole, 
    currentUser, 
    listings 
  } = useAgri();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeLang, setActiveLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'hi'); // Default Hindi for Kisan
  const [transcriptLive, setTranscriptLive] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initial Welcome Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-1',
      sender: 'assistant',
      text: activeLang === 'hi'
        ? 'नमस्ते किसान भाई! 🙏 मैं आपका **Agrixora कृषि वाणी AI सहायक** हूँ। आप मुझसे बोलकर या लिखकर आज का मंडी भाव, मौसम पूर्वानुमान, फसल में बीमारी का पक्का इलाज या फसल बेचने की सहायता ले सकते हैं।'
        : 'Namaste Kisan Brother! 🙏 I am your **Agrixora Krishi Vani AI Voice Assistant**. You can speak or type to check live Mandi prices, 3-day weather alerts, crop disease remedies, or sell your produce directly.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general'
    }
  ]);

  // Quick Action / Query Suggestions
  const quickPrompts = activeLang === 'hi' ? [
    { label: '🧅 आज का प्याज & टमाटर मंडी भाव', query: 'आज का प्याज और टमाटर का भाव क्या है?' },
    { label: '🌦️ 3 दिन का मौसम व बारिश अलर्ट', query: 'अगले 3 दिन का मौसम और बारिश अलर्ट कैसा है?' },
    { label: '🐛 मक्का व टमाटर में कीड़े/पीलापन का इलाज', query: 'फसल में कीड़े और पत्तियों का पीलापन कैसे ठीक करें?' },
    { label: '💰 PM किसान ₹2000 किस्त व फसल बीमा', query: 'PM किसान सम्मान निधि और फसल बीमा का लाभ कैसे लें?' },
    { label: '📦 अपनी फसल सीधे बेचना है', query: 'मुझे अपनी फसल मंडी में बेचना है' },
    { label: '🚚 कोल्ड स्टोरेज रीफर ट्रक ट्रैक करें', query: 'रीफर कोल्ड चेन ट्रक की लोकेशन और तापमान क्या है?' }
  ] : [
    { label: '🧅 Onion & Tomato Mandi Rates', query: 'What is today Mandi price of Red Onion and Tomato?' },
    { label: '🌦️ 3-Day Weather & Rain Forecast', query: 'What is the weather forecast and rain probability for next 3 days?' },
    { label: '🐛 Crop Disease & Pest Remedy', query: 'How to cure leaf yellowing and stem borer pests in crop?' },
    { label: '💰 PM Kisan ₹2000 & Crop Insurance', query: 'How to check PM Kisan ₹2000 benefit and Fasal Bima claim?' },
    { label: '📦 List & Sell Produce by Voice', query: 'I want to sell my produce directly on marketplace' },
    { label: '🚚 Track Cold Chain Reefer Truck', query: 'Track live Reefer cold storage logistics and temperature' }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, transcriptLive]);

  // Sync language with global context
  useEffect(() => {
    if (language === 'hi' || language === 'en') {
      setActiveLang(language);
    }
  }, [language]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscriptLive('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptLive(currentTranscript);

          if (event.results[0].isFinal) {
            handleUserQuery(currentTranscript);
            setTranscriptLive('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setTranscriptLive('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      synthRef.current = window.speechSynthesis || null;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch (_) {}
      }
    };
  }, [activeLang]);

  // Speak AI response text aloud
  const speakText = (text: string) => {
    if (speechMuted || !synthRef.current) return;

    try {
      synthRef.current.cancel(); // Stop any ongoing speech

      // Clean markdown tags for natural speech
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/[*_#`]/g, '')
        .replace(/₹/g, 'Rupees ')
        .replace(/[^\w\s\u0900-\u097F.,!?₹-]/gi, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // slightly relaxed natural pace for farmers
      utterance.pitch = 1.0;

      // Try finding natural Indian voice if available
      const voices = synthRef.current.getVoices();
      const indianVoice = voices.find(v => 
        (activeLang === 'hi' && (v.lang.includes('hi') || v.lang.includes('IN'))) ||
        (activeLang === 'en' && v.lang.includes('en-IN'))
      );
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      setIsSpeaking(false);
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    if (!recognitionRef.current) {
      alert(activeLang === 'hi' 
        ? 'आपके ब्राउज़र में आवाज़ पहचान (Speech Recognition) सपोर्ट नहीं है। कृपया लिखकर प्रश्न पूछें।' 
        : 'Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // NLP Knowledge Base & AI Query Resolver
  const handleUserQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent AI response
    setTimeout(() => {
      const response = generateAIResponse(trimmed.toLowerCase());
      setMessages(prev => [...prev, response]);
      speakText(response.text);
    }, 400);
  };

  const generateAIResponse = (q: string): ChatMessage => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isHi = activeLang === 'hi';

    // 1. MANDI RATES & MSP QUERIES
    if (q.includes('bhav') || q.includes('rate') || q.includes('mandi') || q.includes('price') || q.includes('onion') || q.includes('pyaj') || q.includes('tamatar') || q.includes('tomato') || q.includes('makka') || q.includes('maize') || q.includes('wheat') || q.includes('gehu') || q.includes('msp')) {
      const priceCards = [
        { crop: isHi ? 'लाल प्याज (Red Onion)' : 'Red Onion (Export Grade)', mandi: 'Hajipur / Nashik APMC', rate: '₹26.50 / Kg', msp: '₹24.00', trend: '+4.2% आज तेज' },
        { crop: isHi ? 'टमाटर हाइब्रिड (Tomato)' : 'Tomato Hybrid', mandi: 'Patna / Pune APMC', rate: '₹45.00 / Kg', msp: '₹38.00', trend: '+6.1% मांग अधिक' },
        { crop: isHi ? 'पीला मक्का (Yellow Maize)' : 'Yellow Maize (Makka)', mandi: 'Vaishali / Gulabbagh', rate: '₹2,450 / Quintal', msp: '₹2,225', trend: 'स्थिर व अच्छी मांग' },
        { crop: isHi ? 'शरबती गेहूं (Sharbati Wheat)' : 'Sharbati Wheat C-306', mandi: 'Karnal / Sehore APMC', rate: '₹2,950 / Quintal', msp: '₹2,275', trend: '+3.5% प्रीमियम' }
      ];

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'price',
        text: isHi
          ? `📊 **आज का लाइव मंडी भाव अपडेट:**\n\n- 🧅 **लाल प्याज:** ₹26.50/Kg (नासिक व हाजीपुर मंडी में मांग तेज है)\n- 🍅 **टमाटर हाइब्रिड:** ₹45.00/Kg (स्थानीय कोल्ड स्टोरेज आपूर्ति मजबूत)\n- 🌽 **पीला मक्का:** ₹2,450/क्विंटल (सरकारी MSP ₹2,225 से ₹225 ज्यादा)\n- 🌾 **शरबती गेहूं:** ₹2,950/क्विंटल\n\n💡 *सुझाव: Agrixora पर सीधे खरीदार को बेचकर 15-20% अधिक मुनाफा कमाएं।*`
          : `📊 **Today's Live Mandi Benchmark & Rates:**\n\n- 🧅 **Red Onion:** ₹26.50/Kg (Nashik & Hajipur Mandis showing strong demand)\n- 🍅 **Tomato Hybrid:** ₹45.00/Kg (Firm quality retail demand)\n- 🌽 **Yellow Maize:** ₹2,450/Quintal (₹225 above Govt MSP ₹2,225)\n- 🌾 **Sharbati Wheat:** ₹2,950/Quintal\n\n💡 *Tip: Sell directly via Agrixora for 15-20% higher earnings without middleman commission.*`,
        cardData: { priceCards }
      };
    }

    // 2. WEATHER & RAIN FORECAST
    if (q.includes('mausam') || q.includes('weather') || q.includes('barish') || q.includes('rain') || q.includes('forecast') || q.includes('tapman') || q.includes('dhoop') || q.includes('spray')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'weather',
        text: isHi
          ? `🌦️ **आगामी 3 दिनों का कृषि मौसम पूर्वानुमान:**\n\n- ☀️ **आज (दिन 1):** 28°C धूप खिली रहेगी, नमी 62%, हवा 11 km/h। (कीटनाशक छिड़काव के लिए सुरक्षित)\n- ⛅ **कल (दिन 2):** 27°C आंशिक बादल, हल्की बूंदाबांदी की 25% संभावना।\n- 🌧️ **परसों (दिन 3):** 25°C दोपहर बाद हल्की बारिश (3.4 mm), तेज हवाएं संभव।\n\n⚠️ **किसान सलाह:** आगामी बारिश से पहले कटी हुई फसल को ऊंचे शेड या तिरपाल से ढक लें। आज शाम तक खाद या कीटनाशक स्प्रे पूरा कर लें।`
          : `🌦️ **3-Day Agro-Meteorological Weather Alert:**\n\n- ☀️ **Today (Day 1):** 28°C Clear Sky, Humidity 62%, Wind 11 km/h. (Optimal for Foliar Spray)\n- ⛅ **Tomorrow (Day 2):** 27°C Partly Cloudy, 25% light drizzle probability.\n- 🌧️ **Day 3:** 25°C Light rain expected (3.4 mm) in the afternoon.\n\n⚠️ **Advisory:** Cover open-air harvested grains with tarpaulin. Complete fertilizer/pesticide sprays before Day 3 rain.`,
        cardData: {
          temp: '28°C',
          condition: isHi ? 'धूप खिली हुई (अनुकूल)' : 'Clear & Sunny',
          humidity: '62%',
          rainChance: '15%',
          wind: '11 km/h',
          sprayStatus: isHi ? '✅ स्प्रे के लिए सुरक्षित' : '✅ Safe for Spray'
        }
      };
    }

    // 3. CROP DISEASE & PEST DIAGNOSIS / TREATMENT
    if (q.includes('disease') || q.includes('bimari') || q.includes('keeda') || q.includes('pest') || q.includes('pila') || q.includes('yellow') || q.includes('patte') || q.includes('leaf') || q.includes('fungus') || q.includes('ilaj') || q.includes('cure') || q.includes('dawa') || q.includes('spray')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'disease',
        text: isHi
          ? `🌿 **फसल रोग व कीट निवारण विशेषज्ञ पर्ची:**\n\n1. 🍂 **पत्तियों का पीलापन (Yellowing of Leaves):**\n   - **कारण:** नाइट्रोजन या सूक्ष्म पोषक तत्वों (Zinc/Iron) की कमी।\n   - **उपचार:** 19:19:19 NPK (5 ग्राम/लीटर) + चिलेटेड जिंक (1 ग्राम/लीटर) का पर्णीय छिड़काव करें।\n\n2. 🐛 **मक्का व सब्जियों में फॉल आर्मीवर्म / इल्ली कीट:**\n   - **दवा:** इमामेक्टिन बेंजोएट 5% SG (Emamectin Benzoate) 0.4 ग्राम प्रति लीटर पानी में मिलाकर शाम के समय स्प्रे करें।\n   - **जैविक विकल्प:** नीम का तेल 1500 PPM (3-5 ml/लीटर) + साबुन का घोल।\n\n3. 🍄 **टमाटर/आलू में झुलसा रोग (Late Blight):**\n   - **दवा:** मेंकोजेब 75% WP (Mancozeb) 2.5 ग्राम/लीटर पानी में छिड़काव करें।`
          : `🌿 **Crop Health & Disease Prescription:**\n\n1. 🍂 **Leaf Yellowing (Chlorosis):**\n   - **Cause:** Nitrogen or Micronutrient (Zinc/Iron) deficiency.\n   - **Treatment:** Foliar spray of NPK 19:19:19 (5g/L) + Chelated Zinc (1g/L).\n\n2. 🐛 **Fall Armyworm / Caterpillar in Maize & Vegetables:**\n   - **Chemical:** Emamectin Benzoate 5% SG @ 0.4g/L in evening hours.\n   - **Organic:** Neem Oil 1500 PPM @ 4ml/L + mild wetting agent.\n\n3. 🍄 **Blight in Tomato & Potato:**\n   - **Treatment:** Mancozeb 75% WP @ 2.5g/L of water.`,
        cardData: {
          cropTarget: isHi ? 'मक्का, टमाटर, प्याज, गेहूं' : 'Maize, Tomato, Onion, Wheat',
          remedy1: 'NPK 19:19:19 + Chelated Zinc (1g/L)',
          remedy2: 'Emamectin Benzoate 5% SG (0.4g/L)',
          organic: isHi ? 'नीम तेल 1500 PPM (4 ml/L)' : 'Neem Oil 1500 PPM (4 ml/L)'
        }
      };
    }

    // 4. GOVT SCHEMES & SUBSIDY
    if (q.includes('pm kisan') || q.includes('yojana') || q.includes('scheme') || q.includes('subsidy') || q.includes('bima') || q.includes('insurance') || q.includes('kcc') || q.includes('loan') || q.includes('2000')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'scheme',
        text: isHi
          ? `🏛️ **प्रमुख सरकारी किसान योजनाएं व लाभ विवरण:**\n\n1. 💳 **PM-किसान सम्मान निधि:**\n   - प्रतिवर्ष ₹6,000 की वित्तीय सहायता (₹2,000 की 3 किस्तों में)।\n   - अगली किस्त के लिए e-KYC एवं भूलेख सत्यापन अनिवार्य है।\n\n2. 🛡️ **प्रधानमंत्री फसल बीमा योजना (PMFBY):**\n   - सूखा, बाढ़ या बेमौसम बारिश से फसल नष्ट होने पर 72 घंटे के भीतर टोल-फ्री 14447 पर क्लेम दर्ज कराएं।\n\n3. 🚜 **किसान क्रेडिट कार्ड (KCC) 4% ऋण:**\n   - ₹3 लाख तक का कृषि ऋण मात्र 4% रियायती ब्याज दर पर।\n\n4. ☀️ **पीएम-कुसुम सोलर पंप योजना:**\n   - खेत में सोलर पंप लगाने पर 60% से 90% तक सरकारी अनुदान।`
          : `🏛️ **Key Govt Agricultural Welfare Schemes:**\n\n1. 💳 **PM-Kisan Samman Nidhi:**\n   - ₹6,000 annual direct benefit transfer in 3 instalments of ₹2,000.\n   - Ensure e-KYC and Aadhaar land seeding are completed.\n\n2. 🛡️ **Pradhan Mantri Fasal Bima Yojana (PMFBY):**\n   - Comprehensive crop loss insurance. Report within 72 hours on Toll-Free 14447.\n\n3. 🚜 **Kisan Credit Card (KCC):**\n   - Subsidized 4% interest rate crop loan up to ₹3.00 Lakhs.\n\n4. ☀️ **PM-KUSUM Solar Pump Scheme:**\n   - Up to 60-90% subsidy for off-grid and grid-connected solar water pumps.`,
        cardData: {
          helpline: '1800-180-1551 (Kisan Call Centre)',
          kccLimit: '₹3,00,000 @ 4% p.a.',
          pmKisan: '₹2,000 Direct DBT'
        }
      };
    }

    // 5. SELL CROP / VOICE LISTING ACTION
    if (q.includes('bechna') || q.includes('sell') || q.includes('list') || q.includes('add produce') || q.includes('fasal bechna') || q.includes('create listing')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'action',
        text: isHi
          ? `📦 **फसल सीधे Agrixora पर बेचें:**\n\nमैंने आपकी सहायता के लिए 'Add Produce' पेज तैयार कर दिया है। आप नीचे दिए गए बटन पर क्लिक करके अपनी फसल (क्विंटल, भाव, मंडी व ग्रेड) दर्ज कर सकते हैं। Agrixora के हजारों सत्यापित थोक खरीदार तुरंत आपके उत्पाद पर बोली लगाएंगे!`
          : `📦 **Sell Your Produce Directly on Agrixora:**\n\nI have prepared the 'Add Produce' listing page for you. Click the button below to register your harvest quantity, expected price, and nearest FCI collection hub. Verified institutional buyers will connect with you directly with instant escrow payment guarantee!`,
        cardData: {
          actionType: 'add_produce',
          btnText: isHi ? '🌾 नई फसल लिस्ट करें (Add Produce)' : '🌾 List New Crop for Sale'
        }
      };
    }

    // 6. LOGISTICS & REEFER TRACKING
    if (q.includes('truck') || q.includes('track') || q.includes('reefer') || q.includes('cold') || q.includes('storage') || q.includes('delivery') || q.includes('gadi') || q.includes('vahan')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'action',
        text: isHi
          ? `🚚 **लाइव रीफर कोल्ड-चेन व GPS ट्रैकर:**\n\n- 📍 **सक्रिय वाहन:** MH-15-TC-9042 (Tata 407 Reefer Cold Container)\n- ❄️ **लाइव तापमान:** 4.1°C (निर्धारित सीमा: 2°C - 6°C के अंदर सुरक्षित)\n- 🛣️ **वर्तमान स्थिति:** NH-19 वाराणसी-पटना कॉरिडोर (हब आगमन: 2 घंटे 40 मिनट)\n\nनीचे दिए गए बटन से पूरा 3D लाइव नेविगेशन मैप देखें:`
          : `🚚 **Live Reefer Cold-Chain & GPS Logistics:**\n\n- 📍 **Active Vehicle:** MH-15-TC-9042 (Tata 407 Reefer Cold Container)\n- ❄️ **Live Temp:** 4.1°C (Optimal fresh preservation range)\n- 🛣️ **Route:** NH-19 Varanasi-Patna Corridor (ETA: 2h 40m)\n\nClick below to open the Live 3D Reefer Navigation Map:`,
        cardData: {
          actionType: 'track_delivery',
          btnText: isHi ? '🚚 लाइव GPS रीफर मैप खोलें' : '🚚 Open Live Reefer GPS Map'
        }
      };
    }

    // 7. DEFAULT HELPFUL FALLBACK
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: timeStr,
      type: 'general',
      text: isHi
        ? `🌱 **Agrixora कृषि वाणी आपकी सेवा में तत्पर है!**\n\nमैं आपकी इन विषयों में तुरंत सहायता कर सकता हूँ:\n1. 📊 **लाइव मंडी भाव:** 'आज का प्याज/मक्का का भाव क्या है?'\n2. 🌦️ **मौसम अलर्ट:** 'कल बारिश होगी या नहीं?'\n3. 🐛 **फसल रोग व दवा:** 'मक्के में कीड़ा लगा है क्या करें?'\n4. 💰 **सरकारी योजनाएं:** 'PM किसान व फसल बीमा की जानकारी दें।'\n5. 📦 **फसल बेचें:** 'मुझे 50 क्विंटल गेहूं बेचना है।'\n\nकृपया ऊपर दिए गए किसी भी विकल्प को पूछें या माइक बटन दबाकर बोलें!`
        : `🌱 **Agrixora Krishi Vani is at your service!**\n\nI can assist you with:\n1. 📊 **Live Mandi Rates:** "What is today's onion/maize price?"\n2. 🌦️ **Weather Alert:** "Will it rain tomorrow?"\n3. 🐛 **Pest Diagnosis:** "How to cure leaf yellowing in tomato?"\n4. 💰 **Govt Schemes:** "Tell me about PM-Kisan & Fasal Bima."\n5. 📦 **Sell Produce:** "I want to list 50 quintals of wheat."\n\nFeel free to tap the mic button or ask any agricultural question!`
    };
  };

  // Perform quick navigation action from card
  const handleActionClick = (actionType: string) => {
    if (actionType === 'add_produce') {
      if (currentUser?.role !== 'farmer') {
        switchRole('farmer');
      }
      setActiveTab('add_produce');
      setIsOpen(false);
    } else if (actionType === 'track_delivery') {
      setActiveTab('track_delivery');
      setIsOpen(false);
    } else if (actionType === 'market_prices') {
      setActiveTab('market_prices');
      setIsOpen(false);
    }
  };

  // Restart chat / Clear history
  const handleResetChat = () => {
    if (synthRef.current) synthRef.current.cancel();
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: activeLang === 'hi'
          ? 'नमस्ते किसान भाई! 🙏 मैं आपका **Agrixora कृषि वाणी AI सहायक** हूँ। आप मुझसे बोलकर या लिखकर आज का मंडी भाव, मौसम, फसल रोग उपचार या फसल बेचने की सहायता ले सकते हैं।'
          : 'Namaste Kisan Brother! 🙏 I am your **Agrixora Krishi Vani AI Voice Assistant**. Speak or type to check live Mandi prices, 3-day weather alerts, crop disease remedies, or sell your produce directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'general'
      }
    ]);
  };

  return (
    <>
      {/* 🟢 FLOATING VOICE LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/90 text-emerald-300 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/30 shadow-2xl text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeLang === 'hi' ? 'कृषि वाणी AI: बोलकर पूछें' : 'Kisan Voice AI: Speak here'}</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative group p-4 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-2xl shadow-emerald-900/50 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-300/40 flex items-center justify-center cursor-pointer"
            title={activeLang === 'hi' ? 'कृषि वाणी AI सहायक खोलें' : 'Open Kisan AI Voice Assistant'}
          >
            {/* Pulsing ring animation */}
            <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping opacity-75" />
            <span className="absolute -inset-2 rounded-full bg-teal-500/20 blur-sm" />
            
            <div className="relative flex items-center justify-center">
              <Mic className="w-7 h-7 text-white drop-shadow-md group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 🎙️ EXPANDABLE KISAN AI ASSISTANT MODAL / DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[650px] z-50 flex flex-col bg-slate-900 text-slate-100 rounded-none sm:rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* TOP HEADER */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border-b border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950">
                <Mic className="w-5 h-5" />
                {isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                    {activeLang === 'hi' ? 'कृषि वाणी AI' : 'Krishi Vani AI'}
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                      LIVE VOICE
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-emerald-300/80 font-medium">
                  {activeLang === 'hi' ? 'Agrixora स्मार्ट किसान आवाज़ सहायक' : 'Agrixora Smart Kisan Voice Assistant'}
                </p>
              </div>
            </div>

            {/* Language Toggle & Controls */}
            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <button
                onClick={() => {
                  const nextLang = activeLang === 'hi' ? 'en' : 'hi';
                  setActiveLang(nextLang);
                  setLanguage(nextLang);
                }}
                className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle Hindi / English"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeLang === 'hi' ? 'हिंदी' : 'ENG'}</span>
              </button>

              {/* Mute/Unmute TTS */}
              <button
                onClick={() => {
                  if (isSpeaking && synthRef.current) {
                    synthRef.current.cancel();
                    setIsSpeaking(false);
                  }
                  setSpeechMuted(!speechMuted);
                }}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                  speechMuted 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={speechMuted ? 'Unmute Audio' : 'Mute Audio Speech'}
              >
                {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Restart Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Close Drawer */}
              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (_) {}
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none border border-emerald-400/30'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/80 backdrop-blur-md'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* 📊 VISUAL PRICE CARD */}
                  {msg.type === 'price' && msg.cardData?.priceCards && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.cardData.priceCards.map((pc: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex flex-col justify-between">
                          <div>
                            <div className="text-[11px] font-bold text-emerald-300">{pc.crop}</div>
                            <div className="text-[10px] text-slate-400">{pc.mandi}</div>
                          </div>
                          <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="text-sm font-black text-amber-400">{pc.rate}</span>
                            <span className="text-[10px] font-semibold text-emerald-400">{pc.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🌦️ VISUAL WEATHER CARD */}
                  {msg.type === 'weather' && msg.cardData && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900/80 border border-blue-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CloudSun className="w-6 h-6 text-amber-400 animate-pulse" />
                          <div>
                            <span className="text-lg font-black text-white">{msg.cardData.temp}</span>
                            <span className="text-xs text-slate-300 ml-2 font-medium">{msg.cardData.condition}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {msg.cardData.sprayStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-400" /> {msg.cardData.humidity}</div>
                        <div className="flex items-center gap-1"><CloudSun className="w-3 h-3 text-amber-400" /> {msg.cardData.rainChance} Rain</div>
                        <div className="flex items-center gap-1"><Wind className="w-3 h-3 text-teal-400" /> {msg.cardData.wind}</div>
                      </div>
                    </div>
                  )}

                  {/* 🐛 VISUAL DISEASE PRESCRIPTION CARD */}
                  {msg.type === 'disease' && msg.cardData && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] space-y-1.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Bug className="w-3.5 h-3.5" />
                        <span>{activeLang === 'hi' ? 'अनुशंसित कृषि रक्षक उपचार' : 'Recommended Agro Chemical Dosage'}</span>
                      </div>
                      <div className="text-slate-200">
                        <span className="text-emerald-400 font-bold">1. </span> {msg.cardData.remedy1}
                      </div>
                      <div className="text-slate-200">
                        <span className="text-emerald-400 font-bold">2. </span> {msg.cardData.remedy2}
                      </div>
                      <div className="text-emerald-300 text-[10px]">
                        🌿 <strong>{activeLang === 'hi' ? 'जैविक:' : 'Organic:'}</strong> {msg.cardData.organic}
                      </div>
                    </div>
                  )}

                  {/* 🚀 QUICK ACTION BUTTON */}
                  {msg.type === 'action' && msg.cardData && (
                    <button
                      onClick={() => handleActionClick(msg.cardData.actionType)}
                      className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <span>{msg.cardData.btnText}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {/* Audio Replay Button */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-1 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">{msg.timestamp}</span>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Replay Audio"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        <span>{activeLang === 'hi' ? 'पुनः सुनें' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* LIVE SPEECH TRANSCRIPTION INDICATOR */}
            {isListening && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-pulse">
                <Mic className="w-4 h-4 text-amber-400 animate-bounce" />
                <div className="flex-1 font-medium">
                  {transcriptLive 
                    ? `"${transcriptLive}"...` 
                    : (activeLang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ...' : 'Listening, please speak...')}
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-teal-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* QUICK TOPIC PROMPTS */}
          <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleUserQuery(qp.query)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* FOOTER INPUT CONTROLS */}
          <div className="p-3 bg-slate-900 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserQuery(inputText);
              }}
              className="flex items-center gap-2"
            >
              {/* Pulsing Voice Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/40'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 active:scale-95'
                }`}
                title={isListening ? 'Stop Listening' : 'Click to Speak (माइक दबाकर बोलें)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input Field */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeLang === 'hi' 
                      ? 'आवाज़ से बोलें या प्रश्न यहाँ लिखें...' 
                      : 'Speak by voice or type query here...'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-9"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-colors cursor-pointer shrink-0"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
