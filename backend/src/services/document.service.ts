import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';

export interface DocumentData {
  caseNumber: string;
  firNumber: string;
  policeStation: string;
  date: string;
  officerName: string;
  victimName: string;
  accusedName: string;
  accusedAddress: string;
  crimeType: string;
  location: string;
  customBody?: string;
  seizedItems?: string; // For seizure memo
}

const TEMPLATES: Record<string, Record<string, { title: string; body: (d: DocumentData) => string }>> = {
  mr: {
    remand: {
      title: 'पोलीस कोठडी रिमांडसाठी अर्ज',
      body: (d: DocumentData) => `प्रति,\nमा. महानगर दंडाधिकारी साहेब\nजिल्हा न्यायालय, नवी दिल्ली\n\nविषय: आरोपी ${d.accusedName} ची पोलीस कोठडी रिमांड मिळणेबाबत अर्ज (भारतीय नागरिक सुरक्षा संहिता कलम १८७ / CrPC १६७ अन्वये)\n\nमहोदय/महोदया,\n\nगुन्हा नोंद क्र. ${d.caseNumber} (FIR क्र. ${d.firNumber} दिनांक ${d.date}, पोलीस ठाणे: ${d.policeStation}, गुन्हा: ${d.crimeType}) च्या तपासाच्या अनुषंगाने आरोपी ${d.accusedName}, राहणार: ${d.accusedAddress} यास दिनांक ${d.date} रोजी ${d.location} येथून अटक करण्यात आली आहे.\n\nचौकशीदरम्यान आरोपीने गुन्ह्यातील मुद्देमाल व गुन्ह्यात वापरलेले हत्यार लपविलेले ठिकाण उघड केलेले नाही. पुढील कारणांसाठी पोलीस कोठडी अत्यंत आवश्यक आहे:\n१. चोरीला गेलेला मुद्देमाल व गुन्ह्यात वापरलेले हत्यार हस्तगत करण्यासाठी.\n२. उपलब्ध पुरावे आणि साक्षीदारांच्या साक्ष्यांसोबत आरोपीची समोरासमोर चौकशी करण्यासाठी.\n३. या कटात सामील असलेल्या इतर सह-आरोपींचा शोध घेण्यासाठी.\n\nतरी न्यायदानाच्या हितासाठी आरोपी ${d.accusedName} यास १४ दिवसांची पोलीस कोठडी मंजूर करावी, ही नम्र विनंती.\n\nदिनांक: ${new Date().toLocaleDateString()}\nतपास अधिकारी: ${d.officerName}\nपदनाम: IO, ${d.policeStation}`
    },
    medical: {
      title: 'वैद्यकीय तपासणीसाठी विनंती पत्र',
      body: (d: DocumentData) => `प्रति,\nवैद्यकीय अधीक्षक साहेब\nराम मनोहर लोहिया रुग्णालय, नवी दिल्ली\n\nविषय: आरोपी ${d.accusedName} च्या वैद्यकीय तपासणीबाबत (BNSS कलम ५१ / CrPC ५३ अन्वये)\n\nमहोदय,\n\nमी याद्वारे आरोपी ${d.accusedName}, राहणार: ${d.accusedAddress} यास आपल्याकडे वर्ग करीत आहे. सदर आरोपीला पोलीस ठाणे ${d.policeStation} येथील गुन्हा नोंद क्र. ${d.caseNumber} (FIR क्र. ${d.firNumber}) मधील गुन्हा ${d.crimeType} च्या तपासाकामी अटक करण्यात आले आहे.\n\nआपणास विनंती आहे की, कृपया सदर आरोपीची सखोल वैद्यकीय तपासणी करून खालील बाबी प्रमाणित कराव्यात:\n१. शरीरावर असलेल्या दृश्य जखमांचे व खुणांचे स्वरूप आणि त्याचा कालावधी.\n२. आरोपीची चौकशी करण्यासाठीची शारीरिक व मानसिक स्थिती.\n३. स्वतःला इजा पोहोचवल्याच्या कोणत्याही खुणा.\n\nकृपया वैद्यकीय तपासणी अहवाल (MLC) तीन प्रतींमध्ये देण्यात यावा.\n\nदिनांक: ${new Date().toLocaleDateString()}\nतपास अधिकारी: ${d.officerName}\nपदनाम: IO, ${d.policeStation}`
    },
    seizure: {
      title: 'जब्ती पंचनामा / जप्ती Memo रसीद',
      body: (d: DocumentData) => `पोलीस विभाग - जप्ती पंचनामा\n(भारतीय नागरिक सुरक्षा संहिता कलम १८५ / CrPC १०२ अन्वये)\n\nकेस क्रमांक: ${d.caseNumber}\nFIR क्रमांक: ${d.firNumber}\nपोलीस ठाणे: ${d.policeStation}\nगुन्ह्याचा प्रकार: ${d.crimeType}\n\nआज दिनांक ${new Date().toLocaleDateString()} रोजी पंचांच्या समक्ष, आरोपी ${d.accusedName} याच्या ताब्यातील घडलेल्या ठिकाणावरून ${d.location} खालील मुद्देमाल जप्त करून पोलीस ताब्यात घेण्यात आला आहे:\n\nजप्त मुद्देमालाचा तपशील:\n${d.seizedItems || '१. लॅपटॉप बॅग आणि इलेक्ट्रॉनिक कागदपत्रे\n२. संशयास्पद आर्थिक व्यवहाराचे दस्तऐवज'}\n\nसदर जप्तीची कारवाई कायदेशीर व शांततापूर्ण मार्गाने करण्यात आली आहे. या रसीदची एक प्रत आरोपीला/आरोपीच्या प्रतिनिधीला सोपवण्यात आली आहे.\n\nसाक्षीदार १ नाव आणि सही: ___________________\nसाक्षीदार २ नाव आणि सही: ___________________\n\nदिनांक: ${new Date().toLocaleDateString()}\nतपास अधिकारी: ${d.officerName}\nपदनाम: IO, ${d.policeStation}`
    },
    custody: {
      title: 'न्यायिक कोठडी (जेल) पाठवणी अर्ज',
      body: (d: DocumentData) => `प्रति,\nकारागृह अधीक्षक साहेब\nतिहार कारागृह संकुल, नवी दिल्ली\n\nविषय: आरोपी ${d.accusedName} यास न्यायिक कोठडी (Judicial Custody) सुनावणीसाठी हजर करणेबाबत\n\nमहोदय,\n\nयाद्वारे पोलीस ठाणे ${d.policeStation} मधील गुन्हा नोंद क्र. ${d.caseNumber} (FIR क्र. ${d.firNumber}) मधील गुन्ह्याच्या तपासाकामी अटक आरोपी ${d.accusedName}, राहणार: ${d.accusedAddress} यास न्यायालयात हजर करण्यात येत आहे.\n\nआरोपीची पोलीस कोठडीतील चौकशी पूर्ण झाली असून आता त्याची पोलीस कोठडीची आवश्यकता नाही. म्हणूनच त्यास न्यायालयीन मंजुरीनुसार न्यायिक कोठडीत पाठवण्यात येत आहे.\n\nतरी आपल्या कारागृहात आगामी न्यायालयीन तारखेपर्यंत न्यायिक कोठडीत आरोपीस दाखल करून घेण्याची व्यवस्था व्हावी.\n\nदिनांक: ${new Date().toLocaleDateString()}\nतपास अधिकारी: ${d.officerName}\nपदनाम: IO, ${d.policeStation}`
    }
  },
  en: {
    remand: {
      title: 'APPLICATION FOR POLICE REMAND',
      body: (d: DocumentData) => `TO,\nTHE HONORABLE METROPOLITAN MAGISTRATE\nDISTRICT COURT, NEW DELHI\n\nSubject: Request for Police Custody Remand of Accused ${d.accusedName} (Under Section 187 BNSS / 167 CrPC)\n\nRespected Sir/Madam,\n\nIn connection with the investigation of Case No. ${d.caseNumber} (registered under FIR No. ${d.firNumber} dated ${d.date} for the offense of ${d.crimeType} at ${d.policeStation}), it is respectfully submitted that the accused, ${d.accusedName}, r/o ${d.accusedAddress}, was arrested on ${d.date} at ${d.location}.\n\nDuring initial interrogation, the accused has been evasive and has not disclosed the location of the proceeds of crime or the weapons used. Police custody is essential for the following reasons:\n1. To recover the stolen properties / weapon of offense.\n2. To confront the accused with available evidence and witnesses.\n3. To identify other co-accused individuals involved in the conspiracy.\n\nIt is, therefore, prayed that the accused ${d.accusedName} may kindly be remanded to Police Custody for a period of 14 days in the interest of justice.\n\nDate: ${new Date().toLocaleDateString()}\nInvestigating Officer: ${d.officerName}\nDesignation: IO, ${d.policeStation}`
    },
    medical: {
      title: 'REQUISITION FOR MEDICAL EXAMINATION',
      body: (d: DocumentData) => `TO,\nTHE MEDICAL SUPERINTENDENT\nRAM MANOHAR LOHIA HOSPITAL, NEW DELHI\n\nSubject: Request for Medical Examination of Accused ${d.accusedName} (Under Section 51 BNSS / 53 CrPC)\n\nSir/Madam,\n\nI am forwarding herewith accused person namely ${d.accusedName}, resident of ${d.accusedAddress}, who has been arrested in connection with Case No. ${d.caseNumber} (FIR No. ${d.firNumber}) at ${d.policeStation} for committing the offense of ${d.crimeType}.\n\nYou are requested to kindly perform a comprehensive medical examination of the said accused and verify:\n1. Any visible physical marks of injuries and their duration.\n2. General health status and fitness for interrogation.\n3. Any signs of self-inflicted injuries.\n\nPlease furnish the official Medical Examination Report (MLC) in triplicate.\n\nDate: ${new Date().toLocaleDateString()}\nInvestigating Officer: ${d.officerName}\nDesignation: IO, ${d.policeStation}`
    },
    seizure: {
      title: 'SEIZURE MEMO / RECEIPT',
      body: (d: DocumentData) => `POLICE DEPARTMENT - SEIZURE MEMO\n(Under Section 185 BNSS / 102 CrPC)\n\nCase Number: ${d.caseNumber}\nFIR Number: ${d.firNumber}\nPolice Station: ${d.policeStation}\nOffense details: ${d.crimeType}\n\nToday on ${new Date().toLocaleDateString()}, in the presence of witnesses, the following items have been seized and taken into police possession from the custody/possession of the accused ${d.accusedName} at ${d.location}:\n\nSEIZED ITEMS:\n${d.seizedItems || '1. Laptop bags & electronic records\n2. Incriminating financial documents'}\n\nThe seizure was conducted in a peaceful manner. A copy of this receipt is handed over to the accused / representative of the accused.\n\nWitness 1 Name & Signature: ___________________\nWitness 2 Name & Signature: ___________________\n\nDate: ${new Date().toLocaleDateString()}\nInvestigating Officer: ${d.officerName}\nDesignation: IO, ${d.policeStation}`
    },
    custody: {
      title: 'REQUISITION FOR JUDICIAL CUSTODY',
      body: (d: DocumentData) => `TO,\nTHE SUPERINTENDENT OF JAIL\nTIHAR PRISON COMPLEX, NEW DELHI\n\nSubject: Production of Accused ${d.accusedName} for Judicial Custody Remand\n\nSir/Madam,\n\nHerewith is produced accused ${d.accusedName}, resident of ${d.accusedAddress}, who was arrested on ${d.date} in Case No. ${d.caseNumber} (FIR No. ${d.firNumber}) under Section ${d.crimeType} of BNS / IPC, registered at ${d.policeStation}.\n\nAs the police interrogation has been completed and the accused is no longer required for active police remand, he is being forwarded to judicial custody.\n\nIt is requested that the accused be admitted to judicial custody inside your jail premises until the next date of court production.\n\nDate: ${new Date().toLocaleDateString()}\nInvestigating Officer: ${d.officerName}\nDesignation: IO, ${d.policeStation}`
    }
  },
  hi: {
    remand: {
      title: 'पुलिस रिमांड के लिए आवेदन पत्र',
      body: (d: DocumentData) => `सेवा में,\nमाननीय महानगर मजिस्ट्रेट\nजिला न्यायालय, नई दिल्ली\n\nविषय: आरोपी ${d.accusedName} की पुलिस कस्टडी रिमांड हेतु आवेदन (भारतीय नागरिक सुरक्षा संहिता की धारा 187 / CrPC 167 के तहत)\n\nमहोदय/महोदया,\n\nनिवेदन है कि मामला संख्या ${d.caseNumber} (FIR संख्या ${d.firNumber} दिनांक ${d.date}, थाना: ${d.policeStation}, अपराध: ${d.crimeType}) की जांच के सिलसिले में, आरोपी ${d.accusedName}, निवासी ${d.accusedAddress} को ${d.date} को ${d.location} से गिरफ्तार किया गया था।\n\nपूछताछ के दौरान आरोपी टालमटोल कर रहा है और उसने अपराध से संबंधित चोरी का सामान या हथियार का स्थान प्रकट नहीं किया है। पुलिस कस्टडी निम्नलिखित कारणों से आवश्यक है:\n1. चोरी की संपत्ति / अपराध में इस्तेमाल हथियार की बरामदगी के लिए।\n2. उपलब्ध साक्ष्यों और गवाहों के साथ आरोपी का आमना-सामना कराने के लिए।\n3. साजिश में शामिल अन्य सह-आरोपियों की पहचान करने के लिए।\n\nअतः प्रार्थना है कि न्याय के हित में आरोपी ${d.accusedName} को 14 दिनों के लिए पुलिस कस्टडी रिमांड में भेजने की कृपा करें\n\nदिनांक: ${new Date().toLocaleDateString()}\nजांच अधिकारी: ${d.officerName}\nपद: IO, ${d.policeStation}`
    },
    medical: {
      title: 'चिकित्सकीय परीक्षण हेतु अनुरोध पत्र',
      body: (d: DocumentData) => `सेवा में,\nचिकित्सा अधीक्षक\nराम मनोहर लोहिया अस्पताल, नई दिल्ली\n\nविषय: आरोपी ${d.accusedName} के चिकित्सकीय परीक्षण हेतु (BNSS धारा 51 / CrPC 53 के तहत)\n\nमहोदय,\n\nमैं इसके द्वारा आरोपी ${d.accusedName}, निवासी ${d.accusedAddress} को भेज रहा हूँ, जिसे थाना ${d.policeStation} के अंतर्गत मामला संख्या ${d.caseNumber} (FIR संख्या ${d.firNumber}) में अपराध ${d.crimeType} के तहत गिरफ्तार किया गया है।\n\nआपसे अनुरोध है कि उक्त आरोपी का विस्तृत चिकित्सकीय परीक्षण करें और प्रमाणित करें:\n1. शरीर पर चोट के कोई दृश्य निशान और उनकी अवधि।\n2. पूछताछ के लिए सामान्य स्वास्थ्य स्थिति और फिटनेस।\n3. स्वयं को पहुंचाई गई चोटों के कोई लक्षण।\n\nकृपया आधिकारिक चिकित्सकीय रिपोर्ट (MLC) तीन प्रतियों में प्रदान करें।\n\nदिनांक: ${new Date().toLocaleDateString()}\nजांच अधिकारी: ${d.officerName}\nपद: IO, ${d.policeStation}`
    },
    seizure: {
      title: 'जब्ती सूची / रसीद',
      body: (d: DocumentData) => `पुलिस विभाग - जब्ती ज्ञापन\n(BNSS धारा 185 / CrPC 102 के तहत)\n\nमामला संख्या: ${d.caseNumber}\nFIR संख्या: ${d.firNumber}\nथाना: ${d.policeStation}\nअपराध का विवरण: ${d.crimeType}\n\nआज दिनांक ${new Date().toLocaleDateString()} को गवाहों की उपस्थिति में, आरोपी ${d.accusedName} के कब्जे/स्थान ${d.location} से निम्नलिखित सामान जब्त कर पुलिस कब्जे में लिया गया है:\n\nजब्त सामान की सूची:\n${d.seizedItems || '1. लैपटॉप बैग और इलेक्ट्रॉनिक रिकॉर्ड\n2. आपत्तिजनक वित्तीय दस्तावेज'}\n\nजब्ती की कार्रवाई शांतिपूर्ण ढंग से की गई। इस रसीद की एक प्रति आरोपी / आरोपी के प्रतिनिधि को सौंप दी गई है।\n\nगवाह 1 नाम और हस्ताक्षर: ___________________\nगवाह 2 नाम और हस्ताक्षर: ___________________\n\nदिनांक: ${new Date().toLocaleDateString()}\nजांच अधिकारी: ${d.officerName}\nपद: IO, ${d.policeStation}`
    },
    custody: {
      title: 'न्यायिक हिरासत के लिए आवेदन पत्र',
      body: (d: DocumentData) => `सेवा में,\nजेल अधीक्षक\nतिहाड़ जेल परिसर, नई दिल्ली\n\nविषय: आरोपी ${d.accusedName} को न्यायिक हिरासत (Judicial Custody) में भेजने हेतु\n\nमहोदय,\n\nथाना ${d.policeStation} में दर्ज मामला संख्या ${d.caseNumber} (FIR संख्या ${d.firNumber}) के तहत गिरफ्तार आरोपी ${d.accusedName}, निवासी ${d.accusedAddress} को पुलिस पूछताछ पूरी होने के बाद न्यायिक हिरासत हेतु प्रस्तुत किया जा रहा है।\n\nचूंकि पुलिस पूछताछ पूरी हो चुकी है और अब आरोपी की पुलिस हिरासत की आवश्यकता नहीं है, इसलिए इसे न्यायिक हिरासत में भेजा जा रहा है।\n\nअनुरोध है कि आरोपी को आगामी अदालती पेशी की तारीख तक अपनी जेल परिसर में न्यायिक हिरासत में रखने की व्यवस्था करें।\n\nदिनांक: ${new Date().toLocaleDateString()}\nजांच अधिकारी: ${d.officerName}\nपद: IO, ${d.policeStation}`
    }
  },
  gu: {
    remand: {
      title: 'પોલીસ રિમાન્ડ માટેની અરજી',
      body: (d: DocumentData) => `પ્રતિ,\nમાનનીય મેટ્રોપોલિટન મેજિસ્ટ્રેટ સાહેબ\nજિલ્લા અદાલત, નવી દિલ્હી\n\nવિષય: આરોપી ${d.accusedName} ની પોલીસ કસ્ટડી રિમાન્ડ માટેની વિનંતી (BNSS ની કલમ 187 / CrPC 167 હેઠળ)\n\nમાનનીય સાહેબ/મેડમ,\n\nગુના રજિસ્ટર નંબર ${d.caseNumber} (FIR નંબર ${d.firNumber} તારીખ ${d.date}, પોલીસ સ્ટેશન: ${d.policeStation}, ગુનો: ${d.crimeType}) ની તપાસના સંબંધમાં સવિનય જણાવવાનું કે આરોપી ${d.accusedName}, રહેવાસી ${d.accusedAddress} ને તારીખ ${d.date} ના રોજ ${d.location} ખાતેથી ધરપકડ કરવામાં આવી હતી.\n\nઆરોપી પૂછપરછ દરમિયાન યોગ્ય જવાબ આપતો નથી અને ગુનાની ચોરી કરેલ માલમત્તા કે ગુનામાં વપરાયેલ હથિયારની જગ્યા બતાવી નથી. નીચેના કારણોસર પોલીસ કસ્ટડી અનિવાર્ય છે:\n1. ગુનામાં વપરાયેલ હથિયાર / ચોરીની મિલકત શોધી કાઢવા માટે.\n2. આરોપીનો પુરાવા અને સાક્ષીઓ સાથે સામનો કરાવવા માટે.\n3. કાવતરામાં સામેલ અન્ય સહ-આરોપીઓની ઓળખ કરવા માટે.\n\nતેથી નમ્ર વિનંતી છે કે ન્યાયના હિતમાં આરોપી ${d.accusedName} ને ૧૪ દિવસની પોલીસ કસ્ટડી રિમાન્ડ પર મોકલવાનો હુકમ કરવા કૃપા કરશો.\n\nતારીખ: ${new Date().toLocaleDateString()}\nતપાસ કરનાર અધિકારી: ${d.officerName}\nહોદ્દો: IO, ${d.policeStation}`
    },
    medical: {
      title: 'તબીબી તપાસ માટેની વિનંતી',
      body: (d: DocumentData) => `પ્રતિ,\nતબીબી અધિક્ષકશ્રી\nરામ મનોહર લોહિયા હોસ્પિટલ, નવી દિલ્હી\n\nવિષય: આરોપી ${d.accusedName} ની તબીબી તપાસ કરવા બાબત (BNSS કલમ 51 / CrPC 53 હેઠળ)\n\nસાહેબશ્રી,\n\nઆથી હું આરોપી ${d.accusedName}, રહેવાસી ${d.accusedAddress} ને મોકલી રહ્યો છું, જેની ધરપકડ કેસ નંબર ${d.caseNumber} (FIR નંબર ${d.firNumber}), પોલીસ સ્ટેશન ${d.policeStation} ના ગુના ${d.crimeType} ના કામે કરવામાં આવી છે.\n\nઆપને નમ્ર વિનંતી છે કે સદર આરોપીની તબીબી તપાસ કરી નીચેની બાબતો પ્રમાણિત કરશો:\n1. શરીર પરના ઈજાના નિશાનો અને તેનો સમયગાળો.\n2. પૂછપરછ માટે સામાન્ય શારીરિક અને માનસિક સ્થિતિ.\n3. સ્વ-ઈજાના કોઈપણ ચિહ્નો.\n\nકૃપા કરીને તબીબી તપાસ અહેવાલ (MLC) ત્રણ નકલોમાં આપવા કૃપા કરશો.\n\nતારીખ: ${new Date().toLocaleDateString()}\nતપાસ કરનાર અધિકારી: ${d.officerName}\nહોદ્દો: IO, ${d.policeStation}`
    },
    seizure: {
      title: 'જપ્તી મેમો / રસીદ',
      body: (d: DocumentData) => `પોલીસ વિભાગ - જપ્તી પત્રક\n(BNSS કલમ 185 / CrPC 102 હેઠળ)\n\nકેસ નંબર: ${d.caseNumber}\nFIR નંબર: ${d.firNumber}\nપોલીસ સ્ટેશન: ${d.policeStation}\nગુનાની વિગત: ${d.crimeType}\n\nઆજ રોજ તારીખ ${new Date().toLocaleDateString()} ના રોજ પંચોની હાજરીમાં આરોપી ${d.accusedName} ના કબજા/સ્થળ ${d.location} માંથી નીચેની વિગતેની વસ્તુઓ જપ્ત કરી પોલીસ કબ્જામાં લેવામાં આવી છે:\n\nજપ્ત કરેલ મુદામાલની વિગત:\n${d.seizedItems || '1. લેપટોપ બેગ અને ઇલેક્ટ્રોનિક દસ્તાવેજો\n2. નાણાકીય વ્યવહારોના શંકાસ્પદ કાગળો'}\n\nજપ્તીની કાર્યવાહી શાંતિપૂર્ણ રીતે પૂર્ણ કરવામાં આવી. આ રસીદની એક નકલ આરોપીને સુપ્રત કરવામાં આવી છે.\n\nસાક્ષી ૧ નામ અને સહી: ___________________\nસાક્ષી ૨ નામ અને સહી: ___________________\n\nતારીખ: ${new Date().toLocaleDateString()}\nતપાસ કરનાર અધિકારી: ${d.officerName}\nહોદ્દો: IO, ${d.policeStation}`
    },
    custody: {
      title: 'ન્યાયિક કસ્ટડી (જેલ) માં મોકલવા માટેની અરજી',
      body: (d: DocumentData) => `પ્રતિ,\nજેલ સુપ્રિન્ટેન્ડેન્ટશ્રી\nતિહાર જેલ સંકુલ, નવી દિલ્હી\n\nવિષય: આરોપી ${d.accusedName} ને જ્યુડિશિયલ કસ્ટડી (ન્યાયિક કસ્ટડી) માં મોકલવા બાબત\n\nસાહેબશ્રી,\n\nપોલીસ સ્ટેશન ${d.policeStation} ના કેસ નંબર ${d.caseNumber} (FIR નંબર ${d.firNumber}) હેઠળ ધરપકડ કરાયેલ આરોપી ${d.accusedName}, રહેવાસી ${d.accusedAddress} ની પોલીસ પૂછપરછ પૂર્ણ થતાં તેને ન્યાયિક કસ્ટડીમાં મોકલવા રજૂ કરવામાં આવેલ છે.\n\nજ્યારે આરોપીની સઘન પૂછપરછ પૂર્ણ થઈ ગયેલ છે અને પોલીસ રિમાન્ડની હવે કોઈ જરૂર નથી, તેથી તેને ન્યાયિક કસ્ટડીમાં સોંપવામાં આવે છે.\n\nઆથી વિનંતી છે કે અદાલતના આગામી હુકમ સુધી આરોપીને આપની જેલ કસ્ટડીમાં રાખવા વ્યવસ્થા કરશો.\n\nતારીખ: ${new Date().toLocaleDateString()}\nતપાસ કરનાર અધિકારી: ${d.officerName}\nહોદ્દો: IO, ${d.policeStation}`
    }
  }
};

