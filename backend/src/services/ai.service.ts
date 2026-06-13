import { OpenAI } from 'openai';

// Initialize OpenAI client if token exists
const apiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;
if (apiKey && apiKey !== 'YOUR_OPENAI_API_KEY') {
  openai = new OpenAI({ apiKey });
}

export interface LegalSuggestion {
  section_number: string;
  section_title: string;
  explanation: string;
  confidence_score: number;
}

export interface LandmarkJudgment {
  title: string;
  year: string;
  citation: string;
  relevance: string;
}

export interface AIAnalysisResult {
  bns: LegalSuggestion[];
  bnss: LegalSuggestion[];
  bsa: LegalSuggestion[];
  ipc: LegalSuggestion[];
  crpc: LegalSuggestion[];
  judgments: LandmarkJudgment[];
}

// Fallback rule-based database matching key terms
const LOCAL_LEGAL_DATABASE = [
  {
    keywords: ['murder', 'kill', 'death', 'homicide', 'stab', 'shoot', 'hatya'],
    result: {
      bns: [
        { section_number: 'Section 101', section_title: 'Murder', explanation: 'Defines murder when act causes death with intention or knowledge that act is likely to cause death.', confidence_score: 95 },
        { section_number: 'Section 103(1)', section_title: 'Punishment for Murder', explanation: 'Specifies punishment for murder which is death or imprisonment for life, and liability to fine.', confidence_score: 95 }
      ],
      bnss: [
        { section_number: 'Section 176', section_title: 'Inquest by Magistrate', explanation: 'Mandatory judicial/magisterial inquiry into the cause of suspicious death.', confidence_score: 85 },
        { section_number: 'Section 193', section_title: 'Report of Investigation', explanation: 'Submission of charge sheet to the Magistrate upon completing murder investigation.', confidence_score: 90 }
      ],
      bsa: [
        { section_number: 'Section 32(1)', section_title: 'Dying Declaration', explanation: 'Statements made by a person as to the cause of his/her death are highly relevant.', confidence_score: 90 }
      ],
      ipc: [
        { section_number: 'Section 300', section_title: 'Murder (IPC Equivalent)', explanation: 'Prior definition of murder corresponding to Section 101 of BNS.', confidence_score: 95 },
        { section_number: 'Section 302', section_title: 'Punishment for Murder (IPC Equivalent)', explanation: 'Prior punishment standard corresponding to Section 103 of BNS.', confidence_score: 95 }
      ],
      crpc: [
        { section_number: 'Section 174', section_title: 'Inquest Report', explanation: 'Police inquiry and report on suicide or unnatural deaths.', confidence_score: 85 }
      ],
      judgments: [
        { title: 'K.M. Nanavati v. State of Maharashtra', year: '1961', citation: '1962 AIR 605', relevance: 'Laid down conditions for sudden and grave provocation in homicide cases.' },
        { title: 'Bachchan Singh v. State of Punjab', year: '1980', citation: '(1980) 2 SCC 684', relevance: 'Established the "rarest of rare cases" doctrine for awarding capital punishment.' }
      ]
    }
  },
  {
    keywords: ['theft', 'steal', 'rob', 'burglar', 'broke in', 'jewelry', 'cash', 'shoplift', 'stole', 'chori'],
    result: {
      bns: [
        { section_number: 'Section 303', section_title: 'Theft', explanation: 'Dishonestly taking moveable property out of the possession of any person without consent.', confidence_score: 92 },
        { section_number: 'Section 305', section_title: 'Theft in Dwelling House', explanation: 'Aggravated theft committed inside a building, tent, or vessel used as human dwelling.', confidence_score: 90 }
      ],
      bnss: [
        { section_number: 'Section 173', section_title: 'Information in Cognizable Cases (FIR)', explanation: 'Filing of FIR for cognizable offence of theft.', confidence_score: 80 },
        { section_number: 'Section 185', section_title: 'Search by Police Officer', explanation: 'Allows investigation officer to search place for recovery of stolen property.', confidence_score: 85 }
      ],
      bsa: [
        { section_number: 'Section 119', section_title: 'Presumption of stolen property', explanation: 'Court may presume that a person who is in possession of stolen goods soon after the theft is either the thief or has received goods knowing them to be stolen.', confidence_score: 85 }
      ],
      ipc: [
        { section_number: 'Section 378', section_title: 'Theft (IPC Equivalent)', explanation: 'Old definition of theft matching BNS Section 303.', confidence_score: 92 },
        { section_number: 'Section 380', section_title: 'Theft in Dwelling House (IPC Equivalent)', explanation: 'Old definition matching BNS Section 305.', confidence_score: 90 }
      ],
      crpc: [
        { section_number: 'Section 102', section_title: 'Power of Police to Seize Property', explanation: 'Seizure of suspected stolen property by Investigating Officer.', confidence_score: 85 }
      ],
      judgments: [
        { title: 'State of Maharashtra v. Vishwanath', year: '1979', citation: '(1979) 4 SCC 23', relevance: 'Ruled that temporary deprivation of property is sufficient to constitute theft.' }
      ]
    }
  },
  {
    keywords: ['assault', 'beat', 'hit', 'hurt', 'slap', 'injure', 'fracture', 'wound', 'maar-peet', 'injury'],
    result: {
      bns: [
        { section_number: 'Section 115', section_title: 'Voluntarily Causing Hurt', explanation: 'Doing any act with the intention of thereby causing hurt to any person.', confidence_score: 90 },
        { section_number: 'Section 117', section_title: 'Voluntarily Causing Grievous Hurt', explanation: 'Causing permanent damage, bone fractures, or intense bodily pain.', confidence_score: 92 }
      ],
      bnss: [
        { section_number: 'Section 184', section_title: 'Medical Examination of Victim', explanation: 'Mandatory medical examination of injured victims within 24 hours.', confidence_score: 85 }
      ],
      bsa: [
        { section_number: 'Section 45', section_title: 'Opinions of Experts', explanation: 'Relevance of doctor/medical officer testimony in injury reports.', confidence_score: 80 }
      ],
      ipc: [
        { section_number: 'Section 323', section_title: 'Voluntarily Causing Hurt (IPC)', explanation: 'Old equivalent corresponding to Section 115 of BNS.', confidence_score: 90 },
        { section_number: 'Section 325', section_title: 'Punishment for Grievous Hurt (IPC)', explanation: 'Old equivalent corresponding to Section 117 of BNS.', confidence_score: 92 }
      ],
      crpc: [
        { section_number: 'Section 53', section_title: 'Medical Examination of Accused', explanation: 'Medical examination of arrested person by medical practitioner.', confidence_score: 75 }
      ],
      judgments: [
        { title: 'State of Karnataka v. Shivalingaiah', year: '1988', citation: '1988 AIR 115', relevance: 'Highlighted difference between simple hurt and intent to cause grievous hurt.' }
      ]
    }
  },
  {
    keywords: ['cheat', 'fraud', 'scam', 'forge', 'money', 'deceive', 'rupees', 'online', 'bank', 'dhokhadhadi'],
    result: {
      bns: [
        { section_number: 'Section 318', section_title: 'Cheating', explanation: 'Deceiving any person, fraudulently or dishonestly inducing delivery of property.', confidence_score: 90 },
        { section_number: 'Section 336', section_title: 'Forgery', explanation: 'Making false documents with intent to cause damage or injury to public or any person.', confidence_score: 85 }
      ],
      bnss: [
        { section_number: 'Section 105', section_title: 'Attachment of Property', explanation: 'Attachment of proceeds of crime generated through cheat/fraud operations.', confidence_score: 75 }
      ],
      bsa: [
        { section_number: 'Section 63', section_title: 'Admissibility of Electronic Records', explanation: 'Conditions under which digital transactions, SMS, logs are accepted.', confidence_score: 90 }
      ],
      ipc: [
        { section_number: 'Section 420', section_title: 'Cheating & Dishonestly Inducing Delivery (IPC)', explanation: 'Historic cheating section matching BNS Section 318.', confidence_score: 90 },
        { section_number: 'Section 468', section_title: 'Forgery for Cheating (IPC)', explanation: 'Historic forgery section matching BNS Section 336.', confidence_score: 85 }
      ],
      crpc: [
        { section_number: 'Section 91', section_title: 'Summons to Produce Documents', explanation: 'Calling bank accounts or digital statements from intermediaries.', confidence_score: 80 }
      ],
      judgments: [
        { title: 'State of Haryana v. Bhajan Lal', year: '1992', citation: '1992 Supp (1) SCC 335', relevance: 'Guidelines on when police should register FIR vs when dispute is purely civil.' }
      ]
    }
  },
  {
    keywords: ['kidnap', 'abduct', 'ransom', 'confine', 'apaharan'],
    result: {
      bns: [
        { section_number: 'Section 137', section_title: 'Kidnapping', explanation: 'Taking away any person from lawful guardianship without consent.', confidence_score: 92 },
        { section_number: 'Section 140', section_title: 'Kidnapping or Abduction for Ransom', explanation: 'Aggravated kidnapping where threat of death or hurt is issued for ransom.', confidence_score: 95 }
      ],
      bnss: [
        { section_number: 'Section 164', section_title: 'Recording of Statements', explanation: 'Recording victim or witness statements before a Magistrate.', confidence_score: 88 }
      ],
      bsa: [
        { section_number: 'Section 114', section_title: 'Presumptions of Facts', explanation: 'Court may presume certain facts related to the abduction custody.', confidence_score: 75 }
      ],
      ipc: [
        { section_number: 'Section 359', section_title: 'Kidnapping (IPC)', explanation: 'Historic classification corresponding to Section 137 of BNS.', confidence_score: 92 },
        { section_number: 'Section 364A', section_title: 'Kidnapping for Ransom (IPC)', explanation: 'Old statute matching Section 140 of BNS.', confidence_score: 95 }
      ],
      crpc: [
        { section_number: 'Section 164', section_title: 'Recording of Confessions and Statements', explanation: 'Provisions for magisterial deposition in kidnapping and minor abduction.', confidence_score: 88 }
      ],
      judgments: [
        { title: 'S. Varadarajan v. State of Madras', year: '1965', citation: '1965 AIR 942', relevance: 'Elucidates "taking" out of keeping of lawful guardian.' }
      ]
    }
  },
  {
    keywords: ['rape', 'sexual assault', 'molest', 'harass', 'consent', 'modesty', 'woman'],
    result: {
      bns: [
        { section_number: 'Section 63', section_title: 'Rape', explanation: 'Sexual intercourse with a woman against her will or without consent.', confidence_score: 96 },
        { section_number: 'Section 64', section_title: 'Punishment for Rape', explanation: 'Rigorous imprisonment not less than 10 years, extending to life.', confidence_score: 96 },
        { section_number: 'Section 74', section_title: 'Assault to Outrage Modesty', explanation: 'Assault or criminal force to woman with intent to outrage modesty.', confidence_score: 90 }
      ],
      bnss: [
        { section_number: 'Section 184', section_title: 'Medical Examination of Sexual Assault Victim', explanation: 'Mandatory clinical profiling and swabs taken by authorized practitioner.', confidence_score: 95 },
        { section_number: 'Section 176(1)', section_title: 'Recording Statement of Rape Victim', explanation: 'Must be recorded by a woman police officer at the residence of the victim.', confidence_score: 95 }
      ],
      bsa: [
        { section_number: 'Section 114A', section_title: 'Presumption as to Consent', explanation: 'Court shall presume absence of consent where victim states she did not consent.', confidence_score: 95 }
      ],
      ipc: [
        { section_number: 'Section 375', section_title: 'Rape (IPC)', explanation: 'Old definition of rape matched to BNS Section 63.', confidence_score: 96 },
        { section_number: 'Section 376', section_title: 'Punishment for Rape (IPC)', explanation: 'Old penal section matched to BNS Section 64.', confidence_score: 96 },
        { section_number: 'Section 354', section_title: 'Outraging Modesty of Woman (IPC)', explanation: 'Old section matched to BNS Section 74.', confidence_score: 90 }
      ],
      crpc: [
        { section_number: 'Section 164A', section_title: 'Medical Examination of Rape Victim', explanation: 'Procedural rules corresponding to BNSS Section 184.', confidence_score: 95 }
      ],
      judgments: [
        { title: 'Mukesh v. State for NCT of Delhi (Nirbhaya Case)', year: '2017', citation: '(2017) 6 SCC 1', relevance: 'Confirmed capital punishment and detailed rigorous standards for rape investigations.' }
      ]
    }
  }
];

