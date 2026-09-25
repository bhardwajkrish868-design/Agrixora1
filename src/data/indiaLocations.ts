/**
 * 🇮🇳 Comprehensive All Indian States & Districts Master Database
 * Covers all 28 States and 8 Union Territories with official districts.
 * Supports dependent cascading State -> District selector functionality.
 */

export const INDIA_STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 
    'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 
    'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 
    'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 
    'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Itanagar', 
    'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 
    'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 
    'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Siang', 
    'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Baksa', 'Bajali', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 
    'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 
    'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 
    'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 
    'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tamulpur', 
    'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ],
  'Bihar': [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 
    'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 
    'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 
    'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 
    'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 
    'Siwan', 'Supaul', 'Vaishali', 'West Champaran'
  ],
  'Chhattisgarh': [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 
    'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 
    'Jashpur', 'Kabirdham', 'Kanker', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 
    'Korba', 'Koriya', 'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur', 
    'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 
    'Rajnandgaon', 'Sakti', 'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja'
  ],
  'Goa': [
    'North Goa', 'South Goa'
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 
    'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 
    'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 
    'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 
    'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 
    'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 
    'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 
    'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 
    'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
  ],
  'Jharkhand': [
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 
    'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 
    'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 
    'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ],
  'Karnataka': [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 
    'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 
    'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 
    'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Vijayanagara', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 
    'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 
    'Thrissur', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 
    'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 
    'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad (Narmadapuram)', 
    'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla', 
    'Mandsaur', 'Mauganj', 'Morena', 'Narsinghpur', 'Neemuch', 'Niwari', 'Pandhurna', 
    'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 
    'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 
    'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ],
  'Maharashtra': [
    'Ahmednagar (Ahilyanagar)', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 
    'Chandrapur', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Dhule', 'Gadchiroli', 
    'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 
    'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad (Dharashiv)', 
    'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 
    'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Manipur': [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 
    'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 
    'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  'Meghalaya': [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Eastern West Khasi Hills', 
    'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 
    'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
  ],
  'Mizoram': [
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 
    'Mamit', 'Saiha', 'Saitual', 'Serchhip'
  ],
  'Nagaland': [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 
    'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 
    'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 
    'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 
    'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 
    'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 
    'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundergarh'
  ],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 
    'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 
    'Malerkotla', 'Mansa', 'Moga', 'Pathankot', 'Patiala', 'Rupnagar', 
    'Sahibzada Ajit Singh Nagar (Mohali)', 'Shaheed Bhagat Singh Nagar', 
    'Sri Muktsar Sahib', 'Tarn Taran'
  ],
  'Rajasthan': [
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar', 
    'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 
    'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur', 'Ganganagar', 
    'Gangapurcity', 'Hanumangarh', 'Jaipur', 'Jaipur Rural', 'Jaisalmer', 'Jalore', 
    'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 'Kekri', 'Khairthal-Tijara', 
    'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi', 
    'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura', 
    'Sikar', 'Sirohi', 'Tonk', 'Udaipur'
  ],
  'Sikkim': [
    'Gangtok', 'Geyzing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
    'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 
    'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 
    'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 
    'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 
    'Viluppuram', 'Virudhunagar'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial', 
    'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 
    'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 
    'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 
    'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 
    'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 
    'Yadadri Bhuvanagiri'
  ],
  'Tripura': [
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 
    'Unakoti', 'West Tripura'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 
    'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 
    'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 
    'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 
    'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 
    'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 
    'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 
    'Kheri (Lakhimpur)', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 
    'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 
    'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 
    'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 
    'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ],
  'Uttarakhand': [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 
    'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 
    'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 
    'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 
    'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 
    'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ],
  // Union Territories
  'Andaman and Nicobar Islands': [
    'Nicobar', 'North and Middle Andaman', 'South Andaman'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra and Nagar Haveli', 'Daman', 'Diu'
  ],
  'Delhi': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 
    'South West Delhi', 'West Delhi'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 
    'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 
    'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ],
  'Ladakh': [
    'Kargil', 'Leh'
  ],
  'Lakshadweep': [
    'Lakshadweep'
  ],
  'Puducherry': [
    'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
  ]
};

/**
 * List of all 36 Indian States and Union Territories sorted alphabetically
 */
export const ALL_INDIAN_STATES: string[] = Object.keys(INDIA_STATES_AND_DISTRICTS).sort((a, b) => a.localeCompare(b));

/**
 * Returns strictly the districts belonging to the specified state.
 * Returns empty array if state not found or invalid.
 */
export function getDistrictsForState(stateName: string): string[] {
  if (!stateName) return [];
  const trimmed = stateName.trim();
  if (INDIA_STATES_AND_DISTRICTS[trimmed]) {
    return INDIA_STATES_AND_DISTRICTS[trimmed];
  }
  // Try case-insensitive lookup
  const match = Object.keys(INDIA_STATES_AND_DISTRICTS).find(
    s => s.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) {
    return INDIA_STATES_AND_DISTRICTS[match];
  }
  // Handle common aliases
  if (/delhi/i.test(trimmed)) return INDIA_STATES_AND_DISTRICTS['Delhi'] || [];
  if (/jammu/i.test(trimmed)) return INDIA_STATES_AND_DISTRICTS['Jammu and Kashmir'] || [];
  return [];
}

/**
 * Checks whether a given district is valid for a given state.
 */
export function isValidDistrict(stateName: string, districtName: string): boolean {
  if (!stateName || !districtName) return false;
  const districts = getDistrictsForState(stateName);
  return districts.some(d => d.toLowerCase() === districtName.trim().toLowerCase());
}

/**
 * Returns the default or first district for a given state.
 */
export function getDefaultDistrictForState(stateName: string): string {
  const districts = getDistrictsForState(stateName);
  if (districts.length === 0) return '';
  // Preferred prominent defaults for key agri states
  if (stateName === 'Maharashtra') return 'Nashik';
  if (stateName === 'Punjab') return 'Ludhiana';
  if (stateName === 'Haryana') return 'Karnal';
  if (stateName === 'Madhya Pradesh') return 'Indore';
  if (stateName === 'Uttar Pradesh') return 'Agra';
  if (stateName === 'Gujarat') return 'Ahmedabad';
  if (stateName === 'Rajasthan') return 'Jaipur';
  if (stateName === 'Karnataka') return 'Kolar';
  if (stateName === 'Delhi') return 'North Delhi';
  return districts[0];
}

/**
 * 🏛️ Nearest Target APMC Mandi Directory by State and District
 * Comprehensive database of official eNAM and State APMC Market Yards across India.
 */
export const APMC_MANDI_DIRECTORY: Record<string, Record<string, string>> = {
  'Maharashtra': {
    'Nashik': 'Lasalgaon & Panchavati APMC Yard, Nashik',
    'Pune': 'Gultekdi APMC Market Yard, Pune',
    'Nagpur': 'Kalamna APMC Mega Grain & Orange Yard, Nagpur',
    'Ahmednagar': 'Rahata & Ahmednagar Main APMC Mandi',
    'Jalgaon': 'Jalgaon Banana & Cotton APMC Mandi',
    'Solapur': 'Siddheshwar APMC Grain & Onion Market, Solapur',
    'Kolhapur': 'Shahu Market Yard APMC Kolhapur',
    'Chhatrapati Sambhajinagar': 'Jadhavwadi APMC Krishi Mandi, Sambhajinagar',
    'Amravati': 'Amravati Cotton & Soybean APMC Yard',
    'Satara': 'Karad & Satara APMC Yard',
    'Sangli': 'Sangli Turmeric & Raisin APMC Terminal',
    'Latur': 'Latur Pulses & Oilseed Mega APMC Yard',
    'Thane': 'Kalyan & Vashi APMC Terminal, Thane',
    'Mumbai Suburban': 'Vashi APMC Mega Terminal, Navi Mumbai',
    'Mumbai': 'Vashi APMC Mega Terminal, Navi Mumbai',
    'Dhule': 'Dhule Cotton & Chilly APMC Mandi',
    'Nandurbar': 'Nandurbar Red Chilly & Cotton APMC Yard',
    'Nanded': 'Nanded Cotton & Soybean APMC Mandi',
    'Parbhani': 'Parbhani APMC Grain Yard',
    'Jalna': 'Jalna Steel & Sweet Orange (Mosambi) APMC Mandi',
    'Beed': 'Beed & Majalgaon Cotton APMC Mandi',
    'Dharashiv': 'Dharashiv APMC Pulse Mandi',
    'Wardha': 'Wardha Cotton & Soybean APMC Mandi',
    'Yavatmal': 'Yavatmal White Gold Cotton APMC Yard',
    'Bhandara': 'Bhandara Paddy & Rice APMC Mandi',
    'Gondia': 'Gondia Rice Mill & Grain APMC Mandi',
    'Chandrapur': 'Chandrapur & Warora APMC Mandi',
    'Gadchiroli': 'Gadchiroli Forest & Paddy APMC Mandi',
    'Buldhana': 'Khamgaon Cotton & Grain APMC Mandi',
    'Akola': 'Akola Cotton & Pulse APMC Mega Yard',
    'Washim': 'Washim Soybean & Wheat APMC Mandi',
    'Raigad': 'Panvel & Pen Rice APMC Yard',
    'Ratnagiri': 'Ratnagiri Alphonso Mango APMC Mandi',
    'Sindhudurg': 'Kudal Cashew & Mango APMC Yard',
    'Palghar': 'Dahanu Chikoo & Veg APMC Mandi'
  },
  'Bihar': {
    'Patna': 'Mithapur & Fatuha APMC Grain Mandi, Patna',
    'Vaishali': 'Hajipur Krishi Utpadan Mandi Samiti, Vaishali',
    'Muzaffarpur': 'Muzaffarpur Bazaar Samiti Shahi Litchi & Grain Mandi',
    'Samastipur': 'Samastipur Krishi Upaj Mandi Samiti',
    'Purnia': 'Gulabbagh Mega Grain & Maize Mandi, Purnia',
    'Bhagalpur': 'Bhagalpur Krishi Upaj Mandi Samiti',
    'Begusarai': 'Begusarai Krishi Mandi Yard',
    'Gaya': 'Gaya Krishi Bazaar Samiti Mandi',
    'Nalanda': 'Bihar Sharif Krishi Upaj Potato & Grain Mandi',
    'Darbhanga': 'Darbhanga Krishi Bazar Mandi',
    'Saran': 'Chhapra Krishi Upaj Mandi',
    'Rohtas': 'Sasaram & Nokha Rice Mill Mandi, Rohtas',
    'Katihar': 'Katihar Jute & Grain Krishi Mandi',
    'East Champaran': 'Motihari Krishi Bazar Samiti',
    'West Champaran': 'Bettiah Krishi Upaj Sugarcane & Grain Mandi',
    'Bhojpur': 'Ara Krishi Upaj Mandi',
    'Buxar': 'Buxar Paddy & Wheat Krishi Mandi',
    'Siwan': 'Siwan Krishi Utpadan Mandi',
    'Gopalganj': 'Gopalganj Krishi Upaj Mandi',
    'Sitamarhi': 'Sitamarhi Krishi Bazar Mandi',
    'Madhubani': 'Madhubani & Jhanjharpur Krishi Mandi',
    'Khagaria': 'Khagaria Maize (Makka) Mega Mandi',
    'Saharsa': 'Saharsa Krishi Upaj Mandi',
    'Madhepura': 'Madhepura Kosi Maize Mandi',
    'Supaul': 'Supaul Krishi Bazar Samiti',
    'Araria': 'Forbesganj & Araria Jute & Grain Mandi',
    'Kishanganj': 'Kishanganj Pineapple & Tea Agri Mandi',
    'Munger': 'Munger Krishi Bazar Mandi',
    'Jamui': 'Jamui Krishi Upaj Mandi',
    'Lakhisarai': 'Lakhisarai Pulse & Grain Mandi',
    'Sheikhpura': 'Sheikhpura Krishi Bazar Samiti',
    'Nawada': 'Nawada Krishi Upaj Mandi',
    'Aurangabad': 'Aurangabad Paddy & Wheat Mandi',
    'Jehanabad': 'Jehanabad Krishi Upaj Mandi',
    'Arwal': 'Arwal Krishi Bazar Mandi',
    'Kaimur': 'Mohania & Bhabua Rice Mandi, Kaimur',
    'Banka': 'Banka Krishi Upaj Mandi',
    'Sheohar': 'Sheohar Krishi Bazar Mandi'
  },
  'Punjab': {
    'Ludhiana': 'Khanna & Ludhiana APMC Grain Market (Asia\'s Largest)',
    'Moga': 'Moga FCI Modern Steel Silo & APMC Mandi',
    'Amritsar': 'Bhagtanwala Grain Mandi, Amritsar',
    'Bathinda': 'Bathinda Main Cotton & Wheat APMC Mandi',
    'Jalandhar': 'Maqsudan Grain & Vegetable Mandi, Jalandhar',
    'Patiala': 'Sirhind Road APMC Mandi, Patiala',
    'Sangrur': 'Sunam & Sangrur Mega Grain Mandi',
    'Firozpur': 'Firozpur Cantt APMC Grain Market',
    'Gurdaspur': 'Batala & Gurdaspur Grain Mandi',
    'Hoshiarpur': 'Hoshiarpur Citrus & Grain Mandi',
    'Fazilka': 'Abohar & Fazilka Cotton & Kinnow Mandi',
    'Kapurthala': 'Phagwara & Kapurthala APMC Yard',
    'Mansa': 'Mansa Cotton & Grain APMC Mandi',
    'Barnala': 'Barnala Grain & Fodder APMC Mandi',
    'Fatehgarh Sahib': 'Sirhind APMC Grain Market',
    'Faridkot': 'Kotkapura & Faridkot Cotton Mandi',
    'Sri Muktsar Sahib': 'Malout & Sri Muktsar Sahib Cotton Mandi',
    'Pathankot': 'Pathankot Litchi & Grain Mandi',
    'Rupnagar': 'Ropar & Morinda APMC Grain Yard',
    'Sahibzada Ajit Singh Nagar': 'Kharar & Mohali APMC Mandi',
    'Tarn Taran': 'Patti & Tarn Taran Basmati Grain Mandi'
  },
  'Haryana': {
    'Karnal': 'Karnal APMC Mega Grain Yard',
    'Kurukshetra': 'Thanesar & Pipli APMC Grain Mandi',
    'Ambala': 'Ambala City New Grain Market',
    'Sirsa': 'Sirsa Cotton & Wheat APMC Mandi',
    'Hisar': 'Hisar New Grain & Fodder APMC Mandi',
    'Rohtak': 'Rohtak Grain & Vegetable APMC Mandi',
    'Sonipat': 'Sonipat APMC Subzi & Anaj Mandi',
    'Panipat': 'Panipat New Grain Market',
    'Fatehabad': 'Tohana & Fatehabad Grain Mandi',
    'Jind': 'Narwana & Jind APMC Mandi',
    'Kaithal': 'Kaithal Paddy & Wheat APMC Mandi',
    'Yamunanagar': 'Jagadhri & Yamunanagar Timber & Grain Mandi',
    'Gurugram': 'Gurugram Subzi & Anaj Mandi, Khandsa',
    'Faridabad': 'Faridabad Ballabhgarh APMC Yard',
    'Rewari': 'Rewari Mustard & Bajra APMC Mandi',
    'Bhiwani': 'Bhiwani Grain & Mustard APMC Mandi',
    'Charkhi Dadri': 'Charkhi Dadri Mustard & Pulse Mandi',
    'Jhajjar': 'Bahadurgarh & Jhajjar Grain Mandi',
    'Mahendragarh': 'Narnaul & Ateli Mustard Mandi',
    'Nuh': 'Mewat Taoru APMC Mandi',
    'Palwal': 'Palwal & Hodal Cotton & Wheat Mandi',
    'Panchkula': 'Barwala & Panchkula APMC Yard'
  },
  'Uttar Pradesh': {
    'Lucknow': 'Dubagga & Naveen Galla Mandi Sitapur Road, Lucknow',
    'Agra': 'Agra Kuberpur & Achhnera APMC Mandi Yard',
    'Varanasi': 'Pahariya Naveen Krishi Mandi, Varanasi',
    'Kanpur Nagar': 'Chaubepur & Naubasta Mandi Samiti, Kanpur',
    'Meerut': 'Delhi Road Naveen Mandi Samiti, Meerut',
    'Bareilly': 'Delapeer Naveen Galla Mandi, Bareilly',
    'Aligarh': 'Dhanipur Krishi Utpadan Mandi, Aligarh',
    'Moradabad': 'Moradabad Naveen Galla Mandi',
    'Prayagraj': 'Mundera Krishi Utpadan Mandi Samiti, Prayagraj',
    'Gorakhpur': 'Mahewa Naveen Galla Mandi, Gorakhpur',
    'Mathura': 'Mathura Vrindavan Road Krishi Mandi',
    'Muzaffarnagar': 'Muzaffarnagar Mega Jaggery (Gur) & Grain Mandi',
    'Saharanpur': 'Saharanpur Mango & Grain Naveen Mandi',
    'Jhansi': 'Jhansi Krishi Utpadan Mandi Samiti',
    'Ayodhya': 'Faizabad Ayodhya Naveen Galla Mandi',
    'Barabanki': 'Barabanki Naveen Krishi Mandi',
    'Ghaziabad': 'Sahibabad Wholesale Fruit & Veg Terminal Mandi',
    'Gautam Buddha Nagar': 'Noida Sector 88 Phool & Subzi Mandi',
    'Bulandshahr': 'Bulandshahr Galla Mandi',
    'Budaun': 'Budaun Naveen Krishi Mandi',
    'Shahjahanpur': 'Rosa & Shahjahanpur Grain Mandi',
    'Pilibhit': 'Pilibhit Paddy & Wheat Krishi Mandi',
    'Lakhimpur Kheri': 'Tikunia & Lakhimpur Grain Mandi',
    'Sitapur': 'Sitapur Naveen Galla Mandi',
    'Hardoi': 'Hardoi Naveen Krishi Mandi',
    'Unnao': 'Unnao Naveen Mandi Samiti',
    'Rae Bareli': 'Rae Bareli Naveen Krishi Mandi',
    'Farrukhabad': 'Farrukhabad Potato & Grain Mega Mandi',
    'Kannauj': 'Kannauj Potato & Maize Mandi',
    'Etawah': 'Etawah Krishi Utpadan Mandi',
    'Mainpuri': 'Mainpuri Krishi Mandi Samiti',
    'Firozabad': 'Shikohabad & Firozabad Potato Mandi',
    'Banda': 'Banda Pulse & Oilseed Krishi Mandi',
    'Mirzapur': 'Mirzapur Naveen Krishi Mandi',
    'Jaunpur': 'Jaunpur Naveen Galla Mandi',
    'Ghazipur': 'Ghazipur Krishi Upaj Mandi',
    'Ballia': 'Ballia Naveen Krishi Mandi',
    'Deoria': 'Deoria Krishi Bazar Mandi',
    'Kushinagar': 'Kushinagar Sugarcane & Grain Mandi',
    'Basti': 'Basti Naveen Krishi Mandi',
    'Azamgarh': 'Azamgarh Naveen Galla Mandi'
  },
  'Madhya Pradesh': {
    'Indore': 'Devi Ahilya Bai Holkar APMC Mandi, Choithram, Indore',
    'Sehore': 'Sehore Sharbati Wheat APMC Mega Yard',
    'Ujjain': 'Chimanganj Mandi Samiti, Ujjain',
    'Bhopal': 'Karond Krishi Upaj Mandi, Bhopal',
    'Jabalpur': 'Vijay Nagar Krishi Upaj Mandi Samiti, Jabalpur',
    'Gwalior': 'Lashkar Gwalior Krishi Upaj Mandi',
    'Dewas': 'Dewas Krishi Upaj Mandi Samiti',
    'Narmadapuram': 'Itarsi Krishi Upaj Mandi, Narmadapuram',
    'Sagar': 'Sagar Krishi Upaj Mandi',
    'Ratlam': 'Ratlam Namkeen & Wheat APMC Mandi',
    'Mandsaur': 'Mandsaur Garlic & Spices Mega Mandi',
    'Neemuch': 'Neemuch Medicinal Herbs & Grain APMC Mandi',
    'Khargone': 'Khargone Cotton & Chili APMC Mandi',
    'Harda': 'Harda Soybean & Wheat APMC Mandi',
    'Vidisha': 'Vidisha Sharbati Wheat Krishi Mandi',
    'Chhindwara': 'Chhindwara Corn & Orange APMC Mandi',
    'Satna': 'Satna Krishi Upaj Mandi',
    'Rewa': 'Rewa Krishi Upaj Mandi Samiti',
    'Katni': 'Katni Dal Mill & Paddy Mandi',
    'Khandwa': 'Khandwa Cotton & Soybean APMC Mandi',
    'Dhar': 'Dhar & Badnawar Krishi Upaj Mandi',
    'Barwani': 'Barwani Papaya & Cotton Mandi',
    'Guna': 'Guna Coriander (Dhaniya) Mega Mandi',
    'Shivpuri': 'Shivpuri Groundnut & Mustard Mandi',
    'Morena': 'Morena Mustard Mega APMC Mandi',
    'Bhind': 'Bhind Bajra & Mustard Krishi Mandi',
    'Shajapur': 'Shajapur Onion & Garlic Mandi',
    'Betul': 'Betul Maize & Soybean Mandi',
    'Damoh': 'Damoh Pulse & Grain Mandi',
    'Raisen': 'Gairatganj & Raisen Paddy Mandi'
  },
  'Rajasthan': {
    'Jaipur': 'Muhana Terminal Market & Surajpole APMC, Jaipur',
    'Jodhpur': 'Paota & Basni Krishi Upaj Mandi, Jodhpur',
    'Kota': 'Bhamashah APMC Mega Grain & Soybean Mandi, Kota',
    'Bikaner': 'Bikaner Grain, Mustard & Wool APMC Mandi',
    'Sri Ganganagar': 'Sri Ganganagar New Dhan Mandi',
    'Alwar': 'Kherli & Alwar Mustard APMC Mandi',
    'Udaipur': 'Savina Krishi Upaj Mandi, Udaipur',
    'Ajmer': 'Ajmer Pushkar Road Krishi Mandi',
    'Bharatpur': 'Bharatpur Mustard & Bajra Mega Mandi',
    'Hanumangarh': 'Hanumangarh Town New Dhan Mandi',
    'Nagaur': 'Nagaur Methi & Cumin Krishi Mandi',
    'Pali': 'Pali Marwar APMC Mandi',
    'Sikar': 'Sikar Onion & Wheat Krishi Mandi',
    'Tonk': 'Tonk Mustard & Melon Krishi Mandi',
    'Barmer': 'Barmer Isabgol & Cumin Mandi',
    'Jalore': 'Jalore Isabgol & Castor Seed Mandi',
    'Chittorgarh': 'Chittorgarh Grain & Groundnut Mandi',
    'Bhilwara': 'Bhilwara Maize & Cotton Krishi Mandi',
    'Baran': 'Baran Soybean & Garlic Mega Mandi',
    'Bundi': 'Bundi Basmati Paddy Mega Mandi',
    'Jhalawar': 'Jhalawar Orange & Coriander Mega Mandi',
    'Dausa': 'Dausa & Bandikui Krishi Mandi',
    'Sawai Madhopur': 'Sawai Madhopur Guava & Mustard Mandi'
  },
  'Gujarat': {
    'Ahmedabad': 'Jamalpur & Sardar Patel APMC Yard, Vasna, Ahmedabad',
    'Surat': 'Sardar Market APMC, Sahara Darwaja, Surat',
    'Rajkot': 'Bedi Yard APMC Mandi, Rajkot',
    'Vadodara': 'Sayajipura APMC Market Yard, Vadodara',
    'Mehsana': 'Unjha Mega Spices APMC Terminal (World\'s Largest Cumin Mandi)',
    'Botad': 'Botad Cotton & Groundnut APMC Mandi',
    'Junagadh': 'Junagadh Groundnut & Kesar Mango APMC Mandi',
    'Banaskantha': 'Deesa Potato & Mustard APMC Mandi',
    'Amreli': 'Amreli Cotton & Groundnut APMC Mandi',
    'Bhavnagar': 'Chitra APMC Market Yard, Bhavnagar',
    'Kutch': 'Bhuj & Gandhidham APMC Mandi',
    'Anand': 'Anand Dairy & Tobacco APMC Mandi',
    'Patan': 'Patan Cumin & Mustard APMC Mandi',
    'Sabarkantha': 'Himatnagar Groundnut & Veg APMC Mandi',
    'Surendranagar': 'Surendranagar Cotton & Sesame APMC Mandi',
    'Jamnagar': 'Jamnagar Hapa APMC Grain & Groundnut Yard',
    'Porbandar': 'Porbandar APMC Market Yard',
    'Morbi': 'Morbi Cotton & Sesame APMC Yard',
    'Navsari': 'Navsari Mango & Chikoo APMC Mandi',
    'Valsad': 'Valsad Alphonso Mango APMC Yard',
    'Bharuch': 'Bharuch Cotton & Banana APMC Yard',
    'Kheda': 'Nadiad APMC Vegetable & Tobacco Yard',
    'Dahod': 'Dahod Maize & Soybean APMC Mandi',
    'Panchmahal': 'Godhra APMC Market Yard',
    'Gir Somnath': 'Talala Kesar Mango APMC Mega Yard'
  },
  'Karnataka': {
    'Bengaluru Urban': 'Yeshwanthpur APMC Yard & Binny Mill Market, Bengaluru',
    'Bengaluru Rural': 'Doddaballapur & Nelamangala APMC Yard',
    'Kolar': 'Kolar Mega Tomato & Silk APMC Market',
    'Belagavi': 'Belagavi APMC Vegetable & Jaggery Yard',
    'Mysuru': 'Bandipalya APMC Market Yard, Mysuru',
    'Davanagere': 'Davanagere Maize & Cotton APMC Mandi',
    'Dharwad': 'Amargol APMC Yard, Hubli-Dharwad',
    'Shivamogga': 'Shivamogga Arecanut & Paddy APMC Mandi',
    'Ballari': 'Ballari APMC Cotton & Paddy Yard',
    'Hassan': 'Hassan Potato & Coffee APMC Mandi',
    'Mandya': 'Mandya Jaggery & Rice APMC Market',
    'Tumakuru': 'Tumakuru Coconut & Ragi APMC Mandi',
    'Chikkamagaluru': 'Kadur & Chikkamagaluru Coffee & Spices Yard',
    'Udupi': 'Udupi Coconut & Arecanut APMC Yard',
    'Dakshina Kannada': 'Mangaluru Bunder APMC Market Yard',
    'Chitradurga': 'Chitradurga Pomegranate & Groundnut APMC Mandi',
    'Kalaburagi': 'Kalaburagi Tur (Red Gram) Mega APMC Mandi',
    'Raichur': 'Raichur Cotton & Paddy APMC Market',
    'Koppal': 'Gangavathi Mega Rice Mill APMC Yard',
    'Vijayapura': 'Vijayapura Lemon & Grape APMC Mandi',
    'Bagalkote': 'Mudhol & Jamkhandi Sugarcane & Jaggery Yard',
    'Gadag': 'Gadag Green Chilly & Cotton APMC Yard',
    'Haveri': 'Byadagi Mega Red Chilly APMC Terminal',
    'Uttara Kannada': 'Sirsi Arecanut & Spices APMC Market',
    'Yadgir': 'Yadgir Cotton & Paddy APMC Yard'
  },
  'Tamil Nadu': {
    'Chennai': 'Koyambedu Wholesale Market Complex (KWMC), Chennai',
    'Coimbatore': 'MGR Wholesale Market & APMC Yard, Coimbatore',
    'Madurai': 'Mattuthavani Central Integrated Market, Madurai',
    'Tiruchirappalli': 'Gandhi Market & Tiruchy APMC Yard',
    'Erode': 'Erode Perundurai Turmeric & Agri Market (Yellow City)',
    'Salem': 'Salem Leigh Bazaar & Shevapet Regulated Market',
    'Tirupur': 'Tirupur Cotton & Vegetable Regulated Market',
    'Dindigul': 'Dindigul Onion & Lock Market Yard',
    'Thanjavur': 'Thanjavur Delta Paddy Regulated Market',
    'Cuddalore': 'Panruti Cashew & Jackfruit Regulated Market',
    'Villupuram': 'Villupuram Sugarcane & Paddy Market',
    'Tirunelveli': 'Tirunelveli Nainarkulam Agricultural Market',
    'Vellore': 'Vellore Nethaji Market & Regulated Yard',
    'Thoothukudi': 'Kovilpatti Black Soil Cotton & Maize Market',
    'Kanyakumari': 'Vadasery Wholesale Agricultural Market, Nagercoil',
    'Namakkal': 'Namakkal Poultry & Maize Regulated Market',
    'Karur': 'Karur Banana & Moringa Regulated Market',
    'The Nilgiris': 'Udhagamandalam Potato & Tea Auction Center',
    'Theni': 'Cumbum Valley Grapes & Banana Market',
    'Virudhunagar': 'Virudhunagar Oilseed & Chilly Market'
  },
  'Telangana': {
    'Hyderabad': 'Bowenpally & Malakpet Mega APMC Market, Hyderabad',
    'Ranga Reddy': 'Gaddiannaram & Shamshabad Fruit & Agri Terminal',
    'Warangal': 'Enumamula APMC Mega Grain & Chili Yard (Asia\'s 2nd Largest)',
    'Nizamabad': 'Nizamabad APMC Turmeric & Maize Mega Yard',
    'Khammam': 'Khammam APMC Chili & Cotton Yard',
    'Karimnagar': 'Karimnagar Agricultural Market Committee Yard',
    'Nalgonda': 'Nalgonda Miryalaguda Paddy APMC Mandi',
    'Mahabubnagar': 'Badepally & Mahabubnagar APMC Yard',
    'Medak': 'Siddipet & Medak APMC Grain Market',
    'Adilabad': 'Adilabad Cotton & Soybean APMC Yard',
    'Suryapet': 'Suryapet Agricultural Market Yard',
    'Jagtial': 'Jagtial Mango & Paddy Market Committee Yard'
  },
  'Andhra Pradesh': {
    'Guntur': 'Guntur Mirchi Yard (Asia\'s Largest Dry Chili Market)',
    'Krishna': 'Gollapudi Wholesale APMC Market Yard, Vijayawada',
    'Kurnool': 'Kurnool APMC Onion & Groundnut Yard',
    'Visakhapatnam': 'Anakapalle Jaggery & Agri APMC Yard, Vizag',
    'Ananthapuramu': 'Anantapur Groundnut & Sweet Orange APMC Yard',
    'East Godavari': 'Rajahmundry & Kakinada Agri Market Yard',
    'West Godavari': 'Eluru Paddy & Coconut Market Yard',
    'Chittoor': 'Madanapalle Mega Tomato APMC Market, Chittoor',
    'Prakasam': 'Ongole Tobacco & Pulse APMC Mandi',
    'Nellore': 'Nellore Rice Millers & Paddy APMC Mandi',
    'YSR Kadapa': 'Kadapa Turmeric & Banana APMC Yard',
    'Srikakulam': 'Srikakulam Cashew & Paddy Market Yard',
    'Vizianagaram': 'Vizianagaram Jute & Mango Market Yard'
  },
  'Delhi': {
    'North Delhi': 'Azadpur APMC Mega Terminal Mandi (Asia\'s Largest)',
    'Central Delhi': 'Azadpur APMC Mega Terminal Mandi, Delhi',
    'South Delhi': 'Okhla APMC Subzi Mandi',
    'East Delhi': 'Ghazipur APMC Integrated Fruit & Flower Mandi',
    'West Delhi': 'Keshopur APMC Subzi Mandi',
    'North West Delhi': 'Narela Food Grain APMC Mega Mandi',
    'South West Delhi': 'Najafgarh Grain APMC Mandi',
    'Shahdara': 'Ghazipur APMC Integrated Mandi',
    'New Delhi': 'Azadpur APMC Mega Terminal Mandi, Delhi'
  }
};

/**
 * 🎯 Returns the Nearest Target APMC Mandi based on State and District.
 */
export function getNearestTargetMandi(stateName: string, districtName?: string): string {
  if (!stateName) return 'Central Regional APMC Market';
  const stateRecord = APMC_MANDI_DIRECTORY[stateName];
  if (stateRecord && districtName) {
    // Exact district match
    const exact = Object.keys(stateRecord).find(
      d => d.toLowerCase() === districtName.trim().toLowerCase()
    );
    if (exact && stateRecord[exact]) {
      return stateRecord[exact];
    }
  }

  // Fallback 1: State default mandi if available
  if (stateRecord) {
    if (districtName) {
      return `${districtName} APMC Krishi Mandi Yard, ${stateName}`;
    }
    const firstDistrict = Object.keys(stateRecord)[0];
    return stateRecord[firstDistrict] || `${stateName} Central APMC Mandi`;
  }

  // Fallback 2: District + State dynamic naming
  if (districtName) {
    return `${districtName} APMC Mandi / Regulated Agricultural Market, ${stateName}`;
  }
  return `${stateName} State APMC Market Yard`;
}

/**
 * 📍 Returns suggested APMC mandis for a given state & district.
 */
export function getNearbyMandisForLocation(stateName: string, districtName?: string): string[] {
  const nearest = getNearestTargetMandi(stateName, districtName);
  const stateRecord = APMC_MANDI_DIRECTORY[stateName];
  if (!stateRecord) {
    return [nearest];
  }
  const allInState = Object.values(stateRecord);
  const unique = Array.from(new Set([nearest, ...allInState]));
  return unique.slice(0, 6);
}

