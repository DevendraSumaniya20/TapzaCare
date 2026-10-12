// Stand-in for a backend that localises /config and /prescriptions by Accept-Language.
// Keyed by the English string; anything missing stays in English.
type Dictionary = Record<string, string>;

const hi: Dictionary = {
  '1 tablet after food': 'खाने के बाद 1 गोली',
  '1 tablet': '1 गोली',
  '1 sachet in 1 litre water': '1 लीटर पानी में 1 पाउच',
  '1 tablet before food': 'खाने से पहले 1 गोली',
  'Sri Sai Clinic, Kukatpally, Hyderabad':
    'श्री साई क्लिनिक, कुकटपल्ली, हैदराबाद',
  Home: 'होम',
  Bookings: 'बुकिंग',
  Prescriptions: 'पर्चे',
  Profile: 'प्रोफ़ाइल',
  Consult: 'परामर्श',
  'Lab tests': 'लैब टेस्ट',
  Pharmacy: 'दवाखाना',
  Vaccines: 'टीके',
  'Heart care': 'हृदय देखभाल',
  Book: 'बुक करें',
  Reminders: 'रिमाइंडर',
  Family: 'परिवार',
  'General Physician': 'सामान्य चिकित्सक',
  Cardiologist: 'हृदय रोग विशेषज्ञ',
  Paediatrician: 'बाल रोग विशेषज्ञ',
  Orthopaedic: 'हड्डी रोग विशेषज्ञ',
  'Today, 5:30 PM': 'आज, शाम 5:30',
  'Tomorrow, 10:00 AM': 'कल, सुबह 10:00',
  'Today, 7:00 PM': 'आज, शाम 7:00',
  'Wed, 11:30 AM': 'बुध, सुबह 11:30',
  'Namaste, Ramesh garu': 'नमस्ते, रमेश जी',
  'How are you feeling today?': 'आज आप कैसा महसूस कर रहे हैं?',
  'Happy Diwali, Ramesh garu': 'दीपावली की शुभकामनाएँ, रमेश जी',
  'A healthy festival for you and your family':
    'आपके और आपके परिवार के लिए स्वस्थ त्योहार',
  'Quick actions': 'त्वरित सेवाएँ',
  'Doctors at Sri Sai Clinic': 'श्री साई क्लिनिक के डॉक्टर',
  'Popular services': 'लोकप्रिय सेवाएँ',
  'Festival health packages': 'त्योहार हेल्थ पैकेज',
  'Available this festival week': 'इस त्योहार सप्ताह उपलब्ध',
  'Free home sample pickup on lab tests above ₹499':
    '₹499 से ऊपर के लैब टेस्ट पर घर से सैंपल मुफ़्त',
  'Diwali offer: 25% off family health checkups till 25 Oct':
    'दिवाली ऑफ़र: 25 अक्टूबर तक फ़ैमिली हेल्थ चेकअप पर 25% छूट',
  'Full body checkup': 'फुल बॉडी चेकअप',
  'Thyroid profile': 'थायरॉइड प्रोफ़ाइल',
  'Diabetes screening': 'डायबिटीज़ जाँच',
  'Flu vaccine': 'फ़्लू का टीका',
  'Family checkup (4 members)': 'फ़ैमिली चेकअप (4 सदस्य)',
  'Burn and first-aid kit': 'बर्न और फ़र्स्ट-एड किट',
  Popular: 'लोकप्रिय',
  '20% off': '20% छूट',
  'Diwali 25% off': 'दिवाली 25% छूट',
  'Sweets season': 'मिठाई का मौसम',
  Diwali: 'दीपावली',
};