// Default fallback response if no match
const DEFAULT_LEGAL_RESPONSE: AIAnalysisResult = {
  bns: [
    { section_number: 'Section 292', section_title: 'Public Nuisance / General Crimes', explanation: 'Applicable general penal guidelines under the Bharatiya Nyaya Sanhita.', confidence_score: 60 }
  ],
  bnss: [
    { section_number: 'Section 173', section_title: 'FIR Registration', explanation: 'Registration and preliminary investigation framework.', confidence_score: 75 }
  ],
  bsa: [
    { section_number: 'Section 60', section_title: 'Oral Evidence', explanation: 'General standard of primary and oral witness statements.', confidence_score: 70 }
  ],
  ipc: [
    { section_number: 'Section 290', section_title: 'Public Nuisance (IPC)', explanation: 'Historic general criminal charge corresponding to BNS Section 292.', confidence_score: 60 }
  ],
  crpc: [
    { section_number: 'Section 154', section_title: 'Cognizable Information', explanation: 'Pre-existing structure for logging FIR details.', confidence_score: 75 }
  ],
  judgments: [
    { title: 'Lalita Kumari v. Govt. of U.P.', year: '2014', citation: '(2014) 2 SCC 1', relevance: 'Mandated that registering an FIR is compulsory under CrPC Section 154 if information discloses a cognizable offence.' }
  ]
};

