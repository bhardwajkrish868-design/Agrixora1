/**
 * 🌐 Farm2Future Real-Time Bidirectional Hindi & English Translation Engine
 * Provides instant, zero-latency, full-interface translation across all DOM elements,
 * React components, modals, inputs, placeholders, and tooltips.
 */

// 1. 📖 High-Precision Master Phrase Dictionary (Multi-word phrases, sentences, & headings)
export const MASTER_PHRASES: Record<string, string> = {
  // Navigation & Platform Branding
  "Stakeholder Scope": "हितधारक समूह",
  "Stakeholder Scope:": "हितधारक समूह:",
  "Registered Now": "वर्तमान में पंजीकृत",
  "Registered Now (Live DB)": "वर्तमान में पंजीकृत (लाइव डेटाबेस)",
  "Upcoming / Projected": "आगामी / अनुमानित",
  "Upcoming / Projected Network": "आगामी / अनुमानित नेटवर्क",
  "Upcoming Network": "आगामी नेटवर्क",
  "Upcoming Pipeline": "आगामी पाइपलाइन",
  "Live DB": "लाइव डेटाबेस",
  "Live in DB": "डेटाबेस में लाइव",
  "Stored Accounts": "सहेजे गए खाते",
  "Onboard Now": "अभी ऑनबोर्ड करें",
  "Onboard to Live DB": "लाइव डेटाबेस में ऑनबोर्ड करें",
  "Upcoming Seasonal Pipeline & FPOs": "आगामी मौसमी पाइपलाइन एवं एफपीओ क्लस्टर",
  "Live Registered Accounts": "वर्तमान पंजीकृत खाते",
  "Smart Marketplace & Transparent Supply Chain": "स्मार्ट मार्केटप्लेस और पारदर्शी आपूर्ति श्रृंखला",
  "Agricultural Market Price Intelligence": "कृषि बाज़ार मूल्य विश्लेषण",
  "Return to Main Welcome Gateway": "मुख्य वेलकम गेटवे पर वापस जाएँ",
  "Main Welcome Gateway": "मुख्य वेलकम गेटवे",
  "Go Back": "वापस जाएँ",
  "Switch Role": "रोल बदलें",
  "Logout": "लॉगआउट",
  "Login": "लॉगिन",
  "Sign In": "साइन इन",
  "Sign Up": "साइन अप",
  "Register": "रजिस्टर करें",
  "Create Account": "नया खाता बनाएं",
  "Welcome Gateway": "वेलकम गेटवे",
  "Admin Passkey": "एडमिन पासकी",
  "Admin Console": "एडमिन कंसोल",
  "Security Passkey": "सुरक्षा पासकी",
  "Notifications": "सूचनाएं",
  "Live Notifications": "लाइव सूचनाएं",
  "Instant updates across your supply chain": "सप्लाई चेन की ताज़ा अपडेट्स",
  "Supply Chain Notifications & Real-Time Alerts": "सप्लाई चेन सूचनाएं एवं रीयल-टाइम अलर्ट",
  "Supply Chain Notifications & Live Alerts": "सप्लाई चेन सूचनाएं एवं रीयल-टाइम अलर्ट",
  "Mark all as read": "सभी पढ़ा हुआ चिह्नित करें",
  "Mark read": "पढ़ा हुआ करें",
  "Mark All Read": "सभी पढ़ा हुआ करें",
  "Clear All": "सभी साफ़ करें",
  "Clear all notifications": "सभी सूचनाएं साफ़ करें",
  "No notifications yet": "अभी कोई सूचना नहीं है",
  "No notifications found": "कोई सूचना नहीं मिली",
  "Search notifications...": "सूचनाएं खोजें...",
  "Open Full Notifications Center": "सभी सूचनाएं पूर्ण स्क्रीन में देखें",
  "View details": "विवरण देखें",
  "Track Consignment": "खेप ट्रैक करें",
  "Open Details": "विवरण खोलें",
  "Open Consignment Details": "खेप विवरण खोलें",
  "All Alerts": "सभी सूचनाएं",
  "Total Alerts": "कुल सूचनाएं",
  "Orders": "ऑर्डर",
  "Logistics": "परिवहन",
  "Quality": "गुणवत्ता",
  "Unread": "अपठित",
  "New": "नया",
  "Just now": "अभी-अभी",
  "New Advance Order Received (Nashik Red Onion)": "नया अग्रिम ऑर्डर प्राप्त (नासिक लाल प्याज)",
  "NABL Quality Lab Report Available (Grade A+)": "NABL गुणवत्ता लैब रिपोर्ट उपलब्ध (ग्रेड A+)",
  "Govt MSP Floor Rate Revision Approved": "सरकारी MSP न्यूनतम मूल्य संशोधन स्वीकृत",
  "Direct Bank Payout Settled (₹4,60,688)": "सीधा बैंक भुगतान सम्पन्न (₹4,60,688)",
  "Consignment Dispatched & Live GPS Active": "खेप रवाना और लाइव GPS सक्रिय",
  "Trade Escrow Protection Active": "व्यापार एस्क्रो सुरक्षा सक्रिय",
  "4-Month Pre-Harvest Pooling Bay Live (500T Wheat)": "4-माह पूर्व-कटाई एकत्रीकरण सक्रिय (500T गेहूं)",
  "Consignment Delivered Successfully": "खेप सफलतापूर्वक वितरित",
  "Incoming Farmgate Trucks in Queue (Lasalgaon Hub)": "धर्मकांटा आवक कतार में किसान ट्रक (लासलगांव हब)",
  "Cold Storage Silo #3 Sensor Telemetry Optimal": "कोल्ड स्टोरेज साइलो #3 सेंसर डेटा सामान्य",
  "AI Fleet Allocation: Reefer Truck Assigned": "एआई वाहन आवंटन: रीफर ट्रक आवंटित",
  "National Escrow Vault Daily Audit Report": "राष्ट्रीय एस्क्रो वॉल्ट दैनिक ऑडिट रिपोर्ट",
  "State Transport Fleet GPS Health 100%": "राज्य परिवहन बेड़ा GPS स्थिति 100%",
  "Persistent Cloud Database Sync Succeeded": "क्लाउड डेटाबेस सिंक सफल रहा",
  "Direct Trade Platform Operational Across 24+ States": "प्रत्यक्ष व्यापार मंच 24+ राज्यों में सक्रिय",

  // Top Metric Cards & Dashboards
  "Produce Listed": "सूचीबद्ध उपज",
  "Active Orders": "सक्रिय ऑर्डर",
  "Total Earnings": "कुल कमाई",
  "Pending Escrow": "लंबित एस्क्रो",
  "Settled Directly to Bank": "सीधे बैंक खाते में जमा",
  "Locked in Secure Escrow": "सुरक्षित एस्क्रो में जमा",
  "In Transit / Hub Verification": "रास्ते में / हब सत्यापन जारी",
  "Active Crop Lots": "सक्रिय फसल लॉट",
  "List New Harvest": "नई फसल लिस्ट करें",
  "Check APMC Rates": "मंडी भाव देखें",
  "Kisan ID": "किसान आईडी",
  "Direct marketplace access with guaranteed escrow payouts.": "गारंटीशुदा एस्क्रो भुगतान के साथ प्रत्यक्ष बाज़ार पहुँच।",
  "Direct Farmer Payouts Growth": "प्रत्यक्ष किसान भुगतान वृद्धि",
  "Monthly net revenue received without middlemen deductions": "बिचौलियों की कटौती के बिना प्राप्त शुद्ध मासिक आय",
  "Zero Middlemen": "शून्य बिचौलिया",
  "Same-Day Escrow Release": "उसी दिन एस्क्रो भुगतान",
  "Live AGMARKNET & Mandi modal rates, daily arrival volumes, and Government MSP benchmarks.": "लाइव एगमार्कनेट और मंडी मॉडल दरें, दैनिक आवक मात्रा और सरकारी एमएसपी बेंचमार्क।",
  "Live price intelligence powered by eNAM & APMC feeds": "ई-नाम और एपीएमसी द्वारा संचालित लाइव बाज़ार भाव विश्लेषण",
  "Mandi Benchmark vs Recommended Selling Price": "मंडी बेंचमार्क बनाम अनुशंसित विक्रय मूल्य",
  "Nearest Target APMC Mandi": "निकटतम लक्ष्य एपीएमसी मंडी",
  "Benchmark APMC Krishi Mandi": "बेंचमार्क एपीएमसी कृषि मंडी",
  "Matched to your Profile": "आपकी प्रोफ़ाइल से संबद्ध",
  "Matched to": "से संबद्ध",
  "Reset to Profile": "प्रोफ़ाइल पर रीसेट करें",
  "Reset to Profile Location": "प्रोफ़ाइल स्थान पर रीसेट करें",
  "Live 2026 AGMARKNET / eNAM Modal Rates": "लाइव 2026 एगमार्कनेट / ई-नाम मॉडल दरें",
  "View all mandis": "सभी मंडियां देखें",
  "Mandi Spot Prices": "मंडी हाज़िर भाव",
  "Modal APMC:": "मॉडल एपीएमसी:",
  "Current Modal:": "वर्तमान मॉडल भाव:",
  "AI Target Price:": "एआई लक्ष्य मूल्य:",
  "Platform AI Price:": "प्लेटफ़ॉर्म एआई भाव:",
  "Today's Modal Rate": "आज का मॉडल भाव",
  "AI Recommended": "एआई अनुशंसित दर",
  "Min - Max Range": "न्यूनतम - अधिकतम दायरा",
  "Demand / Supply": "मांग / आपूर्ति",
  "7-Day Trend": "7-दिवसीय रुझान",
  "30-Day Range": "30-दिवसीय दायरा",
  "Direct Selling Net Gain Calculator": "प्रत्यक्ष विक्रय शुद्ध लाभ कैलकुलेटर",
  "Calculate extra revenue by selling on Farm2Future vs local middlemen": "स्थानीय बिचौलियों के मुकाबले Farm2Future पर बेचकर अतिरिक्त लाभ की गणना करें",
  "Your Harvest Volume (Quintals)": "आपकी फसल की मात्रा (क्विंटल)",
  "Local Mandi Return:": "स्थानीय मंडी से आय:",
  "Farm2Future Direct Return:": "Farm2Future से सीधी आय:",
  "Extra Profit!": "अतिरिक्त लाभ!",
  "List at Recommended Rate": "अनुशंसित दर पर लिस्ट करें",

  // Bulk Demand & Institutional Procurement
  "Live Institutional Bulk Procurement Demands": "लाइव संस्थागत थोक खरीद मांग",
  "Mega Pools": "मेगा पूल",
  "Accept & Supply Produce": "स्वीकारें और आपूर्ति करें",
  "Quota Filled": "कोटा पूर्ण हो गया",
  "Delivery Destination": "वितरण गंतव्य",
  "Target APMC Mandi": "लक्षित एपीएमसी मंडी",
  "Total Demanded": "कुल मांगी गई मात्रा",
  "Pooled So Far": "अब तक एकत्रित मात्रा",
  "Remaining Quota": "शेष कोटा",
  "Procurement Rate": "खरीद दर",
  "Accept Demand": "मांग स्वीकारें",
  "Contribute Quantity": "मात्रा का योगदान दें",
  "Contribution Status": "योगदान स्थिति",

  // Add Produce & Listing Form
  "List Your Harvest": "अपनी उपज लिस्ट करें",
  "Upload Crop Photos": "फसल की तस्वीरें अपलोड करें",
  "Crop Category": "फसल श्रेणी",
  "Select Category": "श्रेणी चुनें",
  "Crop Name": "फसल का नाम",
  "Variety / Hybrid": "किस्म / हाइब्रिड",
  "Available Quantity (Quintals)": "उपलब्ध मात्रा (क्विंटल)",
  "Minimum Order Quantity": "न्यूनतम ऑर्डर मात्रा",
  "Expected Price per Quintal": "अपेक्षित मूल्य प्रति क्विंटल",
  "Recommended Price": "अनुशंसित मूल्य",
  "Harvest Date": "कटाई की तिथि",
  "Packaging Type": "पैकेजिंग का प्रकार",
  "Organic Certified?": "क्या जैविक प्रमाणित है?",
  "Farm Location / Address": "खेत का स्थान / पता",
  "State": "राज्य",
  "District": "ज़िला",
  "Pin Code": "पिन कोड",
  "Nearest Collection Hub": "निकटतम कलेक्शन हब",
  "Publish Listing": "लिस्टिंग प्रकाशित करें",
  "Listing Published Successfully!": "उपज सफलतापूर्वक लिस्ट हो गई!",

  // Buyer Catalog & Marketplace
  "Browse Verified Farm Produce": "सत्यापित कृषि उपज खरीदें",
  "Search crops, variety, location...": "फसल, किस्म या स्थान खोजें...",
  "Search crop, state or APMC...": "फसल, राज्य या मंडी खोजें...",
  "All Categories": "सभी श्रेणियां",
  "Filter by Category": "श्रेणी के अनुसार फ़िल्टर करें",
  "Filter by Quality": "गुणवत्ता के अनुसार फ़िल्टर करें",
  "Filter by State": "राज्य के अनुसार फ़िल्टर करें",
  "Price: Low to High": "कीमत: कम से अधिक",
  "Price: High to Low": "कीमत: अधिक से कम",
  "Quantity: High to Low": "मात्रा: अधिक से कम",
  "Highest Rated": "उच्चतम रेटिंग",
  "Direct from Farmer": "सीधे किसान से",
  "Buy Now": "अभी खरीदें",
  "Add to Cart": "कार्ट में जोड़ें",
  "View Details": "विवरण देखें",
  "Available:": "उपलब्ध:",
  "Min Order:": "न्यूनतम ऑर्डर:",
  "Farmer Rating": "किसान रेटिंग",
  "Verified Farm": "सत्यापित खेत",
  "FCI Assured Quality": "एफसीआई प्रमाणित गुणवत्ता",

  // Order Details & Tracking
  "Order Stage": "ऑर्डर स्थिति",
  "Payment Status": "भुगतान स्थिति",
  "Order Placed": "ऑर्डर दर्ज हुआ",
  "Collected at Hub": "हब पर एकत्रित",
  "Quality Tested": "गुणवत्ता परीक्षित",
  "Quality Verified": "गुणवत्ता सत्यापित",
  "In Transit": "रास्ते में (परिवहन)",
  "Delivered": "सफलतापूर्वक डिलीवर",
  "Escrow Locked": "एस्क्रो में सुरक्षित",
  "Disbursed to Farmer": "किसान को भुगतान संपन्न",
  "Refunded": "धनवापसी संपन्न",
  "Payment Pending": "भुगतान प्रतीक्षित",
  "Order ID": "ऑर्डर आईडी",
  "Order Date": "ऑर्डर तिथि",
  "Farmer Name": "किसान का नाम",
  "Buyer Name": "खरीदार का नाम",
  "Total Quantity": "कुल मात्रा",
  "Total Amount": "कुल राशि",
  "Base Amount": "मूल राशि",
  "Escrow Protection Fee": "एस्क्रो सुरक्षा शुल्क",
  "Logistics Fee": "लॉजिस्टिक्स शुल्क",
  "Quality Assurance Fee": "गुणवत्ता आश्वासन शुल्क",
  "Track Live Dispatch": "लाइव वाहन ट्रैक करें",
  "Download Tax Invoice": "कर चालान डाउनलोड करें",
  "Cancel Order": "ऑर्डर रद्द करें",

  // Logistics & Fleet Dispatch
  "Logistics & Smart Fleet Dispatch": "लॉजिस्टिक्स और स्मार्ट वाहन प्रेषण",
  "Available Vehicles": "उपलब्ध वाहन",
  "Assigned Vehicle": "आवंटित वाहन",
  "Driver Name": "चालक का नाम",
  "Driver Phone": "चालक का मोबाइल नंबर",
  "Vehicle Number": "वाहन संख्या",
  "Vehicle Type": "वाहन प्रकार",
  "Total Capacity": "कुल क्षमता",
  "GPS Tracking Live": "लाइव जीपीएस ट्रैकिंग सक्रिय",
  "Dispatch Now": "अभी रवाना करें",
  "Confirm Delivery": "डिलीवरी की पुष्टि करें",
  "Estimated Arrival": "अपेक्षित आगमन समय",

  // Quality Assurance & Lab Testing
  "FCI Quality Assurance & Lab Inspection": "एफसीआई गुणवत्ता आश्वासन और लैब निरीक्षण",
  "Inspection Parameters": "निरीक्षण मानक",
  "Moisture Content": "नमी की मात्रा",
  "Foreign Matter / Admixture": "विदेशी तत्व / कचरा",
  "Damaged / Discolored Grains": "क्षतिग्रस्त / बदरंग दाने",
  "Grain Size & Uniformity": "दाने का आकार और एकरूपता",
  "Shelf Life Estimate": "अनुमानित शेल्फ लाइफ",
  "Quality Grade Assigned": "आवंटित गुणवत्ता ग्रेड",
  "Pass Quality Test": "गुणवत्ता पास करें",
  "Reject Produce Lot": "उपज लॉट अस्वीकार करें",
  "Download Lab Certificate": "लैब प्रमाणपत्र डाउनलोड करें",

  // User Roles & Auth
  "Farmer Portal": "किसान पोर्टल",
  "Institutional Buyer Portal": "संस्थागत खरीदार पोर्टल",
  "Collection Hub Portal": "कलेक्शन हब पोर्टल",
  "Super Admin Console": "सुपर एडमिन कंसोल",
  "Select Your Role": "अपनी भूमिका चुनें",
  "Full Legal Name": "पूरा कानूनी नाम",
  "Mobile Number (10 Digits)": "मोबाइल नंबर (10 अंक)",
  "Create Password": "पासवर्ड बनाएं",
  "Confirm Password": "पासवर्ड की पुष्टि करें",
  "Aadhaar Number (12 Digits)": "आधार नंबर (12 अंक)",
  "Business / Company Name": "व्यवसाय / कंपनी का नाम",
  "Farm Land Size (Acres)": "कृषि भूमि का आकार (एकड़)",
  "GSTIN (Optional)": "जीएसटीआईएन (वैकल्पिक)",
  "State of Residence": "निवास का राज्य",
  "District / Tehsil": "ज़िला / तहसील",
  "Village / Farm Address": "गाँव / खेत का पता",
  "Verify & Register": "सत्यापित करें और रजिस्टर करें",
  "Already have an account?": "पहले से खाता है?",
  "Don't have an account?": "खाता नहीं है?",
  "Login with Password": "पासवर्ड से लॉगिन करें",
  "Switch to Register": "रजिस्टर पर जाएं",
  "Switch to Login": "लॉगिन पर जाएं",

  // Hero, Gateway & Landing
  "Connecting Indian Agriculture with Direct Markets & Guaranteed Escrow": "भारतीय कृषि का स्मार्ट डिजिटल नेटवर्क और गारंटीशुदा एस्क्रो",
  "Connecting Indian Agriculture with": "भारतीय कृषि का",
  "Direct Markets & Guaranteed Escrow": "स्मार्ट डिजिटल नेटवर्क और गारंटीशुदा एस्क्रो",
  "Direct Markets": "प्रत्यक्ष बाज़ार",
  "Guaranteed Escrow": "गारंटीशुदा एस्क्रो",
  "Direct farm-to-enterprise procurement with 4-month pre-harvest contracts, ₹0 farmgate logistics pickup, NABL quality grading, and automated escrow settlement.": "4 महीने पहले अग्रिम अनुबंध, ₹0 खेत से परिवहन, NABL प्रमाणित गुणवत्ता और 100% सुरक्षित भुगतान प्रणाली के साथ किसान और खरीदार को सीधे जोड़ने वाला एकीकृत मंच।",
  "Select your stakeholder portal to Register or Sign In": "रजिस्ट्रेशन या लॉगिन के लिए अपना पोर्टल चुनें",
  "Farmers & Producers": "भारतीय किसान एवं उत्पादक",
  "Indian Farmers": "भारतीय किसान",
  "Get guaranteed advance procurement contracts, ₹0 farmgate pickup logistics, transparent grading, and direct escrow bank payouts.": "4 महीने पहले अग्रिम कॉर्पोरेट अनुबंध, शून्य (₹0) खेत से परिवहन खर्च, NABL गुणवत्ता जांच और सीधे बैंक खाते में सुरक्षित एस्क्रो भुगतान।",
  "✓ ₹0 Farmgate Pickup": "✓ ₹0 खेत से पिकअप",
  "✓ 4-Month Contracts": "✓ 4-माह अग्रिम अनुबंध",
  "✓ Guaranteed Escrow": "✓ गारंटीशुदा एस्क्रो",
  "Password Protected Authentication": "पासवर्ड से सुरक्षित प्रमाणन",
  "Bulk Buyers & Retailers": "थोक खरीदार एवं कॉर्पोरेट",
  "Bulk Buyer Portal": "थोक खरीदार पोर्टल",
  "Pool 50T-500T bulk crop requirements, verify NABL lab quality parameters, track refrigerated delivery fleets, and secure payment via escrow.": "50T–500T थोक मांग पूलिंग, NABL मान्यता प्राप्त प्रयोगशाला जांच, लाइव जीपीएस वाहन ट्रैकिंग और सुरक्षित एस्क्रो फंड सुरक्षा।",
  "✓ 50T–500T Pooling": "✓ 50T–500T मांग पूलिंग",
  "✓ NABL Lab Quality": "✓ NABL लैब गुणवत्ता",
  "✓ Escrow Protection": "✓ एस्क्रो सुरक्षा",
  "Stronger Farms": "सशक्त किसान",
  "Fairer Markets": "पारदर्शी बाज़ार",
  "Cleaner Planet": "स्वच्छ पर्यावरण",
  "Brighter Futures": "उज्ज्वल भविष्य",
  "Govt Admin Console": "सरकारी एडमिन कंसोल",
  "APMC / FCI Collection Hub Terminal (Hidden Portal)": "एपीएमसी / एफसीआई कलेक्शन हब टर्मिनल (गुप्त पोर्टल)",
  "APMC / FCI Collection Hub Hidden Portal (Alt+H)": "एपीएमसी / एफसीआई कलेक्शन हब गुप्त पोर्टल (Alt+H)",
  "Collection Hub Hidden Portal": "कलेक्शन हब गुप्त पोर्टल",

  // Navigation, Workspace & Helplines
  "Active Workspace": "सक्रिय वर्कस्पेस",
  "Navigation": "नेविगेशन",
  "Escrow Guarantee": "एस्क्रो सुरक्षा गारंटी",
  "100% payout security. Funds released only upon delivery verification.": "100% भुगतान सुरक्षा। डिलीवरी सत्यापन के बाद ही राशि सीधे बैंक खाते में भेजी जाती है।",
  "Kisan Helpline": "किसान हेल्पलाइन",
  "Receive Bulk Orders": "थोक खरीद मांग",
  "📥 Receive Bulk Orders": "📥 थोक खरीद मांग",
  "Add Produce": "फसल जोड़ें",
  "My Listings": "मेरी फसलें",
  "Orders Received": "प्राप्त ऑर्डर",
  "State Transport": "राज्य परिवहन",
  "State Transport Fleet": "राज्य परिवहन बेड़ा",
  "State Transport Network": "राज्य परिवहन नेटवर्क",
  "Market Prices": "मंडी भाव",
  "Earnings": "मेरी कमाई",
  "⚡ 4-Mo Bulk Orders": "⚡ 4-माह थोक खरीद",
  "Marketplace": "फसल मार्केटप्लेस",
  "My Orders": "मेरे ऑर्डर",
  "Track Delivery": "डिलीवरी ट्रैक करें",
  "Payments": "भुगतान व एस्क्रो",
  "Hub Command Dashboard": "हब कमांड डैशबोर्ड",
  "Incoming Harvest Intake": "आवक फसल (धर्मकांटा)",
  "QC Lab & Grading": "NABL लैब व ग्रेडिंग",
  "Cold Storage & Silos": "साइलो व कोल्ड स्टोरेज",
  "Fleet Dispatch Manager": "फ्लीट डिस्पैच व रवानगी",
  "Fleet & Drivers Registry": "वाहन व चालक रजिस्ट्री",
  "All-India FCI Centres": "अखिल भारतीय FCI केंद्र",
  "⚡ Bulk Hub Pooling": "⚡ थोक मांग एकत्रीकरण",
  "Hub Profile": "हब प्रोफ़ाइल",
  "Users & Stakeholders": "उपयोगकर्ता व हितधारक",
  "All Listings": "सभी फसल लिस्टिंग",
  "500T+ Bulk Demand Pools": "500T+ थोक मांग पूल",
  "Orders Monitoring": "ऑर्डर निगरानी",
  "Collection Hubs": "कलेक्शन हब केंद्र",
  "Fleet & Vehicles": "फ्लीट व वाहन",
  "Escrow & Txns": "एस्क्रो एवं लेनदेन",
  "Database & Audit Logs": "डेटाबेस व ऑडिट लॉग",
  "Supply Analytics": "आपूर्ति विश्लेषण",
  "Admin Profile & KYC": "एडमिन प्रोफ़ाइल",
  "Lock Admin Console": "एडमिन कंसोल लॉक करें",
  "Lock Console": "🔒 कंसोल लॉक करें",
  "🔒 Lock Console": "🔒 कंसोल लॉक करें",
  "⚡ Switch Role": "⚡ भूमिका बदलें",
  "Switch Role / Gateway": "भूमिका बदलें / गेटवे",
  "Farmer Portal Bay": "किसान पोर्टल",
  "Buyer Portal Bay": "खरीदार पोर्टल",
  "Collection Hub Bay": "कलेक्शन हब केंद्र",

  // Bulk Demands & Mega Pools
  "Direct Bulk Demands & Pooled Orders (थोक मांग पूल)": "प्रत्यक्ष थोक मांग एवं पूल्ड ऑर्डर",
  "Direct Bulk Demands & Pooled Orders": "प्रत्यक्ष थोक मांग एवं पूल्ड ऑर्डर",
  "Institutional buyers placing 500T+ advance orders with 100% pre-funded Escrow. Supply produce directly to earn guaranteed payouts.": "संस्थागत खरीदारों द्वारा 100% पूर्व-वित्तपोषित एस्क्रो के साथ 500T+ अग्रिम ऑर्डर। गारंटीशुदा भुगतान पाने के लिए सीधे फसल की आपूर्ति करें।",
  "View All Bulk Orders": "सभी थोक ऑर्डर देखें",
  "No Bulk Demand Pools at this moment": "इस समय कोई थोक मांग पूल नहीं है",
  "When institutional buyers (millers, exporters, processors) place large pooled demand contracts, they will appear here live for direct farmer acceptance and supply allocation.": "जब संस्थागत खरीदार (मिलर्स, निर्यातक, प्रसंस्करणकर्ता) बड़े मांग अनुबंध रखेंगे, तो वे सीधे किसान स्वीकृति और आपूर्ति के लिए यहां लाइव दिखाई देंगे।",
  "Explore Bulk Pooling Bay": "थोक पूलिंग बे देखें",

  // Farmer Greetings & Profile
  "Namaste,": "नमस्ते,",
  "Namaste": "नमस्ते",
  "Verified Farmer": "सत्यापित किसान",
  "Guaranteed escrow payouts.": "गारंटीशुदा एस्क्रो भुगतान।",

  // Registration & Modal
  "Join Farm2Future as Farmer": "किसान के रूप में Farm2Future से जुड़ें",
  "Join Farm2Future as Buyer": "खरीदार के रूप में Farm2Future से जुड़ें",
  "Admin Enrollment": "सरकारी एडमिन नामांकन",
  "Hub Registration": "कलेक्शन हब पंजीकरण",
  "Farmer Sign In": "किसान लॉगिन",
  "Buyer Sign In": "खरीदार लॉगिन",
  "Hub Operator Sign In": "हब ऑपरेटर लॉगिन",
  "Reset Your Password": "अपना पासवर्ड रीसेट करें",
  "BUYER REGISTRATION": "खरीदार पंजीकरण",
  "FARMER REGISTRATION": "किसान पंजीकरण",
  "GOVT ADMIN ENROLLMENT": "सरकारी एडमिन नामांकन",
  "APMC HUB REGISTRATION": "एपीएमसी हब पंजीकरण",
  "BUYER SIGN IN": "खरीदार लॉगिन",
  "FARMER SIGN IN": "किसान लॉगिन",
  "GOVT ADMIN LOGIN": "सरकारी एडमिन लॉगिन",
  "APMC HUB OPERATOR LOGIN": "एपीएमसी हब ऑपरेटर लॉगिन",
  "PASSWORD RECOVERY": "पासवर्ड पुनर्प्राप्ति",
  "Register as a buyer to access farmgate contracts, NABL quality grading and secure trade escrow.": "खेत से सीधे अनुबंध, NABL गुणवत्ता ग्रेडिंग और सुरक्षित व्यापार एस्क्रो के लिए खरीदार के रूप में पंजीकरण करें।",
  "Register as a farmer to access pre-harvest contracts, NABL quality grading and guaranteed MSP.": "कटाई से पहले अग्रिम अनुबंध, NABL गुणवत्ता ग्रेडिंग और गारंटीशुदा भुगतान के लिए किसान के रूप में पंजीकरण करें।",
  "Official enrollment portal for authorized network staff & operators.": "अधिकृत नेटवर्क कर्मचारियों और ऑपरेटरों के लिए आधिकारिक नामांकन पोर्टल।",
  "Authorized platform administration login terminal.": "अधिकृत प्लेटफ़ॉर्म प्रशासन सुरक्षा कंसोल।",
  "Authorized APMC depot & weighbridge terminal.": "अधिकृत एपीएमसी डिपो और धर्मकांटा टर्मिनल।",
  "Verify your registered phone or Aadhaar to securely set a new account password.": "नया खाता पासवर्ड सुरक्षित रूप से सेट करने के लिए अपना पंजीकृत फ़ोन या आधार सत्यापित करें।",
  "Govt Administration Security Console": "सरकारी प्रशासन सुरक्षा कंसोल",
  "OFFICIAL": "आधिकारिक",
  "STAFF ONLY": "केवल स्टाफ",
  "Step 1: Basic Details": "चरण 1: बुनियादी विवरण",
  "Step 2: Verification": "चरण 2: सत्यापन",
  "Step 3: Farm / Business": "चरण 3: खेत / व्यवसाय",
  "Step 4: Confirm": "चरण 4: पुष्टि",
  "Basic Details": "बुनियादी विवरण",
  "Identity & Password": "पहचान एवं पासवर्ड",
  "Farm Details": "खेत का विवरण",
  "Business Details": "व्यवसाय विवरण",
  "Review & Confirm": "समीक्षा एवं पुष्टि",
  "Mobile Number": "मोबाइल नंबर",
  "Enter your 10-digit mobile number": "अपना 10-अंकों का मोबाइल नंबर दर्ज करें",
  "Aadhaar Number": "आधार नंबर",
  "Company Name": "कंपनी का नाम",
  "Land Size (Acres)": "भूमि का आकार (एकड़)",

  // Common UI Actions & Labels
  "Confirm": "पुष्टि करें",
  "Cancel": "रद्द करें",
  "Save": "सुरक्षित करें",
  "Save Changes": "बदलाव सुरक्षित करें",
  "Submit": "जमा करें",
  "Edit": "संपादित करें",
  "Delete": "हटाएं",
  "Update": "अपडेट करें",
  "Close": "बंद करें",
  "Next": "आगे बढ़ें",
  "Previous": "पिछला",
  "Actions": "कार्यवाही",
  "Status": "स्थिति",
  "Details": "विवरण",
  "Price": "मूल्य",
  "Quantity": "मात्रा",
  "Total": "कुल",
  "Date": "तिथि",
  "Time": "समय",
  "Location": "स्थान",
  "Rating": "रेटिंग",
  "Search": "खोजें",
  "Filter": "फ़िल्टर",
  "Reset": "रीसेट",
  "Apply": "लागू करें",
  "Download": "डाउनलोड",
  "Upload": "अपलोड",
  "Yes": "हाँ",
  "No": "नहीं",
  "Loading...": "लोड हो रहा है...",
  "Success!": "सफल!",
  "Error!": "त्रुटि!",
  "Warning!": "चेतावनी!",

  // StatCard & Trends
  "vs last 30 days": "पिछले 30 दिनों में",
  "vs last 7 days": "पिछले 7 दिनों में",
  "vs yesterday": "कल की तुलना में",

  // Farmer Dashboard & Lots
  "Open for Farmers": "किसानों के लिए खुला",
  "Quota Full": "कोटा पूर्ण",
  "Price Guaranteed": "गारंटीशुदा भाव",
  "Target Volume": "लक्ष्य मात्रा",
  "Committed:": "स्वीकृत मात्रा:",
  "+100% Escrow Protected": "+100% एस्क्रो सुरक्षा",
  "Net Payout": "शुद्ध भुगतान",
  "My Active Lots": "मेरे सक्रिय लॉट",
  "No produce listed yet": "अभी कोई फसल लिस्ट नहीं है",
  "List your harvested crops to start receiving direct buyer orders.": "सीधे खरीदार ऑर्डर प्राप्त करने के लिए अपनी फसल लिस्ट करें।",
  "List Another Crop": "एक और फसल लिस्ट करें",
  "Orders Received & Dispatches": "प्राप्त ऑर्डर एवं रवानगी",
  "All Orders": "सभी ऑर्डर",
  "No orders received yet": "अभी कोई ऑर्डर प्राप्त नहीं हुआ",
  "Orders placed by verified buyers will appear here with live tracking.": "सत्यापित खरीदारों द्वारा दिए गए ऑर्डर लाइव ट्रैकिंग के साथ यहां दिखाई देंगे।",
  "NEW ORDER RECEIVED": "नया ऑर्डर प्राप्त हुआ",
  "ORDER PLACED": "ऑर्डर दर्ज हुआ",
  "COLLECTED AT HUB": "हब पर एकत्रित",
  "QUALITY TESTED": "गुणवत्ता परीक्षित",
  "IN TRANSIT": "रास्ते में (परिवहन)",
  "DELIVERED": "सफलतापूर्वक डिलीवर",

  // Buyer Dashboard & Procurements
  "State-Wide Access": "राज्यव्यापी खरीद अधिकृत",
  "+ Create Bulk Demand": "+ थोक मांग दर्ज करें",
  "Direct Lots": "सीधे किसान लॉट",
  "Fleet Telemetry": "वाहन टेलीमेट्री",
  "Mandi Rates": "मंडी भाव विश्लेषण",
  "Active Procurements": "सक्रिय खरीद",
  "in cold transit fleet": "वाहन शीत परिवहन में",
  "Locked in Escrow": "एस्क्रो सुरक्षित राशि",
  "Released upon physical intake": "हब पर जांच व रसीद के बाद जारी",
  "Total Procured (FY26)": "कुल खरीद (FY26)",
  "Zero middleman commission": "0% बिचौलिया कमीशन",
  "Completed Deliveries": "सफल डिलीवरी",
  "100% On-Time SLA Record": "100% समय पर डिलीवरी रिकॉर्ड",
  "⚡ 4-Month Advance Corporate Procurement": "⚡ 4-माह अग्रिम कॉर्पोरेट खरीद",
  "● 100% Buyer-Paid Transport Escrow": "● 100% खरीदार द्वारा भुगतान किया गया परिवहन एस्क्रो",
  "Active 4-Month Advance Corporate Demands (50T – 500T+)": "सक्रिय 4-माह अग्रिम कॉर्पोरेट मांग (50T – 500T+)",
  "Contract farmers 120 days prior to harvest. Guaranteed crop volume, pre-set purchase prices, and automated AI truck dispatch to collection hubs.": "कटाई से 120 दिन पहले किसानों से सीधा अनुबंध करें। गारंटीशुदा फसल मात्रा, पूर्व-निर्धारित खरीद मूल्य और कलेक्शन हब के लिए स्वचालित एआई ट्रक डिस्पैच।",
  "Launch New 4-Mo Demand": "नई 4-माह मांग शुरू करें",
  "No active bulk pools at the moment": "वर्तमान में कोई सक्रिय थोक पूल नहीं है",
  "You can launch a new 4-month corporate demand for bulk agricultural commodities (50T – 500T+).": "आप थोक कृषि उपज (50T – 500T+) के लिए एक नई 4-माह की कॉर्पोरेट मांग शुरू कर सकते हैं।",
  "Direct Farmgate Crop Categories": "सीधी कृषि उपज श्रेणियां",
  "Instant access to verified farm lots sorted by harvest date": "कटाई की तारीख और गुणवत्ता के अनुसार सत्यापित कृषि लॉट तक सीधी पहुंच",
  "Lots Ready": "लॉट तैयार",
  "Active Consignments in Transit & QC": "सक्रिय खेप (परिवहन व गुणवत्ता जांच)",
  "No active consignments": "वर्तमान में कोई सक्रिय खेप नहीं है",
  "Explore the marketplace to procure verified farm produce.": "सत्यापित कृषि उपज खरीदने के लिए मार्केटप्लेस देखें।",
  "Browse Farmgate Lots": "कृषि लॉट ब्राउज़ करें",
  "Live Sensor Feed": "लाइव सेंसर टेलीमेट्री",
  "Chamber Temp": "चैंबर तापमान",
  "GPS Speed": "जीपीएस गति",
  "Open Full Interactive Pipeline": "पूर्ण लाइव पाइपलाइन खोलें",
  "Featured Farmgate Harvests Available Today": "आज बिक्री के लिए उपलब्ध मुख्य कृषि फसलें",
  "100% Quality Inspected & Cured at Collection Centers": "कलेक्शन सेंटरों पर 100% गुणवत्ता-परीक्षित और प्रमाणित",
  "Browse All Crops →": "सभी फसलें देखें →",
  "No produce lots available in marketplace currently": "मार्केटप्लेस में अभी कोई लॉट उपलब्ध नहीं है",
  "Newly listed harvests by registered farmers will automatically appear here.": "पंजीकृत किसानों द्वारा नई लिस्टेड फसलें यहाँ स्वतः दिखाई देंगी।",
  "Buy Lot": "लॉट खरीदें",

  // Collection Hub
  "FCI Modern Steel Silo": "एफसीआई आधुनिक स्टील साइलो",
  "Railhead Siding": "रेलवे साइडिंग कनेक्टिविटी",
  "Weighbridge": "धर्मकांटा",
  "Incharge:": "प्रभारी:",
  "Hours:": "कार्य समय:",
  "+ Direct Farmer Intake": "+ धर्मकांटा आवक पर्ची",
  "Direct Farmer Intake": "धर्मकांटा आवक पर्ची",
  "Switch FCI Depot (54 Hubs)": "डिपो बदलें (54 केंद्र)",
  "Current Occupancy": "कुल भंडारण अधिभोग",
  "Active Batches": "सक्रिय लॉट",
  "Incoming In Queue": "आवक फसल कतार",
  "Awaiting Hub Weighing & QA": "धर्मकांटा व लैब जांच हेतु",
  "Ready For Dispatch": "प्रेषण हेतु तैयार",
  "QC Passed & Graded": "QC पास व ग्रेडिंग पूर्ण",
  "Cold Storage Temp": "कोल्ड स्टोरेज तापमान",
  "Humidity": "आर्द्रता",
  "Ready for Loading": "लोडिंग हेतु उपलब्ध",
  "Hub Command Overview": "हब कमांड सेंटर",
  "Incoming Produce Intake": "आवक फसल कतार",
  "Storage & Silos Status": "भंडारण व साइलो स्थिति",
  "Fleet & Vehicle Registry": "लॉजिस्टिक्स वाहन बेड़ा",
  "All-India FCI Centres (54 Hubs)": "अखिल भारतीय FCI केंद्र (54 हब)",

  // Admin Dashboard & Console
  "Platform Administration & Governance": "प्लेटफ़ॉर्म प्रशासन एवं नियंत्रण",
  "Central Command": "केंद्रीय नियंत्रण कक्ष",
  "Real-time database state, user registry, vehicle fleet dispatch, and audit trail records.": "लाइव डेटाबेस स्थिति, उपयोगकर्ता रजिस्ट्री, वाहन बेड़ा प्रेषण और ऑडिट ट्रेल रिकॉर्ड।",
  "In Escrow Vault": "एस्क्रो वॉल्ट में सुरक्षित",
  "Government Security & Master Access Control": "सरकारी सुरक्षा एवं मुख्य अभिगम नियंत्रण",
  "Key Protected": "सुरक्षा पासकी संरक्षित",
  "Master Passkey secures national administration, database synchronization, and broadcast feeds.": "मास्टर पासकी राष्ट्रीय प्रशासन, डेटाबेस सिंक्रनाइज़ेशन और प्रसारण फ़ीड को सुरक्षित करती है।",
  "Immediately lock the admin console and switch to safe view": "एडमिन कंसोल को तुरंत लॉक करें और सुरक्षित दृश्य पर जाएं",
  "Current Master Key": "वर्तमान मास्टर पासकी",
  "Enter current passkey": "वर्तमान पासकी दर्ज करें",
  "New Master Security Key (Min 6 chars)": "नई मास्टर सुरक्षा पासकी (न्यूनतम 6 अक्षर)",
  "Enter new secret key": "नई गुप्त कुंजी दर्ज करें",
  "Update Master Passkey": "मास्टर पासकी अपडेट करें",
  "Persistent Database Storage & Audit Trail": "स्थायी डेटाबेस भंडारण और ऑडिट ट्रेल",
  "Auto-Sync Active": "स्वचालित सिंक सक्रिय",
  "Export DB Backup (.json)": "डेटाबेस बैकअप निर्यात करें (.json)",
  "Audit History": "ऑडिट इतिहास",
  "Saved in DB": "डेटाबेस में सुरक्षित",
  "Consignments": "सक्रिय खेप",
  "Fleet Vehicles": "फ्लीट वाहन",
  "Produce Lots": "फसल लॉट",
  "Registered Users": "पंजीकृत उपयोगकर्ता",
  "Verified Farmers": "सत्यापित किसान",
  "100% Aadhaar & Land Record KYC": "100% आधार व भूमि रिकॉर्ड सत्यापन",
  "Verified Buyers": "सत्यापित खरीदार",
  "Retailers, Exporters & Processors": "खुदरा विक्रेता, निर्यातक व प्रसंस्करणकर्ता",
  "GPS Linked Cold Vans": "जीपीएस युक्त शीत वाहन",
  "Zero SLA/Cold Chain Breaches": "शून्य SLA/कोल्ड चेन उल्लंघन",
  "National Transport Fleet & State Vehicle Asset Registry": "राष्ट्रीय परिवहन बेड़ा एवं राज्य वाहन रजिस्ट्री",
  "24+ States": "24+ राज्य",
  "Pan-India logistics fleet, cold chain temperature logs, driver VAHAN compliance, and freight rate transparency": "अखिल भारतीय लॉजिस्टिक्स बेड़ा, कोल्ड चेन तापमान लॉग, चालक वाहन अनुपालन और पारदर्शी भाड़ा दरें",
  "State Transport Directory": "राज्य परिवहन डायरेक्टरी",
  "Search fleet by plate number, driver, model, state, or transporter...": "नंबर प्लेट, चालक, मॉडल, राज्य या ट्रांसपोर्टर द्वारा बेड़ा खोजें...",

  // Marketplace & Bulk Demands
  "Farmgate Produce Marketplace": "खेत से सीधी फसल खरीद बाज़ार",
  "Procure farm-fresh harvest directly from verified farmers with transparent grading and escrow.": "सत्यापित किसानों से पारदर्शी ग्रेडिंग और एस्क्रो के साथ सीधे ताज़ा फसल खरीदें।",
  "Active Lots Available": "सक्रिय फसल लॉट उपलब्ध",
  "Bulk Pools Open": "थोक मांग पूल खुले हैं",
  "4-Month Advance Contracts": "4-माह अग्रिम अनुबंध",
  "Open Bulk Pooling Bay": "थोक पूलिंग बे खोलें",
  "4-Month Advance Pre-Harvest Bulk Procurement Bay": "4-माह अग्रिम फसल कटाई पूर्व थोक खरीद केंद्र",
  "Launch 4-Month Advance Bulk Demand": "नई 4-माह अग्रिम थोक मांग शुरू करें",
  "Create New Bulk Demand": "नई थोक मांग दर्ज करें",
  "Supply Produce & Commit Quota": "फसल की आपूर्ति करें और कोटा सुरक्षित करें",
  "Procurement Price": "खरीद मूल्य",
  "Estimated Total Value": "अनुमानित कुल मूल्य",
  "Farmer Supply Commitment": "किसान आपूर्ति प्रतिबद्धता",
  "Escrow Protected Payout": "एस्क्रो संरक्षित भुगतान",

  // Tracking Pipeline
  "No Active Consignments to Track": "ट्रैक करने के लिए कोई सक्रिय खेप नहीं है",
  "When buyers place orders on your produce lots, live consignment tracking will appear here.": "जब खरीदार आपकी फसल के लॉट पर ऑर्डर देंगे, तो लाइव खेप ट्रैकिंग यहाँ दिखाई देगी।",
  "Place an order on the marketplace to watch the transparent supply chain pipeline.": "पारदर्शी आपूर्ति श्रृंखला पाइपलाइन देखने के लिए मार्केटप्लेस पर ऑर्डर दें।",
  "Farmer Farmgate": "किसान का खेत",
  "Harvest & Escrow Lock": "फसल व एस्क्रो सुरक्षित",
  "Collection Centre": "कलेक्शन हब",
  "Weighbridge & Sorting": "धर्मकांटा व छंटाई",
  "QC Lab Certified": "NABL लैब प्रमाणित",
  "Grade & Moisture Tag": "ग्रेड व नमी टैग",
  "AI Cold Fleet": "एआई कोल्ड फ्लीट",
  "GPS & Telemetry Active": "लाइव जीपीएस सक्रिय",
  "Buyer Intake": "खरीदार डिपो",
  "Escrow Settlement": "एस्क्रो भुगतान रिलीज",

  // Zones & Geography
  "North Zone": "उत्तर क्षेत्र",
  "West & Central Zone": "पश्चिम एवं मध्य क्षेत्र",
  "South Zone": "दक्षिण क्षेत्र",
  "East Zone": "पूर्वी क्षेत्र",
  "North-East Zone": "उत्तर-पूर्वी क्षेत्र",
  "All States": "सभी राज्य"
};