const te: Dictionary = {
  '1 tablet after food': 'భోజనం తర్వాత 1 మాత్ర',
  '1 tablet': '1 మాత్ర',
  '1 sachet in 1 litre water': '1 లీటరు నీటిలో 1 సాచెట్',
  '1 tablet before food': 'భోజనానికి ముందు 1 మాత్ర',
  'Sri Sai Clinic, Kukatpally, Hyderabad':
    'శ్రీ సాయి క్లినిక్, కూకట్‌పల్లి, హైదరాబాద్',
  Home: 'హోమ్',
  Bookings: 'బుకింగ్‌లు',
  Prescriptions: 'ప్రిస్క్రిప్షన్లు',
  Profile: 'ప్రొఫైల్',
  Consult: 'సంప్రదింపు',
  'Lab tests': 'ల్యాబ్ టెస్టులు',
  Pharmacy: 'ఫార్మసీ',
  Vaccines: 'టీకాలు',
  'Heart care': 'గుండె సంరక్షణ',
  Book: 'బుక్ చేయండి',
  Reminders: 'రిమైండర్లు',
  Family: 'కుటుంబం',
  'General Physician': 'జనరల్ ఫిజీషియన్',
  Cardiologist: 'గుండె వైద్య నిపుణులు',
  Paediatrician: 'పిల్లల వైద్య నిపుణులు',
  Orthopaedic: 'ఎముకల వైద్య నిపుణులు',
  'Today, 5:30 PM': 'ఈరోజు, సాయంత్రం 5:30',
  'Tomorrow, 10:00 AM': 'రేపు, ఉదయం 10:00',
  'Today, 7:00 PM': 'ఈరోజు, సాయంత్రం 7:00',
  'Wed, 11:30 AM': 'బుధ, ఉదయం 11:30',
  'Namaste, Ramesh garu': 'నమస్తే, రమేష్ గారు',
  'How are you feeling today?': 'ఈరోజు మీకు ఎలా ఉంది?',
  'Happy Diwali, Ramesh garu': 'దీపావళి శుభాకాంక్షలు, రమేష్ గారు',
  'A healthy festival for you and your family':
    'మీకు, మీ కుటుంబానికి ఆరోగ్యకరమైన పండుగ',
  'Quick actions': 'త్వరిత సేవలు',
  'Doctors at Sri Sai Clinic': 'శ్రీ సాయి క్లినిక్ వైద్యులు',
  'Popular services': 'ప్రముఖ సేవలు',
  'Festival health packages': 'పండుగ హెల్త్ ప్యాకేజీలు',
  'Available this festival week': 'ఈ పండుగ వారంలో అందుబాటులో',
  'Free home sample pickup on lab tests above ₹499':
    '₹499 పైన ల్యాబ్ టెస్టులకు ఇంటి వద్ద శాంపిల్ సేకరణ ఉచితం',
  'Diwali offer: 25% off family health checkups till 25 Oct':
    'దీపావళి ఆఫర్: అక్టోబర్ 25 వరకు ఫ్యామిలీ హెల్త్ చెకప్‌లపై 25% తగ్గింపు',
  'Full body checkup': 'ఫుల్ బాడీ చెకప్',
  'Thyroid profile': 'థైరాయిడ్ ప్రొఫైల్',
  'Diabetes screening': 'డయాబెటిస్ పరీక్ష',
  'Flu vaccine': 'ఫ్లూ టీకా',
  'Family checkup (4 members)': 'ఫ్యామిలీ చెకప్ (4 సభ్యులు)',
  'Burn and first-aid kit': 'బర్న్, ఫస్ట్-ఎయిడ్ కిట్',
  Popular: 'ప్రముఖం',
  '20% off': '20% తగ్గింపు',
  'Diwali 25% off': 'దీపావళి 25% తగ్గింపు',
  'Sweets season': 'స్వీట్ల సీజన్',
  Diwali: 'దీపావళి',
};

const dictionaries: Record<string, Dictionary> = { hi, te };

/** Returns a copy of any JSON value with every known English string swapped for its translation. */
export function localize<T>(value: T, language: string): T {
  const dictionary = dictionaries[language];
  if (!dictionary) return value;

  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return dictionary[node] ?? node;
    if (Array.isArray(node)) return node.map(walk);
    if (typeof node === 'object' && node !== null) {
      return Object.fromEntries(
        Object.entries(node).map(([key, child]) => [key, walk(child)]),
      );
    }
    return node;
  };
  return walk(value) as T;
}