export async function analyzeNarrative(narrative: string): Promise<AIAnalysisResult> {
  const normalized = narrative.toLowerCase();

  // 1. Try to use OpenAI API
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert Indian Legal AI advisor. Analyze the police incident narrative and suggest the correct sections of:
1. BNS (Bharatiya Nyaya Sanhita)
2. BNSS (Bharatiya Nagarik Suraksha Sanhita)
3. BSA (Bharatiya Sakshya Adhiniyam)
4. Related IPC (Indian Penal Code) references
5. Related CrPC (Code of Criminal Procedure) references
6. Relevant landmark judgments of Supreme Court / High Courts.

For each category, provide:
- section_number (string)
- section_title (string)
- explanation (string, brief summary of applicability)
- confidence_score (number, between 10 and 100)

For Judgments, provide:
- title
- year
- citation
- relevance (brief applicability)

Return the output strictly in the following JSON format:
{
  "bns": [{"section_number": "", "section_title": "", "explanation": "", "confidence_score": 90}],
  "bnss": [{"section_number": "", "section_title": "", "explanation": "", "confidence_score": 85}],
  "bsa": [{"section_number": "", "section_title": "", "explanation": "", "confidence_score": 80}],
  "ipc": [{"section_number": "", "section_title": "", "explanation": "", "confidence_score": 90}],
  "crpc": [{"section_number": "", "section_title": "", "explanation": "", "confidence_score": 85}],
  "judgments": [{"title": "", "year": "", "citation": "", "relevance": ""}]
}`
          },
          {
            role: 'user',
            content: `Incident Narrative: "${narrative}"`
          }
        ]
      });

      const text = response.choices[0]?.message?.content;
      if (text) {
        return JSON.parse(text) as AIAnalysisResult;
      }
    } catch (err: any) {
      console.warn('⚠️ OpenAI API failed. Using local keyword analysis. Error:', err.message);
    }
  }

  // 2. Local Fallback Mode
  console.log('🤖 Running offline legal recommendation engine...');
  
  // Find matches
  const matches: AIAnalysisResult[] = [];
  for (const item of LOCAL_LEGAL_DATABASE) {
    const matchedKeyword = item.keywords.some(kw => normalized.includes(kw));
    if (matchedKeyword) {
      matches.push(item.result);
    }
  }

  if (matches.length === 0) {
    return DEFAULT_LEGAL_RESPONSE;
  }

  // Merge matches
  const merged: AIAnalysisResult = {
    bns: [],
    bnss: [],
    bsa: [],
    ipc: [],
    crpc: [],
    judgments: []
  };

  const seenBns = new Set<string>();
  const seenBnss = new Set<string>();
  const seenBsa = new Set<string>();
  const seenIpc = new Set<string>();
  const seenCrpc = new Set<string>();
  const seenJudg = new Set<string>();

  for (const m of matches) {
    m.bns.forEach(x => { if (!seenBns.has(x.section_number)) { seenBns.add(x.section_number); merged.bns.push(x); } });
    m.bnss.forEach(x => { if (!seenBnss.has(x.section_number)) { seenBnss.add(x.section_number); merged.bnss.push(x); } });
    m.bsa.forEach(x => { if (!seenBsa.has(x.section_number)) { seenBsa.add(x.section_number); merged.bsa.push(x); } });
    m.ipc.forEach(x => { if (!seenIpc.has(x.section_number)) { seenIpc.add(x.section_number); merged.ipc.push(x); } });
    m.crpc.forEach(x => { if (!seenCrpc.has(x.section_number)) { seenCrpc.add(x.section_number); merged.crpc.push(x); } });
    m.judgments.forEach(x => { if (!seenJudg.has(x.title)) { seenJudg.add(x.title); merged.judgments.push(x); } });
  }

  return merged;
}