export function getDocumentContent(type: 'remand' | 'medical' | 'seizure' | 'custody', lang: 'en' | 'hi' | 'gu' | 'mr', data: DocumentData): { title: string; body: string } {
  const langTemplates = TEMPLATES[lang] || TEMPLATES['en'];
  const template = langTemplates[type] || langTemplates['remand'];
  
  return {
    title: template.title,
    body: data.customBody || template.body(data)
  };
}

// PDF Generation using PDFKit
export function generatePDFBuffer(title: string, body: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Design layout - Police official look
    // Top border
    doc.rect(20, 20, 572, 752).stroke('#0a192f');
    
    // Header
    doc.fillColor('#0a192f')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('CRIMEGPT STATE LEGAL PORTAL', { align: 'center' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#64748b')
       .text('INTELLIGENT POLICE DOCUMENTATION ENGINE', { align: 'center' })
       .moveDown(0.5);

    // Decorative line
    doc.moveTo(40, 60).lineTo(572, 60).stroke('#d97706');
    doc.moveDown(1.5);

    // Document Title (Centered, boxed)
    doc.fillColor('#0a192f')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text(title, { align: 'center', underline: true })
       .moveDown(2);

    // Body
    doc.fillColor('#1e293b')
       .fontSize(11)
       .font('Helvetica')
       .text(body, {
         align: 'left',
         lineGap: 6
       });

    // Signature stamp space at bottom
    doc.moveDown(3);
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('OFFICIAL SIGNATURE / SEAL', 400, doc.y)
       .moveDown(0.5);
    
    // Draw signature line
    doc.moveTo(400, doc.y + 40).lineTo(520, doc.y + 40).stroke('#94a3b8');

    doc.end();
  });
}

// DOCX Generation using docx package
export async function generateDocxBuffer(title: string, body: string): Promise<Buffer> {
  const lines = body.split('\n');
  const paragraphs = lines.map(line => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          font: 'Calibri',
          size: 22, // 11pt
          color: '1e293b'
        })
      ],
      spacing: {
        after: 120 // 6pt space after
      }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: 'CRIMEGPT STATE LEGAL PORTAL',
              font: 'Calibri',
              bold: true,
              size: 32, // 16pt
              color: '0a192f'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({
              text: title,
              font: 'Calibri',
              bold: true,
              size: 26, // 13pt
              color: 'd97706',
              underline: {}
            })
          ]
        }),
        // Main body paragraphs
        ...paragraphs
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
