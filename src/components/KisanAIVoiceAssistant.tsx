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
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Wind,
  Sprout,
  HelpCircle,
  PhoneCall,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAgri } from '../context/AgriContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  type?: 'general' | 'price' | 'weather' | 'disease' | 'scheme' | 'fertilizer' | 'action';
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
  const [activeLang, setActiveLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'hi'); // Default Hindi
  const [transcriptLive, setTranscriptLive] = useState('');
  const [activeTopicFilter, setActiveTopicFilter] = useState<string>('all');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesLoadedRef = useRef<SpeechSynthesisVoice[]>([]);

  // Initial Welcome Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-1',
      sender: 'assistant',
      text: activeLang === 'hi'
        ? '🌾 **राम-राम किसान भाई! नमस्ते!** 🙏\n\nमैं हूँ आपका **Agrixora कृषि वाणी AI सहायक**।\nआप मुझसे बोलकर या लिखकर किसी भी फसल का आज का **मंडी भाव**, 3-दिन का **मौसम**, फसल में **कीड़े/पीलेपन की दवा**, **खाद की सही मात्रा**, या **PM-किसान योजना** की सटीक जानकारी ले सकते हैं।'
        : '🌾 **Namaste Kisan Brother!** 🙏\n\nI am your **Agrixora Krishi Vani AI Voice Assistant**.\nYou can speak or type to ask about today\'s **Mandi prices**, 3-day **weather alerts**, **crop disease remedies**, **fertilizer dosage**, or **PM-Kisan schemes**.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'general'
    }
  ]);

  // Topic Categories for 1-Click Access
  const topicTabs = activeLang === 'hi' ? [
    { id: 'price', label: '📊 मंडी भाव', query: 'आज का प्याज, टमाटर और मक्का का मंडी भाव क्या है?' },
    { id: 'weather', label: '🌦️ मौसम व बारिश', query: 'अगले 3 दिन का मौसम और बारिश का पूर्वानुमान क्या है?' },
    { id: 'disease', label: '🐛 रोग व दवा', query: 'फसल में कीड़ा और पत्तियों का पीलापन कैसे ठीक करें?' },
    { id: 'fertilizer', label: '🌱 खाद व यूरिया', query: 'फसल में यूरिया, डीएपी और एनपीके खाद की सही मात्रा क्या है?' },
    { id: 'scheme', label: '🏛️ PM किसान व बीमा', query: 'PM किसान ₹2000 और फसल बीमा योजना का लाभ कैसे लें?' },
    { id: 'sell', label: '📦 फसल बेचें', query: 'मुझे अपनी फसल मंडी में सीधे बेचना है' }
  ] : [
    { id: 'price', label: '📊 Mandi Rates', query: 'What is today Mandi price of Red Onion, Tomato & Maize?' },
    { id: 'weather', label: '🌦️ Weather Alert', query: 'What is the 3-day weather and rain probability forecast?' },
    { id: 'disease', label: '🐛 Pest & Disease', query: 'How to cure leaf yellowing and insect pests in crop?' },
    { id: 'fertilizer', label: '🌱 Fertilizers', query: 'What is the recommended dosage of Urea, DAP and NPK?' },
    { id: 'scheme', label: '🏛️ PM Kisan', query: 'How to get PM Kisan ₹2000 installment and crop insurance?' },
    { id: 'sell', label: '📦 Sell Produce', query: 'I want to sell my produce directly on marketplace' }
  ];

  // Quick Action / Query Suggestions
  const quickPrompts = activeLang === 'hi' ? [
    { label: '🧅 आज का प्याज & टमाटर भाव', query: 'आज का प्याज और टमाटर का भाव क्या है?' },
    { label: '🌽 मक्का में इल्ली / कीड़ा का इलाज', query: 'मक्का में कीड़ा और फॉल आर्मीवर्म का इलाज बताओ' },
    { label: '🍂 पत्तियों का पीलापन कैसे रोकें', query: 'फसल की पत्तियों में पीलापन है क्या दवा डालें?' },
    { label: '🌦️ कल बारिश होगी या नहीं?', query: 'कल मौसम कैसा रहेगा बारिश होगी क्या?' },
    { label: '🌾 यूरिया व DAP डालने का सही समय', query: 'यूरिया और DAP खाद कितनी मात्रा में डालना चाहिए?' },
    { label: '💳 PM किसान ₹2000 किस्त e-KYC', query: 'PM किसान योजना 2000 रुपये की किस्त की जानकारी दो' },
    { label: '🚚 रीफर कोल्ड स्टोरेज ट्रक ट्रैकिंग', query: 'रीफर कोल्ड चेन ट्रक की लाइव लोकेशन और तापमान क्या है?' }
  ] : [
    { label: '🧅 Onion & Tomato Mandi Rates', query: 'What is today Mandi price of Red Onion and Tomato?' },
    { label: '🌽 Fall Armyworm in Maize', query: 'How to cure fall armyworm and stem borer in maize?' },
    { label: '🍂 Fix Leaf Yellowing', query: 'What fertilizer or spray cures yellow leaves in crops?' },
    { label: '🌦️ Rain Forecast & Weather', query: 'Will it rain tomorrow and is spray safe?' },
    { label: '🌾 Urea & DAP Dosage', query: 'What is the recommended dose of Urea and DAP per acre?' },
    { label: '💳 PM Kisan ₹2000 Benefit', query: 'How to complete PM Kisan e-KYC and check installment?' },
    { label: '🚚 Track Cold Chain Reefer', query: 'Track live Reefer cold storage logistics and temperature' }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, transcriptLive]);

  // Load Voices asynchronously for robust Indian Hindi Speech
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const updateVoices = () => {
        if (synthRef.current) {
          voicesLoadedRef.current = synthRef.current.getVoices();
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

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

  // Speak AI response text aloud with authentic Hindi Indian Voice
  const speakText = (text: string) => {
    if (speechMuted || !synthRef.current) return;

    try {
      synthRef.current.cancel(); // Stop any ongoing speech

      // Clean markdown tags and prepare natural Hindi / English phonetic speech
      let cleanText = text
        .replace(/\*\*/g, '')
        .replace(/[*_#`]/g, '')
        .replace(/[•-]\s/g, ', ')
        .replace(/\n+/g, '. ');

      if (activeLang === 'hi') {
        cleanText = cleanText
          .replace(/₹/g, 'रुपये ')
          .replace(/\/Kg/gi, ' प्रति किलो')
          .replace(/\/Quintal/gi, ' प्रति क्विंटल')
          .replace(/Qtl/gi, ' क्विंटल')
          .replace(/g\/L/gi, ' ग्राम प्रति लीटर')
          .replace(/ml\/L/gi, ' मिलीलीटर प्रति लीटर')
          .replace(/km\/h/gi, ' किलोमीटर प्रति घंटा')
          .replace(/°C/g, ' डिग्री सेल्सियस ');
      } else {
        cleanText = cleanText
          .replace(/₹/g, 'Rupees ')
          .replace(/\/Kg/gi, ' per Kg')
          .replace(/\/Quintal/gi, ' per Quintal');
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = activeLang === 'hi' ? 0.90 : 0.95; // relaxed natural pace
      utterance.pitch = 1.0;

      // Find authentic Hindi Indian voice
      const voices = voicesLoadedRef.current.length > 0 
        ? voicesLoadedRef.current 
        : synthRef.current.getVoices();

      if (activeLang === 'hi') {
        const hindiVoice = voices.find(v => 
          v.lang.toLowerCase().includes('hi-in') || 
          v.lang.toLowerCase().includes('hi_in') || 
          v.name.toLowerCase().includes('hindi') || 
          v.name.toLowerCase().includes('swara') || 
          v.name.toLowerCase().includes('kalpana') || 
          v.name.toLowerCase().includes('hemant') ||
          v.name.toLowerCase().includes('madhur')
        ) || voices.find(v => v.lang.toLowerCase().includes('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
      } else {
        const indianEngVoice = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
        if (indianEngVoice) utterance.voice = indianEngVoice;
      }

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
    }, 350);
  };

  const generateAIResponse = (rawQ: string): ChatMessage => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isHi = activeLang === 'hi';
    const q = rawQ.toLowerCase();

    // -------------------------------------------------------------
    // 1. GREETINGS & SHISHTACHAR (नमस्ते, राम-राम, प्रणाम, हाल-चाल)
    // -------------------------------------------------------------
    if (q.includes('namaste') || q.includes('namaskar') || q.includes('ram ram') || q.includes('pranam') || q.includes('kisan') || q.includes('hello') || q.includes('hi') || q.includes('kaise ho') || q.includes('नमस्ते') || q.includes('प्रणाम') || q.includes('राम') || q.includes('हैलो')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'general',
        text: isHi
          ? `🌾 **राम-राम किसान भाई! सादर प्रणाम!** 🙏\n\nमैं Agrixora कृषि वाणी AI हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?\n\n- 📊 **मंडी भाव:** किसी भी फसल (प्याज, टमाटर, मक्का, गेहूं, आलू) का रेट पूछें।\n- 🌦️ **मौसम व बारिश:** 3 दिन का मौसम व स्प्रे समय जानें।\n- 🐛 **रोग व कीटनाशक:** फसल में कीड़े, झुलसा या पीलापन की दवा पूछें।\n- 🏛️ **PM-किसान योजना:** ₹2,000 किस्त व फसल बीमा क्लेम की जानकारी लें।\n- 📦 **फसल बेचें:** अपनी फसल Agrixora पर तुरंत लिस्ट करें।`
          : `🌾 **Namaste Kisan Brother!** 🙏\n\nI am your Agrixora Krishi Vani AI Assistant. How can I help your farm today?\n\n- 📊 **Mandi Prices:** Ask live rates of Onion, Tomato, Maize, Wheat, etc.\n- 🌦️ **Weather & Rain:** Get 3-day forecast & spray timing.\n- 🐛 **Pest & Disease:** Get exact medicine dosage for crop diseases.\n- 🏛️ **PM-Kisan Schemes:** Check ₹2,000 installment & insurance.\n- 📦 **Sell Produce:** List your harvest directly for verified buyers.`,
      };
    }

    // -------------------------------------------------------------
    // 2. FERTILIZER & NUTRITION (खाद, यूरिया, DAP, NPK, जिंक, जाइम)
    // -------------------------------------------------------------
    if (q.includes('khad') || q.includes('urea') || q.includes('dap') || q.includes('npk') || q.includes('fertilizer') || q.includes('zinc') || q.includes('potash') || q.includes('खाद') || q.includes('यूरिया') || q.includes('डीएपी') || q.includes('पोटाश') || q.includes('जिंक') || q.includes('पोषक')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'fertilizer',
        text: isHi
          ? `🌱 **फसल के लिए संतुलित खाद व उर्वरक तालिका (प्रति एकड़):**\n\n1. 🌾 **बुवाई के समय (Basal Dose):**\n   - **DAP (18:46:0):** 50 किलोग्राम (1 बोरी) प्रति एकड़।\n   - **MOP (पोटाश):** 25-30 किलोग्राम प्रति एकड़ (दानों की चमक व वजन बढ़ाने हेतु)।\n   - **जिंक सल्फेट (33%):** 5 किलोग्राम प्रति एकड़ (मिट्टी में मिलाकर डालें)।\n\n2. 🌿 **पहली व दूसरी सिंचाई पर (Top Dressing):**\n   - **नीम लेपित यूरिया:** 45 किलोग्राम प्रति एकड़।\n   - **नैनो यूरिया (Nano Urea):** 4 ml प्रति लीटर पानी (40-50 ml प्रति 15L टंकी) में स्प्रे करें।\n\n3. 💧 **फूल व फल बनते समय:**\n   - **NPK 0:52:34 या 19:19:19:** 1 किलोग्राम प्रति 150-200 लीटर पानी में घोलकर स्प्रे करें।\n\n💡 *सलाह: यूरिया हमेशा खेत में नमी होने पर ही डालें।*`
          : `🌱 **Balanced Fertilizer & Nutrient Schedule (Per Acre):**\n\n1. 🌾 **At Sowing Time (Basal Dose):**\n   - **DAP (18:46:0):** 50 Kg (1 Bag) per acre.\n   - **MOP (Potash):** 25-30 Kg per acre for grain weight and shining.\n   - **Zinc Sulphate 33%:** 5 Kg per acre mixed in soil.\n\n2. 🌿 **Top Dressing (1st & 2nd Irrigation):**\n   - **Neem Coated Urea:** 45 Kg per acre.\n   - **Nano Urea:** 4 ml per Litre of water (40 ml per 15L sprayer tank).\n\n3. 💧 **Fruiting & Flowering Stage:**\n   - **NPK 19:19:19 or 0:52:34:** 1 Kg per 150-200 Litres of water.`,
        cardData: {
          dap: '50 Kg / Acre',
          urea: '45 Kg / Acre',
          potash: '25 Kg / Acre',
          nanoUrea: '4 ml / Litre'
        }
      };
    }

    // -------------------------------------------------------------
    // 3. CROP DISEASE, PEST & YELLOWING (रोग, कीड़ा, पीलापन, दवा, स्प्रे)
    // -------------------------------------------------------------
    if (
      q.includes('disease') || q.includes('bimari') || q.includes('keeda') || q.includes('pest') ||
      q.includes('pila') || q.includes('yellow') || q.includes('patte') || q.includes('leaf') ||
      q.includes('fungus') || q.includes('ilaj') || q.includes('cure') || q.includes('dawa') ||
      q.includes('spray') || q.includes('rog') || q.includes('illli') || q.includes('fularmy') ||
      q.includes('fungicide') || q.includes('pesticide') || q.includes('रोग') || q.includes('कीड़ा') ||
      q.includes('पीला') || q.includes('इल्ली') || q.includes('दवा') || q.includes('स्प्रे') ||
      q.includes('झुलसा') || q.includes('फफूंद') || q.includes('थ्रिप्स')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'disease',
        text: isHi
          ? `🌿 **फसल रोग व कीट निवारण विशेषज्ञ पर्ची (कृषि रक्षक गाइड):**\n\n1. 🍂 **पत्तियों का पीलापन (Yellowing of Leaves):**\n   - **कारण:** नाइट्रोजन व जिंक/आयरन की कमी।\n   - **उपचार:** **19:19:19 NPK (75 ग्राम)** + **चिलेटेड जिंक (15 ग्राम)** प्रति 15 लीटर पानी की टंकी में मिलाकर स्प्रे करें।\n\n2. 🐛 **मक्का, गोभी व सब्जियों में इल्ली / फॉल आर्मीवर्म:**\n   - **दवा:** **इमामेक्टिन बेंजोएट 5% SG (Emamectin Benzoate)** 8-10 ग्राम प्रति 15 लीटर टंकी में शाम के समय स्प्रे करें।\n   - **वैकल्पिक:** **कोराजन (Coragen / Chlorantraniliprole)** 6 ml प्रति 15 लीटर टंकी।\n\n3. 🍄 **टमाटर/आलू में झुलसा रोग (Late & Early Blight):**\n   - **दवा:** **मेंकोजेब 75% WP (Mancozeb)** या **साफ पाउडर (Saaf)** 35-40 ग्राम प्रति 15 लीटर टंकी।\n\n4. 🦟 **रस चूसक कीट (माहू, सफेद मक्खी, थ्रिप्स):**\n   - **दवा:** **इमिडाक्लोप्रिड 17.8% SL** 8-10 ml प्रति 15 लीटर टंकी।\n\n🌿 **जैविक उपाय:** नीम का तेल 1500 PPM (50 ml प्रति 15L टंकी) का छिड़काव करें।`
          : `🌿 **Crop Health & Disease Prescription (Agri Doctor):**\n\n1. 🍂 **Leaf Yellowing (Chlorosis):**\n   - **Treatment:** Foliar spray of **NPK 19:19:19 (75g)** + **Chelated Zinc (15g)** in 15 Litre sprayer tank.\n\n2. 🐛 **Fall Armyworm & Caterpillars (Maize/Vegetables):**\n   - **Medicine:** **Emamectin Benzoate 5% SG** @ 8-10g per 15L tank or **Coragen** @ 6ml per 15L tank in evening.\n\n3. 🍄 **Tomato & Potato Blight (झुलसा रोग):**\n   - **Medicine:** **Mancozeb 75% WP** or **Saaf Powder** @ 35-40g per 15L tank.\n\n4. 🦟 **Sucking Pests (Aphids, Thrips, Whitefly):**\n   - **Medicine:** **Imidacloprid 17.8% SL** @ 8-10ml per 15L tank.`,
        cardData: {
          cropTarget: isHi ? 'मक्का, टमाटर, प्याज, गेहूं, धान' : 'Maize, Tomato, Onion, Wheat, Paddy',
          remedy1: 'NPK 19:19:19 (75g) + Chelated Zinc (15g) / 15L',
          remedy2: 'Emamectin Benzoate 5% SG (10g) / 15L Tank',
          organic: isHi ? 'नीम तेल 1500 PPM (50 ml/15L टंकी)' : 'Neem Oil 1500 PPM (50 ml/15L tank)'
        }
      };
    }

    // -------------------------------------------------------------
    // 4. MANDI RATES & MSP (प्याज, टमाटर, मक्का, गेहूं, आलू, लहसुन, रेट, भाव)
    // -------------------------------------------------------------
    if (
      q.includes('bhav') || q.includes('rate') || q.includes('mandi') || q.includes('price') ||
      q.includes('onion') || q.includes('pyaj') || q.includes('pyaaz') || q.includes('kanda') ||
      q.includes('tamatar') || q.includes('tomato') || q.includes('makka') || q.includes('maize') ||
      q.includes('wheat') || q.includes('gehu') || q.includes('aalu') || q.includes('potato') ||
      q.includes('lahsun') || q.includes('garlic') || q.includes('msp') || q.includes('daam') ||
      q.includes('भाव') || q.includes('रेट') || q.includes('मंडी') || q.includes('दाम') ||
      q.includes('प्याज') || q.includes('टमाटर') || q.includes('मक्का') || q.includes('गेहूं') ||
      q.includes('आलू') || q.includes('लहसुन')
    ) {
      const priceCards = [
        { crop: isHi ? '🧅 लाल प्याज (Red Onion)' : 'Red Onion (Export Grade)', mandi: 'हाजीपुर / नासिक APMC', rate: '₹26.50 / Kg', msp: '₹24.00', trend: '+4.2% मांग तेज' },
        { crop: isHi ? '🍅 टमाटर हाइब्रिड (Tomato)' : 'Tomato Hybrid', mandi: 'पटना / पुणे APMC', rate: '₹45.00 / Kg', msp: '₹38.00', trend: '+6.1% मजबूत भाव' },
        { crop: isHi ? '🌽 पीला मक्का (Yellow Maize)' : 'Yellow Maize (Makka)', mandi: 'वैशाली / गुलाबबाग', rate: '₹2,450 / क्विंटल', msp: '₹2,225', trend: 'MSP से ₹225 अधिक' },
        { crop: isHi ? '🌾 शरबती गेहूं (Wheat)' : 'Sharbati Wheat C-306', mandi: 'करनाल / सीहोर APMC', rate: '₹2,950 / क्विंटल', msp: '₹2,275', trend: '+3.5% प्रीमियम' },
        { crop: isHi ? '🥔 आलू चिपसोना (Potato)' : 'Potato Chipsona-1', mandi: 'आगरा / बिहार शरीफ', rate: '₹1,550 / क्विंटल', msp: '₹1,350', trend: 'कोल्ड स्टोरेज मांग' }
      ];

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'price',
        text: isHi
          ? `📊 **आज का लाइव कृषि मंडी भाव व MSP अपडेट:**\n\n- 🧅 **लाल प्याज (Garwa Grade):** ₹26.50/किलो (₹2,650/क्विंटल)\n- 🍅 **टमाटर हाइब्रिड:** ₹45.00/किलो (थोक मांग में 6% उछाल)\n- 🌽 **पीला मक्का (सुपर क्वालिटी):** ₹2,450/क्विंटल (सरकारी MSP ₹2,225 से ₹225 अधिक)\n- 🌾 **शरबती गेहूं C-306:** ₹2,950/क्विंटल\n- 🥔 **आलू (चिपसोना):** ₹1,550/क्विंटल\n\n💡 *सुझाव: Agrixora पर सीधे थोक खरीदार को बेचकर 15-20% अधिक मुनाफा पाएं।*`
          : `📊 **Today's Live Mandi Benchmark & Rates:**\n\n- 🧅 **Red Onion:** ₹26.50/Kg (₹2,650/Qtl)\n- 🍅 **Tomato Hybrid:** ₹45.00/Kg (Strong demand)\n- 🌽 **Yellow Maize:** ₹2,450/Qtl (₹225 above MSP)\n- 🌾 **Sharbati Wheat:** ₹2,950/Qtl\n- 🥔 **Potato:** ₹1,550/Qtl\n\n💡 *Tip: Sell directly on Agrixora to bypass middlemen commissions.*`,
        cardData: { priceCards }
      };
    }

    // -------------------------------------------------------------
    // 5. WEATHER & RAIN FORECAST (मौसम, बारिश, तापमान, धूप, हवा)
    // -------------------------------------------------------------
    if (
      q.includes('mausam') || q.includes('weather') || q.includes('barish') || q.includes('rain') ||
      q.includes('forecast') || q.includes('tapman') || q.includes('dhoop') || q.includes('temp') ||
      q.includes('aandhi') || q.includes('pala') || q.includes('मौसम') || q.includes('बारिश') ||
      q.includes('तापमान') || q.includes('धूप') || q.includes('हवा') || q.includes('बरसात')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'weather',
        text: isHi
          ? `🌦️ **आगामी 3 दिनों का कृषि मौसम व वर्षा पूर्वानुमान:**\n\n- ☀️ **आज (दिन 1):** 28°C धूप खिली रहेगी, नमी 62%, हवा 11 km/h। (कीटनाशक व खाद छिड़काव के लिए अनुकूल समय)\n- ⛅ **कल (दिन 2):** 27°C आंशिक बादल छाए रहेंगे, हल्की बूंदाबांदी (20% संभावना)।\n- 🌧️ **परसों (दिन 3):** 25°C दोपहर बाद हल्की से मध्यम बारिश (3.5 mm) होने का अनुमान।\n\n⚠️ **किसान भाइयों के लिए जरूरी सलाह:**\n1. खलिहान या खुले में रखी फसल को तिरपाल से ढक लें।\n2. कीटनाशक का स्प्रे आज शाम 5 बजे तक पूरा कर लें।`
          : `🌦️ **3-Day Agro-Meteorological Weather Alert:**\n\n- ☀️ **Today (Day 1):** 28°C Clear & Sunny, Humidity 62%, Wind 11 km/h. (Safe for spray)\n- ⛅ **Tomorrow (Day 2):** 27°C Partly Cloudy, 20% drizzle chance.\n- 🌧️ **Day 3:** 25°C Light to moderate rain (3.5 mm) expected.\n\n⚠️ **Advisory:** Cover harvested crops in shaded store. Finish pesticide sprays today before rain.`,
        cardData: {
          temp: '28°C',
          condition: isHi ? 'धूप खिली हुई (अनुकूल)' : 'Clear & Sunny',
          humidity: '62%',
          rainChance: '15%',
          wind: '11 km/h',
          sprayStatus: isHi ? '✅ आज स्प्रे के लिए सुरक्षित' : '✅ Safe for Spray'
        }
      };
    }

    // -------------------------------------------------------------
    // 6. GOVT SCHEMES & SUBSIDY (PM किसान, किस्त, बीमा, केसीसी, सोलर पंप)
    // -------------------------------------------------------------
    if (
      q.includes('pm kisan') || q.includes('yojana') || q.includes('scheme') || q.includes('subsidy') ||
      q.includes('bima') || q.includes('insurance') || q.includes('kcc') || q.includes('loan') ||
      q.includes('2000') || q.includes('kusum') || q.includes('solar') || q.includes('योजना') ||
      q.includes('सब्सिडी') || q.includes('बीमा') || q.includes('किस्त') || q.includes('लोन') ||
      q.includes('केसीसी') || q.includes('सोलर')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'scheme',
        text: isHi
          ? `🏛️ **प्रमुख सरकारी किसान योजनाएं व सहायता विवरण:**\n\n1. 💳 **PM-किसान सम्मान निधि (₹6,000 प्रति वर्ष):**\n   - प्रत्येक 4 माह में ₹2,000 सीधे बैंक खाते में (DBT)।\n   - किस्त पाने के लिए **e-KYC** और बैंक खाते में **आधार सीडिंग (DBT Active)** होना जरूरी है।\n   - आधिकारिक पोर्टल: pmkisan.gov.in (टोल-फ्री 155261 / 1800-180-1551)\n\n2. 🛡️ **प्रधानमंत्री फसल बीमा योजना (PMFBY):**\n   - बाढ़, सूखा या ओलावृष्टि से नुकसान पर 72 घंटे के भीतर हेल्पलाइन **14447** पर क्लेम दर्ज करें।\n\n3. 🚜 **किसान क्रेडिट कार्ड (KCC) 4% ब्याज लोन:**\n   - ₹3 लाख तक का कृषि ऋण मात्र 4% रियायती ब्याज दर पर।\n\n4. ☀️ **पीएम-कुसुम सोलर पंप योजना:**\n   - खेतों में सिंचाई हेतु सोलर पंप लगाने पर 60% से 90% तक सरकारी सब्सिडी।`
          : `🏛️ **Key Govt Agricultural Welfare Schemes:**\n\n1. 💳 **PM-Kisan Samman Nidhi:**\n   - ₹6,000 annual direct benefit transfer in 3 installments of ₹2,000.\n   - Complete e-KYC on pmkisan.gov.in or CSC Center.\n\n2. 🛡️ **Pradhan Mantri Fasal Bima Yojana (PMFBY):**\n   - Crop loss claim within 72 hours on Toll-Free 14447.\n\n3. 🚜 **Kisan Credit Card (KCC):**\n   - Subsidized 4% interest rate crop loan up to ₹3.00 Lakhs.\n\n4. ☀️ **PM-KUSUM Solar Pump Scheme:**\n   - Up to 60-90% subsidy on agricultural solar pumps.`,
        cardData: {
          helpline: '1800-180-1551 (Kisan Call Centre)',
          kccLimit: '₹3,00,000 @ 4% p.a.',
          pmKisan: '₹2,000 Direct DBT'
        }
      };
    }

    // -------------------------------------------------------------
    // 7. SELL CROP / LIST PRODUCE (फसल बेचना, लिस्ट करना, मंडी में बेचना)
    // -------------------------------------------------------------
    if (
      q.includes('bechna') || q.includes('sell') || q.includes('list') || q.includes('add produce') ||
      q.includes('fasal bechna') || q.includes('create listing') || q.includes('kharidar') ||
      q.includes('बेचना') || q.includes('लिस्ट') || q.includes('खरीदार') || q.includes('फसल बिक्री')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'action',
        text: isHi
          ? `📦 **अपनी फसल Agrixora पर सीधे थोक खरीदारों को बेचें:**\n\nमैंने आपकी सहायता के लिए 'Add Produce' पेज तैयार कर दिया है। नीचे दिए गए हरे बटन को दबाकर आप 1 मिनट में अपनी फसल (फसल का नाम, मात्रा क्विंटल में, अपेक्षित भाव व नजदीकी FCI हब) दर्ज कर सकते हैं। Agrixora के सत्यापित खरीदार सीधे आपसे संपर्क करेंगे और एस्क्रो खाते द्वारा सुरक्षित भुगतान मिलेगा!`
          : `📦 **Sell Your Produce Directly on Agrixora:**\n\nClick the button below to register your harvest details (crop name, quantity in Quintals, expected price & FCI hub). Verified institutional buyers will place direct orders with guaranteed escrow bank payment!`,
        cardData: {
          actionType: 'add_produce',
          btnText: isHi ? '🌾 नई फसल बिक्री हेतु दर्ज करें (Add Produce)' : '🌾 List New Crop for Sale'
        }
      };
    }

    // -------------------------------------------------------------
    // 8. LOGISTICS & REEFER TRACKING (गाड़ी, ट्रक, रीफर, कोल्ड स्टोरेज, भाड़ा)
    // -------------------------------------------------------------
    if (
      q.includes('truck') || q.includes('track') || q.includes('reefer') || q.includes('cold') ||
      q.includes('storage') || q.includes('delivery') || q.includes('gadi') || q.includes('vahan') ||
      q.includes('ट्रक') || q.includes('गाड़ी') || q.includes('रीफर') || q.includes('कोल्ड स्टोरेज') ||
      q.includes('ट्रैकिंग') || q.includes('भाड़ा')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: timeStr,
        type: 'action',
        text: isHi
          ? `🚚 **लाइव रीफर कोल्ड-चेन व GPS वाहन ट्रैकिंग:**\n\n- 📍 **सक्रिय वाहन:** MH-15-TC-9042 (Tata 407 Reefer Cold Container)\n- ❄️ **लाइव तापमान:** 4.1°C (फसल बिल्कुल ताज़ा व सुरक्षित)\n- 🛣️ **वर्तमान रूट:** NH-19 वाराणसी-पटना कॉरिडोर (पहुंचने का समय: 2 घंटे 40 मिनट)\n\nनीचे दिए गए बटन से पूरा 3D लाइव नेविगेशन मैप देखें:`
          : `🚚 **Live Reefer Cold-Chain & GPS Logistics:**\n\n- 📍 **Active Vehicle:** MH-15-TC-9042 (Tata 407 Reefer Container)\n- ❄️ **Live Temp:** 4.1°C (Optimal freshness)\n- 🛣️ **Route:** NH-19 Varanasi-Patna Corridor (ETA: 2h 40m)\n\nClick below to open the Live 3D Reefer Navigation Map:`,
        cardData: {
          actionType: 'track_delivery',
          btnText: isHi ? '🚚 लाइव GPS रीफर मैप खोलें' : '🚚 Open Live Reefer GPS Map'
        }
      };
    }

    // -------------------------------------------------------------
    // 9. DEFAULT ULTRA-HELPFUL AGRICULTURAL FALLBACK
    // -------------------------------------------------------------
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: timeStr,
      type: 'general',
      text: isHi
        ? `🌾 **किसान भाई, मैंने आपका सवाल समझा!**\n\nकृषि वाणी AI आपकी इन मुख्य समस्याओं का तुरंत सटीक समाधान दे सकता है:\n\n1. 📊 **मंडी भाव:** "आज का प्याज, टमाटर या मक्का का भाव क्या है?"\n2. 🌦️ **मौसम पूर्वानुमान:** "कल बारिश होगी क्या और स्प्रे कब करें?"\n3. 🐛 **रोग व कीटनाशक:** "पत्तियों का पीलापन या इल्ली की दवा बताओ"\n4. 🌱 **खाद की मात्रा:** "यूरिया और DAP कितना डालना चाहिए?"\n5. 🏛️ **सरकारी योजनाएं:** "PM किसान 2000 किस्त कैसे चेक करें?"\n6. 📦 **फसल बेचना:** "मुझे अपनी फसल सीधे बेचना है"\n\n👉 *नीचे दिए गए किसी भी बटन को दबाएं या माइक दबाकर बोलें।*`
        : `🌾 **Kisan Brother, I am ready to help!**\n\nHere are the top topics you can ask me directly:\n\n1. 📊 **Mandi Rates:** "What is today's Onion/Maize price?"\n2. 🌦️ **Weather Alert:** "Will it rain tomorrow?"\n3. 🐛 **Crop Doctor:** "How to cure leaf yellowing or caterpillars?"\n4. 🌱 **Fertilizer Guide:** "How much Urea and DAP per acre?"\n5. 🏛️ **PM-Kisan:** "How to check ₹2,000 installment status?"\n6. 📦 **Sell Produce:** "I want to list my crop for buyers"\n\n👉 *Tap any topic tab below or click the mic button to speak.*`
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
          ? '🌾 **राम-राम किसान भाई! नमस्ते!** 🙏\n\nमैं हूँ आपका **Agrixora कृषि वाणी AI सहायक**।\nआप मुझसे बोलकर या लिखकर किसी भी फसल का आज का **मंडी भाव**, 3-दिन का **मौसम**, फसल में **कीड़े/पीलेपन की दवा**, **खाद की सही मात्रा**, या **PM-किसान योजना** की सटीक जानकारी ले सकते हैं।'
          : '🌾 **Namaste Kisan Brother!** 🙏\n\nI am your **Agrixora Krishi Vani AI Voice Assistant**.\nSpeak or type to check live Mandi prices, 3-day weather alerts, crop disease remedies, or sell your produce directly.',
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
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/95 text-emerald-300 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-500/40 shadow-2xl text-xs font-bold animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{activeLang === 'hi' ? '🌾 कृषि वाणी: बोलकर पूछें' : '🌾 Krishi Vani: Speak here'}</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative group p-4 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-2xl shadow-emerald-900/60 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-300/50 flex items-center justify-center cursor-pointer"
            title={activeLang === 'hi' ? 'कृषि वाणी AI सहायक खोलें' : 'Open Kisan AI Voice Assistant'}
          >
            {/* Pulsing ring animation */}
            <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping opacity-75" />
            <span className="absolute -inset-2.5 rounded-full bg-teal-500/25 blur-sm" />
            
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
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[680px] z-50 flex flex-col bg-slate-900 text-slate-100 rounded-none sm:rounded-3xl shadow-2xl border border-emerald-500/40 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* TOP HEADER */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/50 flex items-center justify-between">
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
                    {activeLang === 'hi' ? '🌾 कृषि वाणी AI (Kisan Voice)' : '🌾 Krishi Vani Voice AI'}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/90 font-medium">
                  {activeLang === 'hi' ? 'स्मार्ट किसान आवाज़ सहायक • 24/7 कृषि गाइड' : 'Smart Voice Assistant • 24/7 Agro Guide'}
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
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Toggle Hindi / English"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeLang === 'hi' ? 'हिन्दी' : 'ENG'}</span>
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
                title={speechMuted ? 'Unmute Audio (आवाज़ चालू करें)' : 'Mute Audio (आवाज़ बंद करें)'}
              >
                {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Restart Chat (नई बातचीत)"
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

          {/* 📑 TOPIC FILTER TABS (1-Click Instant Resolution) */}
          <div className="p-2 bg-slate-950/95 border-b border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {topicTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTopicFilter(tab.id);
                  handleUserQuery(tab.query);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-emerald-800/60 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[92%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none border border-emerald-400/30 font-medium'
                      : 'bg-slate-800/95 text-slate-100 rounded-bl-none border border-slate-700/90 backdrop-blur-md'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* 📊 VISUAL PRICE CARD */}
                  {msg.type === 'price' && msg.cardData?.priceCards && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.cardData.priceCards.map((pc: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between shadow-xs">
                          <div>
                            <div className="text-[11px] font-bold text-emerald-300">{pc.crop}</div>
                            <div className="text-[10px] text-slate-400">{pc.mandi}</div>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-slate-800">
                            <span className="text-sm font-black text-amber-400">{pc.rate}</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-600/30">{pc.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🌦️ VISUAL WEATHER CARD */}
                  {msg.type === 'weather' && msg.cardData && (
                    <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/70 to-slate-900/90 border border-blue-500/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CloudSun className="w-7 h-7 text-amber-400 animate-pulse" />
                          <div>
                            <span className="text-xl font-black text-white">{msg.cardData.temp}</span>
                            <span className="text-xs text-slate-300 ml-2 font-medium">{msg.cardData.condition}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          {msg.cardData.sprayStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-slate-800 text-[10px] text-slate-300">
                        <div className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> {msg.cardData.humidity} नमी</div>
                        <div className="flex items-center gap-1"><CloudSun className="w-3.5 h-3.5 text-amber-400" /> {msg.cardData.rainChance} वर्षा</div>
                        <div className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-teal-400" /> {msg.cardData.wind}</div>
                      </div>
                    </div>
                  )}

                  {/* 🐛 VISUAL DISEASE PRESCRIPTION CARD */}
                  {msg.type === 'disease' && msg.cardData && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] space-y-2">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5 border-b border-amber-600/30 pb-1">
                        <Bug className="w-4 h-4 text-amber-400" />
                        <span>{activeLang === 'hi' ? 'अनुशंसित कृषि रक्षक उपचार व सटीक मात्रा' : 'Recommended Agro Chemical Dosage'}</span>
                      </div>
                      <div className="text-slate-200">
                        <span className="text-emerald-400 font-bold">1. </span> {msg.cardData.remedy1}
                      </div>
                      <div className="text-slate-200">
                        <span className="text-emerald-400 font-bold">2. </span> {msg.cardData.remedy2}
                      </div>
                      <div className="text-emerald-300 text-[10px] bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-600/30">
                        🌿 <strong>{activeLang === 'hi' ? 'जैविक उपाय:' : 'Organic Alternative:'}</strong> {msg.cardData.organic}
                      </div>
                    </div>
                  )}

                  {/* 🌱 VISUAL FERTILIZER CARD */}
                  {msg.type === 'fertilizer' && msg.cardData && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <div className="text-slate-400 text-[10px]">DAP खाद (बुवाई)</div>
                        <div className="font-black text-emerald-400 text-xs">{msg.cardData.dap}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <div className="text-slate-400 text-[10px]">यूरिया (सिंचाई पर)</div>
                        <div className="font-black text-amber-400 text-xs">{msg.cardData.urea}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <div className="text-slate-400 text-[10px]">पोटाश MOP</div>
                        <div className="font-black text-cyan-400 text-xs">{msg.cardData.potash}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                        <div className="text-slate-400 text-[10px]">नैनो यूरिया स्प्रे</div>
                        <div className="font-black text-emerald-300 text-xs">{msg.cardData.nanoUrea}</div>
                      </div>
                    </div>
                  )}

                  {/* 🏛️ VISUAL SCHEME CARD */}
                  {msg.type === 'scheme' && msg.cardData && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-emerald-300 font-bold">
                        <span>📞 किसान कॉल सेंटर हेल्पलाइन:</span>
                        <span className="text-amber-400 font-mono font-black">{msg.cardData.helpline}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>KCC ऋण सीमा:</span>
                        <span className="text-white font-bold">{msg.cardData.kccLimit}</span>
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
                    <div className="mt-2.5 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">{msg.timestamp}</span>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-emerald-300 transition-colors cursor-pointer border border-slate-700"
                        title="Replay Audio (आवाज़ में सुनें)"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeLang === 'hi' ? 'आवाज़ में सुनें' : 'Listen Audio'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* LIVE SPEECH TRANSCRIPTION INDICATOR */}
            {isListening && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs animate-pulse shadow-lg">
                <Mic className="w-5 h-5 text-amber-400 animate-bounce" />
                <div className="flex-1 font-medium">
                  {transcriptLive 
                    ? `"${transcriptLive}"...` 
                    : (activeLang === 'hi' ? 'बोलिए किसान भाई, मैं सुन रहा हूँ...' : 'Listening, please speak...')}
                </div>
                <div className="flex gap-1 items-end h-5">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-5 bg-teal-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* QUICK PROMPT SUGGESTIONS */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleUserQuery(qp.query)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-900/70 text-slate-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* FOOTER INPUT CONTROLS */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
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
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/50'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 active:scale-95 shadow-emerald-900/50'
                }`}
                title={isListening ? 'Stop Listening (बोलना बंद करें)' : 'Click to Speak (माइक दबाकर बोलें)'}
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
                      ? 'माइक दबाकर बोलें या यहाँ प्रश्न लिखें...' 
                      : 'Click mic to speak or type question here...'
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