// 2. 🌾 Agricultural Commodities & Categories Glossary
export const COMMODITY_GLOSSARY: Record<string, string> = {
  // Categories
  "Cereals & Grains": "अनाज और खाद्यान्न",
  "Vegetables": "सब्जियां",
  "Fruits": "फल",
  "Pulses": "दालें / दलहन",
  "Oilseeds": "तिलहन",
  "Spices": "मसाले",
  "Commercial": "व्यावसायिक फसलें",
  "Medicinal": "औषधीय फसलें",

  // Specific Crops
  "Wheat": "गेहूं",
  "Sharbati Wheat": "शरबती गेहूं",
  "Lokwan Wheat": "लोकवन गेहूं",
  "PBW Wheat": "पीबीडब्ल्यू गेहूं",
  "Paddy": "धान",
  "Rice": "चावल",
  "Basmati Rice": "बासमती चावल",
  "1121 Basmati": "1121 बासमती",
  "PR-126 Paddy": "पीआर-126 धान",
  "Common Paddy": "साधारण धान",
  "Maize": "मक्का",
  "Yellow Maize": "पीला मक्का",
  "Corn": "मक्का",
  "Red Onion": "लाल प्याज़",
  "Onion": "प्याज़",
  "Tomato": "टमाटर",
  "Hybrid Tomato": "हाइब्रिड टमाटर",
  "Potato": "आलू",
  "Pukhraj Potato": "पुखराज आलू",
  "Mustard": "सरसों",
  "Yellow Mustard": "पीली सरसों",
  "Soybean": "सोयाबीन",
  "Yellow Soybean": "पीला सोयाबीन",
  "Cotton": "कपास",
  "Narma Cotton": "नरमा कपास",
  "Garlic": "लहसुन",
  "Ooty Garlic": "ऊटी लहसुन",
  "Turmeric": "हल्दी",
  "Sangli Turmeric": "सांगली हल्दी",
  "Ginger": "अदरक",
  "Chilli": "मिर्च",
  "Green Chilli": "हरी मिर्च",
  "Gram": "चना",
  "Desi Chana": "देसी चना",
  "Chickpeas": "काबुली चना",
  "Moong": "मूंग",
  "Moong Dal": "मूंग दाल",
  "Urad": "उड़द",
  "Urad Dal": "उड़द दाल",
  "Arhar / Toor": "अरहर / तूर दाल",
  "Barley": "जौ",
  "Bajra": "बाजरा",
  "Pearl Millet": "बाजरा",
  "Jowar": "ज्वार",
  "Sorghum": "ज्वार",
  "Groundnut": "मूंगफली",
  "Peanut": "मूंगफली",
  "Cumin": "जीरा",
  "Jeera": "जीरा",
  "Fennel": "सौंफ",
  "Coriander": "धनिया",
  "Fenugreek": "मेथी",
  "Methi": "मेथी",
  "Sugarcane": "गन्ना",
  "Jaggery": "गुड़",
  "Desi Gur": "देसी गुड़",
  "Isabgol": "इसबगोल",
  "Shahi Litchi": "शाही लीची",
  "Orange": "संतरा",
  "Nagpur Orange": "नागपुर संतरा",
  "Banana": "केला",
  "Jalgaon Banana": "जलगांव केला",
  "Apple": "सेब",
  "Mango": "आम",
  "Alphonso": "हापुस आम"
};

// 3. 🔤 Common Single Words & Short Units
export const WORD_GLOSSARY: Record<string, string> = {
  // Units
  "quintals": "क्विंटल",
  "quintal": "क्विंटल",
  "qtl": "क्विंटल",
  "tonnes": "टन",
  "tonne": "टन",
  "tons": "टन",
  "ton": "टन",
  "acres": "एकड़",
  "acre": "एकड़",
  "kilograms": "किलोग्राम",
  "kilogram": "किलोग्राम",
  "kg": "किग्रा",
  "rupees": "रुपये",
  "today": "आज",
  "yesterday": "कल",
  "tomorrow": "कल",
  "days": "दिन",
  "day": "दिन",
  "hours": "घंटे",
  "hour": "घंटा",
  "minutes": "मिनट",
  "minute": "मिनट",
  "seconds": "सेकंड",
  "second": "सेकंड",

  // Roles & entities
  "farmer": "किसान",
  "farmers": "किसान",
  "buyer": "खरीदार",
  "buyers": "खरीदार",
  "admin": "व्यवस्थापक",
  "driver": "चालक",
  "hub": "हब",
  "godown": "गोदाम",
  "mandi": "मंडी",
  "mandis": "मंडियां",
  "market": "बाज़ार",
  "state": "राज्य",
  "states": "राज्य",
  "district": "ज़िला",
  "districts": "ज़िले",
  "village": "गाँव",
  "city": "शहर",
  "rate": "भाव",
  "rates": "दरें",
  "price": "कीमत",
  "prices": "कीमतें",
  "crop": "फसल",
  "crops": "फसलें",
  "lot": "लॉट",
  "lots": "लॉट",
  "harvest": "उपज",
  "volume": "मात्रा",
  "payout": "भुगतान",
  "payouts": "भुगतान",
  "earning": "कमाई",
  "earnings": "कमाई",
  "escrow": "एस्क्रो",
  "order": "ऑर्डर",
  "orders": "ऑर्डर",
  "vehicle": "वाहन",
  "vehicles": "वाहन",
  "truck": "ट्रक",
  "capacity": "क्षमता",
  "speed": "गति",
  "live": "लाइव",
  "active": "सक्रिय",
  "completed": "पूर्ण",
  "pending": "लंबित",
  "verified": "सत्यापित",
  "rejected": "अस्वीकृत",
  "approved": "स्वीकृत",
  "passed": "उत्तीर्ण",
  "failed": "विफल",
  "demand": "मांग",
  "supply": "आपूर्ति",
  "high": "उच्च",
  "low": "निम्न",
  "medium": "मध्यम",
  "gain": "लाभ",
  "loss": "हानि",
  "profit": "लाभ",
  "grade": "ग्रेड",
  "quality": "गुणवत्ता",
  "score": "स्कोर",
  "safe": "सुरक्षित",
  "secure": "सुरक्षित",
  "guaranteed": "गारंटीशुदा",
  "instant": "त्वरित",
  "direct": "प्रत्यक्ष",
  "hybrid": "हाइब्रिड",
  "organic": "जैविक",
  "certified": "प्रमाणित",
  "open": "खुला",
  "closed": "बंद",
  "overview": "अवलोकन",
  "dashboard": "डैशबोर्ड",
  "marketplace": "मार्केटप्लेस",
  "inventory": "भंडार",
  "settings": "सेटिंग्स",
  "profile": "प्रोफ़ाइल",
  "password": "पासवर्ड",
  "phone": "फ़ोन",
  "mobile": "मोबाइल",
  "email": "ईमेल",
  "name": "नाम",
  "help": "मदद",
  "support": "सहायता",

  // Actions & Verbs
  "welcome": "स्वागत",
  "hello": "नमस्ते",
  "namaste": "नमस्ते",
  "add": "जोड़ें",
  "create": "बनाएं",
  "edit": "संपादित करें",
  "update": "अपडेट करें",
  "delete": "हटाएं",
  "remove": "हटाएं",
  "save": "सुरक्षित करें",
  "submit": "जमा करें",
  "cancel": "रद्द करें",
  "close": "बंद करें",
  "back": "वापस",
  "next": "आगे",
  "previous": "पिछला",
  "continue": "जारी रखें",
  "proceed": "आगे बढ़ें",
  "view": "देखें",
  "views": "दृश्य",
  "show": "दिखाएं",
  "hide": "छिपाएं",
  "track": "ट्रैक करें",
  "tracking": "ट्रैकिंग",
  "search": "खोजें",
  "filter": "फ़िल्टर",
  "filters": "फ़िल्टर",
  "reset": "रीसेट",
  "apply": "लागू करें",
  "select": "चुनें",
  "choose": "चुनें",
  "enter": "दर्ज करें",
  "upload": "अपलोड",
  "download": "डाउनलोड",
  "export": "निर्यात",
  "import": "आयात",
  "print": "प्रिंट",
  "share": "साझा करें",
  "copy": "कॉपी",
  "lock": "लॉक",
  "unlock": "अनलॉक",
  "verify": "सत्यापित करें",
  "inspect": "निरीक्षण करें",
  "dispatch": "रवाना करें",
  "deliver": "डिलीवर करें",
  "receive": "प्राप्त करें",
  "received": "प्राप्त",
  "pay": "भुगतान करें",
  "paid": "भुगतान संपन्न",
  "buy": "खरीदें",
  "sell": "बेचें",
  "seller": "विक्रेता",
  "sellers": "विक्रेता",
  "list": "लिस्ट करें",
  "listing": "लिस्टिंग",
  "listings": "लिस्टिंग",

  // Business & Commerce
  "bulk": "थोक",
  "retail": "खुदरा",
  "wholesale": "थोक",
  "pool": "पूल",
  "pooling": "पूलिंग",
  "pools": "पूल",
  "procurement": "खरीद",
  "purchase": "खरीद",
  "contract": "अनुबंध",
  "contracts": "अनुबंध",
  "agreement": "समझौता",
  "invoice": "चालान",
  "bill": "बिल",
  "receipt": "रसीद",
  "fee": "शुल्क",
  "fees": "शुल्क",
  "charge": "शुल्क",
  "charges": "शुल्क",
  "tax": "कर",
  "taxes": "कर",
  "gst": "जीएसटी",
  "discount": "छूट",
  "total": "कुल",
  "subtotal": "उप-योग",
  "amount": "राशि",
  "balance": "शेष राशि",
  "deposit": "जमा",
  "withdrawal": "निकासी",
  "disbursement": "भुगतान",
  "disbursed": "जमा संपन्न",
  "settlement": "भुगतान निपटान",
  "settled": "निपटारा संपन्न",
  "refund": "धनवापसी",
  "refunded": "धनवापसी संपन्न",
  "revenue": "राजस्व",
  "return": "आय / लाभ",
  "cost": "लागत",
  "expenditure": "खर्च",

  // Roles & Workspaces
  "workspace": "कार्यक्षेत्र",
  "navigation": "नेविगेशन",
  "helpline": "हेल्पलाइन",
  "stakeholder": "हितधारक",
  "stakeholders": "हितधारक",
  "user": "उपयोगकर्ता",
  "users": "उपयोगकर्ता",
  "member": "सदस्य",
  "members": "सदस्य",
  "customer": "ग्राहक",
  "client": "ग्राहक",
  "merchant": "व्यापारी",
  "trader": "व्यापारी",
  "corporate": "कॉर्पोरेट",
  "retailer": "खुदरा विक्रेता",
  "retailers": "खुदरा विक्रेता",
  "exporter": "निर्यातक",
  "exporters": "निर्यातक",
  "processor": "प्रसंस्करणकर्ता",
  "processors": "प्रसंस्करणकर्ता",
  "miller": "मिलर",
  "millers": "मिलर",
  "inspector": "निरीक्षक",
  "officer": "अधिकारी",
  "operator": "ऑपरेटर",
  "transporter": "परिवहनकर्ता",
  "transporters": "परिवहनकर्ता",

  // Logistics & Warehousing
  "fleet": "वाहन बेड़ा",
  "route": "मार्ग",
  "routes": "मार्ग",
  "trip": "यात्रा",
  "trips": "यात्राएं",
  "terminal": "टर्मिनल",
  "depot": "डिपो",
  "bay": "केंद्र / बे",
  "dock": "डॉक",
  "weighbridge": "धर्मकांटा",
  "weighment": "वजन माप",
  "intake": "आवक",
  "arrival": "आवक",
  "arrivals": "आवक",
  "departure": "रवानगी",
  "transit": "परिवहन",
  "delivery": "वितरण",
  "pickup": "पिकअप",
  "destination": "गंतव्य",
  "origin": "मूल स्थान",
  "silo": "साइलो",
  "silos": "साइलो",
  "storage": "भंडारण",
  "cold": "कोल्ड",
  "refrigerated": "प्रशीतित (कोल्ड)",

  // Quality & Testing
  "moisture": "नमी",
  "foreign": "विदेशी",
  "matter": "तत्व",
  "admixture": "अपमिश्रण",
  "damaged": "क्षतिग्रस्त",
  "discolored": "बदरंग",
  "grain": "दाना",
  "grains": "दाने",
  "size": "आकार",
  "uniformity": "एकरूपता",
  "shelf": "शेल्फ",
  "life": "लाइफ",
  "lab": "प्रयोगशाला",
  "laboratory": "प्रयोगशाला",
  "testing": "परीक्षण",
  "test": "परीक्षण",
  "inspection": "निरीक्षण",
  "parameter": "मानक",
  "parameters": "मानक",
  "standard": "मानक",
  "standards": "मानक",
  "certificate": "प्रमाणपत्र",
  "benchmark": "बेंचमार्क",
  "modal": "मॉडल",
  "spot": "हाज़िर",
  "trend": "रुझान",
  "range": "दायरा",

  // Status & Flags
  "official": "आधिकारिक",
  "staff": "स्टाफ",
  "only": "केवल",
  "yes": "हाँ",
  "no": "नहीं",
  "ok": "ठीक",
  "all": "सभी",
  "new": "नया",
  "success": "सफल",
  "error": "त्रुटि",
  "warning": "चेतावनी",
  "info": "सूचना",
  "stronger": "सशक्त",
  "fairer": "पारदर्शी",
  "cleaner": "स्वच्छ",
  "planet": "पर्यावरण",
  "brighter": "उज्ज्वल",
  "future": "भविष्य",
  "futures": "भविष्य",
  "required": "आवश्यक",
  "optional": "वैकल्पिक",
  "recommended": "अनुशंसित",
  "target": "लक्ष्य",
  "current": "वर्तमान",
  "unread": "अपठित",
  "read": "पढ़ा हुआ",
  "from": "से",
  "to": "तक",
  "at": "पर",
  "in": "में",
  "on": "पर",
  "for": "के लिए",
  "with": "के साथ",
  "and": "और",
  "or": "या",
  "by": "द्वारा",
  "ready": "तैयार",
  "available": "उपलब्ध",
  "full": "पूर्ण",
  "committed": "स्वीकृत",
  "remaining": "शेष",
  "estimated": "अनुमानित",
  "actual": "वास्तविक",
  "first": "पहला",
  "last": "अंतिम",
  "variety": "किस्म",
  "category": "श्रेणी",
  "categories": "श्रेणियां",
  "batch": "बैच",
  "batches": "बैच",
  "unit": "इकाई",
  "units": "इकाइयां",
  "centre": "केंद्र",
  "center": "केंद्र",
  "centres": "केंद्र",
  "centers": "केंद्र",
  "temperature": "तापमान",
  "humidity": "आर्द्रता",
  "chamber": "चैंबर",
  "distance": "दूरी",
  "address": "पता",
  "passkey": "पासकी",
  "security": "सुरक्षा",
  "key": "कुंजी",
  "unverified": "असत्यापित",
  "spend": "व्यय",
  "slip": "पर्ची",
  "report": "रिपोर्ट",
  "audit": "ऑडिट",
  "history": "इतिहास",
  "logs": "लॉग",
  "database": "डेटाबेस",
  "backup": "बैकअप",
  "sync": "सिंक",
  "telemetry": "टेलीमेट्री",
  "sensor": "सेंसर",
  "sensors": "सेंसर",
  "gps": "जीपीएस",
  "realtime": "रीयल-टाइम",
  "conventional": "पारंपरिक",
  "fresh": "ताज़ा",
  "consignments": "खेप",
  "consignment": "खेप",
  "placed": "दर्ज",
  "collected": "एकत्रित",
  "tested": "परीक्षित",
  "cancelled": "रद्द",
  "released": "जारी"
};

// Pre-compiled list of phrases sorted from longest string length to shortest
const SORTED_PHRASES: [string, string][] = [
  ...Object.entries(MASTER_PHRASES),
  ...Object.entries(COMMODITY_GLOSSARY),
  ...Object.entries(WORD_GLOSSARY)
].sort((a, b) => b[0].length - a[0].length);

// 4. 🔄 Reverse Dictionaries for High-Precision Hindi -> English Restoration
export const REVERSE_MASTER_PHRASES: Record<string, string> = {};
for (const [en, hi] of Object.entries(MASTER_PHRASES)) {
  if (!REVERSE_MASTER_PHRASES[hi]) {
    REVERSE_MASTER_PHRASES[hi] = en;
  }
}

export const REVERSE_COMMODITY_GLOSSARY: Record<string, string> = {};
for (const [en, hi] of Object.entries(COMMODITY_GLOSSARY)) {
  if (!REVERSE_COMMODITY_GLOSSARY[hi]) {
    REVERSE_COMMODITY_GLOSSARY[hi] = en;
  }
}

export const REVERSE_WORD_GLOSSARY: Record<string, string> = {
  "क्विंटल": "Quintal",
  "टन": "Tonnes",
  "एकड़": "Acres",
  "किलोग्राम": "kg",
  "किग्रा": "kg",
  "रुपये": "₹",
  "आज": "Today",
  "दिन": "Days",
  "घंटे": "Hours",
  "घंटा": "Hour",
  "मिनट": "Minutes",
  "सेकंड": "Seconds",
  "किसान": "Farmer",
  "खरीदार": "Buyer",
  "व्यवस्थापक": "Admin",
  "चालक": "Driver",
  "हब": "Hub",
  "गोदाम": "Warehouse",
  "मंडी": "Mandi",
  "मंडियां": "Mandis",
  "बाज़ार": "Market",
  "राज्य": "State",
  "ज़िला": "District",
  "ज़िले": "Districts",
  "गाँव": "Village",
  "शहर": "City",
  "भाव": "Rate",
  "दरें": "Rates",
  "कीमत": "Price",
  "कीमतें": "Prices",
  "फसल": "Crop",
  "फसलें": "Crops",
  "लॉट": "Lot",
  "उपज": "Produce",
  "मात्रा": "Quantity",
  "भुगतान": "Payout",
  "कमाई": "Earnings",
  "एस्क्रो": "Escrow",
  "ऑर्डर": "Order",
  "वाहन": "Vehicle",
  "ट्रक": "Truck",
  "क्षमता": "Capacity",
  "गति": "Speed",
  "लाइव": "Live",
  "सक्रिय": "Active",
  "पूर्ण": "Completed",
  "लंबित": "Pending",
  "सत्यापित": "Verified",
  "अस्वीकृत": "Rejected",
  "स्वीकृत": "Approved",
  "उत्तीर्ण": "Passed",
  "विफल": "Failed",
  "मांग": "Demand",
  "आपूर्ति": "Supply",
  "उच्च": "High",
  "निम्न": "Low",
  "मध्यम": "Medium",
  "लाभ": "Gain",
  "हानि": "Loss",
  "ग्रेड": "Grade",
  "गुणवत्ता": "Quality",
  "स्कोर": "Score",
  "सुरक्षित": "Secure",
  "गारंटीशुदा": "Guaranteed",
  "त्वरित": "Instant",
  "प्रत्यक्ष": "Direct",
  "हाइब्रिड": "Hybrid",
  "जैविक": "Organic",
  "प्रमाणित": "Certified",
  "खुला": "Open",
  "बंद": "Closed",
  "अवलोकन": "Overview",
  "डैशबोर्ड": "Dashboard",
  "मार्केटप्लेस": "Marketplace",
  "भंडार": "Inventory",
  "सेटिंग्स": "Settings",
  "प्रोफ़ाइल": "Profile",
  "पासवर्ड": "Password",
  "फ़ोन": "Phone",
  "मोबाइल": "Mobile",
  "ईमेल": "Email",
  "नाम": "Name",
  "मदद": "Help",
  "सहायता": "Support"
};

for (const [en, hi] of Object.entries(WORD_GLOSSARY)) {
  if (!REVERSE_WORD_GLOSSARY[hi]) {
    REVERSE_WORD_GLOSSARY[hi] = en.charAt(0).toUpperCase() + en.slice(1);
  }
}

// Additional specific UI phrases to guarantee exact restoration
const EXTRA_REVERSE_PHRASES: [string, string][] = [
  ["भारतीय कृषि का स्मार्ट डिजिटल नेटवर्क", "Connecting Indian Agriculture with Direct Markets & Guaranteed Escrow"],
  ["भारतीय कृषि का", "Connecting Indian Agriculture with"],
  ["स्मार्ट डिजिटल नेटवर्क", "Direct Markets & Guaranteed Escrow"],
  ["गारंटीशुदा एस्क्रो", "Guaranteed Escrow"],
  ["प्रत्यक्ष बाज़ार", "Direct Markets"],
  ["अंग्रेज़ी में बदलें", "Switch to English"],
  ["हिंदी में बदलें", "Switch to Hindi"],
  ["रोल बदलें / गेटवे", "Switch Role / Gateway"],
  ["रोल बदलें", "Switch Role"],
  ["वेलकम गेटवे", "Welcome Gateway"],
  ["कलेक्शन हब", "Collection Hub"],
  ["सुपर एडमिन", "Super Admin"],
  ["संस्थागत खरीदार", "Institutional Buyer"],
  ["किसान पोर्टल", "Farmer Portal"],
  ["खरीदार पोर्टल", "Buyer Portal"],
  ["हब पोर्टल", "Hub Portal"],
  ["लॉगिन", "Login"],
  ["साइन इन", "Sign In"],
  ["साइन अप", "Sign Up"],
  ["रजिस्टर करें", "Register"],
  ["लॉगआउट", "Logout"],
  ["वापस जाएँ", "Go Back"],
  ["वापस", "Back"],
  ["गेटवे", "Gateway"]
];

// Pre-compiled list of reverse phrases sorted from longest Hindi string to shortest
const SORTED_REVERSE_PHRASES: [string, string][] = [
  ...EXTRA_REVERSE_PHRASES,
  ...Object.entries(REVERSE_MASTER_PHRASES),
  ...Object.entries(REVERSE_COMMODITY_GLOSSARY),
  ...Object.entries(REVERSE_WORD_GLOSSARY)
].sort((a, b) => b[0].length - a[0].length);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replacePhrase(text: string, search: string, replacement: string): string {
  const startBound = /^\w/.test(search) ? '\\b' : '';
  const endBound = /\w$/.test(search) ? '\\b' : '';
  const regex = new RegExp(`${startBound}${escapeRegExp(search)}${endBound}`, 'gi');
  return text.replace(regex, replacement);
}

/**
 * 🔄 Translates any English text string into natural Hindi.
 * Preserves currency symbols, numbers, punctuation, and special characters.
 */
export function translateTextToHindi(input: string): string {
  if (!input || typeof input !== 'string') return input;

  const trimmed = input.trim();
  if (!trimmed || !/[a-zA-Z]/.test(trimmed)) {
    return input; // Pure numbers or symbols or already Hindi
  }

  // 1. Exact match in master dictionary
  if (MASTER_PHRASES[trimmed]) {
    return input.replace(trimmed, MASTER_PHRASES[trimmed]);
  }
  if (COMMODITY_GLOSSARY[trimmed]) {
    return input.replace(trimmed, COMMODITY_GLOSSARY[trimmed]);
  }

  // 2. Case-insensitive exact match
  const lower = trimmed.toLowerCase();
  for (const [en, hi] of SORTED_PHRASES) {
    if (en.toLowerCase() === lower) {
      return input.replace(trimmed, hi);
    }
  }

  // 3. Multi-word & phrase replacement (longest phrases first)
  let result = input;
  for (const [en, hi] of SORTED_PHRASES) {
    if (en.length >= 2 && result.toLowerCase().includes(en.toLowerCase())) {
      result = replacePhrase(result, en, hi);
    }
  }

  // 4. Word-by-word replacement for remaining English words
  result = result.replace(/\b([a-zA-Z]+)\b/g, (match) => {
    const wordLower = match.toLowerCase();
    if (WORD_GLOSSARY[wordLower]) {
      return WORD_GLOSSARY[wordLower];
    }
    return match;
  });

  // Handle common shorthand units like /Q, /Kg
  result = result.replace(/\/Q\b/g, '/क्विंटल');
  result = result.replace(/\/Kg\b/g, '/किग्रा');
  result = result.replace(/\/MT\b/g, '/टन');

  return result;
}

/**
 * 🔄 Translates any Hindi (Devanagari) text string back into natural English.
 * Accurately maps agricultural terminology, crops, UI labels, and units.
 */
export function translateTextToEnglish(input: string): string {
  if (!input || typeof input !== 'string') return input;

  const trimmed = input.trim();
  if (!trimmed || !/[\u0900-\u097F]/.test(trimmed)) {
    return input; // Already English, numbers, or symbols
  }

  // 1. Exact match in reverse dictionaries
  if (REVERSE_MASTER_PHRASES[trimmed]) {
    return input.replace(trimmed, REVERSE_MASTER_PHRASES[trimmed]);
  }
  if (REVERSE_COMMODITY_GLOSSARY[trimmed]) {
    return input.replace(trimmed, REVERSE_COMMODITY_GLOSSARY[trimmed]);
  }
  if (REVERSE_WORD_GLOSSARY[trimmed]) {
    return input.replace(trimmed, REVERSE_WORD_GLOSSARY[trimmed]);
  }

  // 2. Multi-word & word phrase replacement (longest phrases first)
  let result = input;
  for (const [hi, en] of SORTED_REVERSE_PHRASES) {
    if (hi && result.includes(hi)) {
      result = result.split(hi).join(en);
    }
  }

  // 3. Shorthand units
  result = result.replace(/\/क्विंटल/g, '/Q');
  result = result.replace(/\/किग्रा/g, '/Kg');
  result = result.replace(/\/टन/g, '/MT');

  return result;
}

/**
 * 🛠️ Translation State & MutationObserver Management
 */
let domObserver: MutationObserver | null = null;
let isUpdatingDOM = false;
let currentTargetLanguage: 'en' | 'hi' = 'en';

function translateTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return;
  const tag = parent.tagName.toUpperCase();
  if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT'].includes(tag)) return;
  if (parent.closest('.no-translate, [translate="no"]')) return;

  const currentVal = node.nodeValue;
  if (!currentVal || !currentVal.trim() || !/[a-zA-Z]/.test(currentVal)) {
    return;
  }

  // Save pristine original English text if not already stored
  if ((node as any).__origText === undefined) {
    (node as any).__origText = currentVal;
  }

  const translated = translateTextToHindi((node as any).__origText);
  if (translated !== currentVal) {
    (node as any).__isTranslating = true;
    node.nodeValue = translated;
    (node as any).__isTranslating = false;
  }
}

function restoreTextNode(node: Text) {
  const parent = node.parentElement;
  if (!parent) return;
  const tag = parent.tagName.toUpperCase();
  if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT'].includes(tag)) return;
  if (parent.closest('.no-translate, [translate="no"]')) return;

  const currentVal = node.nodeValue;
  if (!currentVal || !currentVal.trim()) return;

  const orig = (node as any).__origText;
  if (orig && typeof orig === 'string' && /[a-zA-Z]/.test(orig)) {
    if (currentVal !== orig) {
      (node as any).__isTranslating = true;
      node.nodeValue = orig;
      (node as any).__isTranslating = false;
    }
    return;
  }

  // If node currently contains Devanagari text, translate back to English
  if (/[\u0900-\u097F]/.test(currentVal)) {
    const english = translateTextToEnglish(currentVal);
    if (english !== currentVal) {
      (node as any).__isTranslating = true;
      node.nodeValue = english;
      (node as any).__origText = english;
      (node as any).__isTranslating = false;
    }
  }
}

function translateTree(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    translateTextNode(current as Text);
  }

  // Translate placeholders and titles
  const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  inputs.forEach(input => {
    if (input.placeholder && /[a-zA-Z]/.test(input.placeholder)) {
      if ((input as any).__origPlaceholder === undefined) {
        (input as any).__origPlaceholder = input.placeholder;
      }
      input.placeholder = translateTextToHindi((input as any).__origPlaceholder);
    }
  });

  const titled = root.querySelectorAll<HTMLElement>('[title]');
  titled.forEach(el => {
    if (el.title && /[a-zA-Z]/.test(el.title)) {
      if ((el as any).__origTitle === undefined) {
        (el as any).__origTitle = el.title;
      }
      el.title = translateTextToHindi((el as any).__origTitle);
    }
  });

  const labeled = root.querySelectorAll<HTMLElement>('[aria-label]');
  labeled.forEach(el => {
    const label = el.getAttribute('aria-label');
    if (label && /[a-zA-Z]/.test(label)) {
      if ((el as any).__origAriaLabel === undefined) {
        (el as any).__origAriaLabel = label;
      }
      el.setAttribute('aria-label', translateTextToHindi((el as any).__origAriaLabel));
    }
  });

  const buttons = root.querySelectorAll<HTMLInputElement>('input[type="button"], input[type="submit"]');
  buttons.forEach(btn => {
    if (btn.value && /[a-zA-Z]/.test(btn.value)) {
      if ((btn as any).__origValue === undefined) {
        (btn as any).__origValue = btn.value;
      }
      btn.value = translateTextToHindi((btn as any).__origValue);
    }
  });
}

function restoreTree(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    restoreTextNode(current as Text);
  }

  const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  inputs.forEach(input => {
    const orig = (input as any).__origPlaceholder;
    if (orig && typeof orig === 'string' && /[a-zA-Z]/.test(orig)) {
      input.placeholder = orig;
    } else if (input.placeholder && /[\u0900-\u097F]/.test(input.placeholder)) {
      const en = translateTextToEnglish(input.placeholder);
      input.placeholder = en;
      (input as any).__origPlaceholder = en;
    }
  });

  const titled = root.querySelectorAll<HTMLElement>('[title]');
  titled.forEach(el => {
    const orig = (el as any).__origTitle;
    if (orig && typeof orig === 'string' && /[a-zA-Z]/.test(orig)) {
      el.title = orig;
    } else if (el.title && /[\u0900-\u097F]/.test(el.title)) {
      const en = translateTextToEnglish(el.title);
      el.title = en;
      (el as any).__origTitle = en;
    }
  });

  const labeled = root.querySelectorAll<HTMLElement>('[aria-label]');
  labeled.forEach(el => {
    const orig = (el as any).__origAriaLabel;
    const current = el.getAttribute('aria-label');
    if (orig && typeof orig === 'string' && /[a-zA-Z]/.test(orig)) {
      el.setAttribute('aria-label', orig);
    } else if (current && /[\u0900-\u097F]/.test(current)) {
      const en = translateTextToEnglish(current);
      el.setAttribute('aria-label', en);
      (el as any).__origAriaLabel = en;
    }
  });

  const buttons = root.querySelectorAll<HTMLInputElement>('input[type="button"], input[type="submit"]');
  buttons.forEach(btn => {
    const orig = (btn as any).__origValue;
    if (orig && typeof orig === 'string' && /[a-zA-Z]/.test(orig)) {
      btn.value = orig;
    } else if (btn.value && /[\u0900-\u097F]/.test(btn.value)) {
      const en = translateTextToEnglish(btn.value);
      btn.value = en;
      (btn as any).__origValue = en;
    }
  });
}

/**
 * ⚡ Full Interface Language Applier
 * When 'hi' is selected: Translates all existing nodes and watches for newly mounted nodes.
 * When 'en' is selected: Restores all text nodes and placeholders back to original English.
 */
export function applyLanguageToDOM(lang: 'en' | 'hi') {
  if (typeof document === 'undefined' || !document.body) return;

  currentTargetLanguage = lang;

  if (lang === 'en') {
    // 1. Immediately disconnect observer so no Hindi translations can occur
    if (domObserver) {
      domObserver.disconnect();
      domObserver = null;
    }

    // 2. Perform synchronous restoration of the entire tree
    isUpdatingDOM = true;
    try {
      restoreTree(document.body);
    } finally {
      isUpdatingDOM = false;
    }

    document.documentElement.lang = 'en';
    try {
      localStorage.setItem('farm2future_language', 'en');
    } catch {}

    // 3. React may commit asynchronous updates or transitions: run follow-up cleanups
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        if (currentTargetLanguage === 'en') {
          restoreTree(document.body);
        }
      });
      setTimeout(() => {
        if (currentTargetLanguage === 'en') {
          restoreTree(document.body);
        }
      }, 80);
      setTimeout(() => {
        if (currentTargetLanguage === 'en') {
          restoreTree(document.body);
        }
      }, 250);
    }
    return;
  }

  // lang === 'hi'
  document.documentElement.lang = 'hi';
  try {
    localStorage.setItem('farm2future_language', 'hi');
  } catch {}

  isUpdatingDOM = true;
  try {
    translateTree(document.body);
  } finally {
    isUpdatingDOM = false;
  }

  if (!domObserver) {
    domObserver = new MutationObserver((mutations) => {
      if (currentTargetLanguage !== 'hi') return;
      if (isUpdatingDOM) return;

      isUpdatingDOM = true;
      try {
        for (const mutation of mutations) {
          if (currentTargetLanguage !== 'hi') break;
          if (mutation.type === 'characterData') {
            const node = mutation.target as Text;
            if (node.nodeType === Node.TEXT_NODE && !(node as any).__isTranslating) {
              translateTextNode(node);
            }
          } else if (mutation.type === 'childList') {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              if (currentTargetLanguage !== 'hi') break;
              const node = mutation.addedNodes[i];
              if (node.nodeType === Node.TEXT_NODE) {
                translateTextNode(node as Text);
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                translateTree(node as HTMLElement);
              }
            }
          }
        }
      } finally {
        isUpdatingDOM = false;
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}

/**
 * 🪝 Helper function for React JSX to get translated string synchronously (Bidirectional)
 */
export function t(text: string, currentLang: 'en' | 'hi' = 'en'): string {
  if (currentLang === 'en') {
    return translateTextToEnglish(text);
  }
  return translateTextToHindi(text);
}

