/**
 * CIPHER AI Bilingual Investigative Intelligence Engine
 * Supports English, Hindi (Devanagari), and natural Hinglish (Romanized conversational Hindi).
 * Performs automatic language detection, conversational context tracking, and grounded evidence retrieval.
 */

export type SupportedLanguage = "en" | "hi" | "hinglish";
export type LanguagePreference = "auto" | "en" | "hi";

export interface ChatMessageContext {
  role: "user" | "assistant";
  content: string;
}

export interface AIQueryInput {
  query: string;
  investigationId?: string;
  languagePreference?: LanguagePreference;
  history?: ChatMessageContext[];
}

export interface AIQueryResponse {
  detectedLanguage: SupportedLanguage;
  responseLanguage: SupportedLanguage;
  text: string;
  answerSummary: string;
  evidenceLinks: Array<{ id: string; name: string }>;
  relatedEntities: string[];
  confidence: string;
  sourceReferences: string[];
}

// Lexicon for detecting Hinglish words (excluding common English homographs like the, me, to, do)
const HINGLISH_KEYWORDS = new Set([
  "kya", "kyun", "kyu", "kaun", "kon", "kis", "kiska", "kisko", "kahan", "kab", "kaise",
  "hai", "hain", "tha", "thi", "hoga", "honge", "hogi",
  "ye", "yeh", "wo", "woh", "iska", "iske", "iski", "uske", "uska", "uski", "inhe", "unhe",
  "dikhao", "batao", "bataiye", "samjhao", "dijiye", "karo", "kijiye", "karein", "saath",
  "sabse", "zyaada", "zyada", "kam", "bahut", "bohot", "thoda",
  "sambhandh", "sambandh", "jankari", "mahatvapurna", "zaruri", "sandigdh", "shak",
  "ke", "ki", "ka", "ko", "se", "mein", "par", "pe", "aur", "ya", "bhi", "toh"
]);

/**
 * Detect language of incoming query
 */
export function detectLanguage(text: string): SupportedLanguage {
  const trimmed = text.trim();

  // 1. Check for Devanagari Unicode range: \u0900 to \u097F
  const hasDevanagari = /[\u0900-\u097F]/.test(trimmed);
  if (hasDevanagari) {
    return "hi";
  }

  // 2. Tokenize lowercase words and check density of Hinglish markers
  const tokens = trimmed.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let hinglishCount = 0;

  for (const token of tokens) {
    if (HINGLISH_KEYWORDS.has(token)) {
      hinglishCount++;
    }
  }

  // If at least 15% or 2 tokens match Hinglish vocabulary, classify as Hinglish
  if (tokens.length > 0 && (hinglishCount >= 2 || hinglishCount / tokens.length >= 0.15)) {
    return "hinglish";
  }

  return "en";
}

/**
 * Grounded investigation knowledge base
 */
const INVESTIGATION_KNOWLEDGE = {
  target01: {
    label: "TARGET-01",
    name: "Viktor R.",
    role: "Primary Syndicate Coordinator",
    betweenness: 0.94,
    degree: 5,
    directConnections: ["SUSPECT-02 (Alexei M.)", "Phone +1", "Aura Logistics Holding", "Crypto Vault", "Black Armored SUV", "Dock Warehouse #4"],
    evidence: [
      { id: "CDR_019_2834", name: "27 encrypted voice calls before port manifest unsealing" },
      { id: "SWIFT_WIRE_741", name: "$320k USDT transfer to Crypto Vault mixer" },
      { id: "POLICE_FIR_452", name: "Port container 89-TX manifest modification report" },
    ],
    sources: ["Rotterdam Quay Log", "Interception Subpoena #0142", "Etherscan Hash 0x7F...44b"],
    confidence: "94% Forensic Confidence",
  },
  suspect02: {
    label: "SUSPECT-02",
    name: "Alexei M.",
    role: "Maritime Logistics Enforcer",
    betweenness: 0.78,
    degree: 4,
    directConnections: ["TARGET-01", "Phone +1", "Aura Logistics Holding"],
    evidence: [
      { id: "ANPR_CAM_12", name: "Vehicle Plate TX-89 logged 4 border crossings" },
      { id: "PORT_GATE_SCAN", name: "Biometric bypass at Dock Warehouse #4" },
    ],
    sources: ["Limassol Shell Corporate Registry", "Interpol Red Notice Archive"],
    confidence: "88% Forensic Confidence",
  },
  financialPatterns: {
    summary: "$640k tether liquidity pool routed through sanctioned mixer protocol from Limassol shell holding to covert hardware cold-storage.",
    evidence: [
      { id: "BLOCKCHAIN_TRACE_08", name: "Hop-distance 3 mixer transaction cluster" },
      { id: "OFAC_SANCTION_MATCH", name: "Mixer protocol address flagged on OFAC SDN list" },
    ],
    sources: ["Chainalysis Reactor Graph", "Cyprus Corporate Registry Filings"],
    confidence: "96% Forensic Confidence",
  },
  communities: {
    cluster1: "Core Syndicate Command (TARGET-01, SUSPECT-02, Phone +1, Crypto Vault)",
    cluster2: "Shell Enterprise & Logistics (Aura Logistics, Elena Rostova, Mark V., Armored SUV)",
    cluster3: "Field Operations & Transit (Dock Warehouse #4, Precedent Case #089)",
  }
};

/**
 * Resolve pronouns/context from message history
 */
function resolveContextEntity(query: string, history: ChatMessageContext[] = []): string {
  const lower = query.toLowerCase();

  // Explicit entity check
  if (lower.includes("target-01") || lower.includes("viktor")) return "target01";
  if (lower.includes("suspect-02") || lower.includes("alexei")) return "suspect02";
  if (lower.includes("vault") || lower.includes("financial") || lower.includes("paisa") || lower.includes("transaction")) return "financial";
  if (lower.includes("cluster") || lower.includes("community") || lower.includes("group")) return "communities";

  // Contextual pronoun resolution (e.g. "Why?", "Uske connections?", "Inka role kya hai?")
  const pronounIndicators = ["why", "who", "iska", "iske", "uski", "uske", "inka", "inhe", "unka", "unhe", "ye", "yeh", "connections", "evidence"];
  const isContextual = pronounIndicators.some((p) => lower.includes(p)) || lower.trim().length < 15;

  if (isContextual && history.length > 0) {
    // Traverse history backward to find last entity mentioned
    for (let i = history.length - 1; i >= 0; i--) {
      const pastContent = history[i].content.toLowerCase();
      if (pastContent.includes("target-01") || pastContent.includes("viktor")) return "target01";
      if (pastContent.includes("suspect-02") || pastContent.includes("alexei")) return "suspect02";
      if (pastContent.includes("vault") || pastContent.includes("financial")) return "financial";
    }
  }

  return "target01"; // Default focus entity
}

/**
 * Execute Bilingual Intelligence Query
 */
export async function executeAIQuery(input: AIQueryInput): Promise<AIQueryResponse> {
  const detected = detectLanguage(input.query);
  const targetLanguage: SupportedLanguage =
    input.languagePreference === "hi"
      ? "hi"
      : input.languagePreference === "en"
      ? "en"
      : detected;

  const lower = input.query.toLowerCase();
  const entityKey = resolveContextEntity(input.query, input.history);

  // 1. INVESTIGATION SUMMARY QUERIES
  if (
    lower.includes("summary") ||
    lower.includes("saransh") ||
    lower.includes("briefing") ||
    lower.includes("batao case") ||
    lower.includes("case kya hai")
  ) {
    if (targetLanguage === "hi") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hi",
        text: "ऑपरेशन नेक्सस (Operation Nexus) की जांच से यह स्पष्ट होता है कि यह एक बहु-स्तरीय आपराधिक नेटवर्क (syndicate) है जो समुद्री बंदरगाह रसद, मुखौटा कंपनियों (shell corporations), और क्रिप्टोकरेंसी शोधन से जुड़ा हुआ है।",
        answerSummary:
          "उपलब्ध साक्ष्यों के आधार पर, TARGET-01 (Viktor R.) प्राथमिक संयोजक इकाई के रूप में कार्य करता है, जो रसद प्रवर्तक SUSPECT-02 और लिमासोल स्थित ऑरा लॉजिस्टिक्स (Aura Logistics) को $640,000 के क्रिप्टो फंड से जोड़ता है।",
        evidenceLinks: [
          { id: "POLICE_FIR_452", name: "बंदरगाह कार्गो घोषणा विसंगति रिपोर्ट" },
          { id: "CDR_251", name: "27 इंटरसेप्टेड कॉल रिकॉर्ड्स" },
          { id: "SWIFT_WIRE_741", name: "ऑफशोर वायर ट्रांसफर लेजर" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Aura Logistics Holding", "Crypto Vault"],
        confidence: "94% फोरेंसिक विश्वसनीयता",
        sourceReferences: ["रॉटरडैम पोर्ट अथॉरिटी", "दूरसंचार निगरानी सबपोना 0142", "ब्लॉकचेन ट्रेस लेजर"],
      };
    } else if (targetLanguage === "hinglish") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hinglish",
        text: "Operation Nexus investigation ka analysis yeh dikhata hai ki yeh ek coordinated syndicate network hai jo port smuggling, shell companies, aur crypto liquidity routing ko integrate karta hai.",
        answerSummary:
          "Available forensic data ke mutabik, TARGET-01 (Viktor R.) main bridge entity hai jiska betweenness score 0.94 hai. Yeh Rotterdam port logistics ko Aura Logistics shell company aur $640k crypto vault se jodta hai.",
        evidenceLinks: [
          { id: "POLICE_FIR_452", name: "Port manifest alteration declaration" },
          { id: "CDR_251", name: "27 intercepted voice records" },
          { id: "SWIFT_WIRE_741", name: "Offshore crypto transfer confirmation" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Aura Logistics Holding", "Crypto Vault"],
        confidence: "94% Forensic Confidence",
        sourceReferences: ["Rotterdam Quay Log", "Interception Subpoena #0142", "Etherscan Ledger"],
      };
    } else {
      return {
        detectedLanguage: detected,
        responseLanguage: "en",
        text: "Investigation Operation Nexus encompasses a coordinated illicit network integrating maritime port smuggling, offshore corporate fronts, and decentralized crypto laundering channels.",
        answerSummary:
          "Forensic graph analytics confirm that TARGET-01 (Viktor R.) functions as the primary high-centrality bridge entity (Betweenness 0.94), directly coordinating operational logistics with SUSPECT-02 and financing through Aura Logistics Holding.",
        evidenceLinks: [
          { id: "POLICE_FIR_452", name: "Port container manifest alteration record" },
          { id: "CDR_251", name: "27 intercepted calls with key associates" },
          { id: "SWIFT_WIRE_741", name: "$320k USDT decentralized transfer" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Aura Logistics Holding", "Crypto Vault"],
        confidence: "94% Forensic Confidence",
        sourceReferences: ["Rotterdam Quay Log", "Interception Subpoena #0142", "Blockchain Trace Hash 0x7F...44b"],
      };
    }
  }

  // 2. FINANCIAL FRAUD / SUSPICIOUS PATTERNS
  if (
    lower.includes("financial") ||
    lower.includes("paisa") ||
    lower.includes("transaction") ||
    lower.includes("vault") ||
    lower.includes("crypto") ||
    lower.includes("money")
  ) {
    if (targetLanguage === "hi") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hi",
        text: "वित्तीय साक्ष्यों के विश्लेषण से $640,000 USDT का एक संदिग्ध तरलता पूल (liquidity pool) सामने आया है, जिसे एक प्रतिबंधित मिक्सर प्रोटोकॉल के माध्यम से गुप्त हार्डवेयर वॉलेट में भेजा गया था।",
        answerSummary:
          "लेन-देन की समय-सीमा लिमासोल स्थित ऑरा लॉजिस्टिक्स के कॉर्पोरेट खातों और डॉक वेयरहाउस #4 पर पाए गए कोल्ड-स्टोरेज हार्डवेयर वॉलेट से सीधी कनेक्टिविटी दर्शाती है।",
        evidenceLinks: INVESTIGATION_KNOWLEDGE.financialPatterns.evidence,
        relatedEntities: ["Crypto Vault 0x7F...44b", "TARGET-01", "Aura Logistics Holding", "Dock Warehouse #4"],
        confidence: INVESTIGATION_KNOWLEDGE.financialPatterns.confidence,
        sourceReferences: INVESTIGATION_KNOWLEDGE.financialPatterns.sources,
      };
    } else if (targetLanguage === "hinglish") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hinglish",
        text: "Financial ledger analysis se pata chalta hai ki $640k USDT ka ek high-value suspicious liquidity pool ek sanctioned crypto mixer protocol ke through route kiya gaya tha.",
        answerSummary:
          "Yeh fund transfers Aura Logistics ke offshore bank filings aur Dock Warehouse #4 par recovered hardware wallet se directly connected hain. Hop-distance 3 ke andar 96% alignment verify hui hai.",
        evidenceLinks: INVESTIGATION_KNOWLEDGE.financialPatterns.evidence,
        relatedEntities: ["Crypto Vault 0x7F...44b", "TARGET-01", "Aura Logistics Holding", "Dock Warehouse #4"],
        confidence: INVESTIGATION_KNOWLEDGE.financialPatterns.confidence,
        sourceReferences: INVESTIGATION_KNOWLEDGE.financialPatterns.sources,
      };
    } else {
      return {
        detectedLanguage: detected,
        responseLanguage: "en",
        text: "Financial forensic tracing reveals a suspicious $640,000 USDT decentralized liquidity pool routed through an OFAC-flagged mixing protocol into a cold-storage hardware wallet.",
        answerSummary:
          "The disbursement timeline shows direct correlation with corporate accounts belonging to Aura Logistics Holding in Limassol and physical staging operations at Dock Warehouse #4.",
        evidenceLinks: INVESTIGATION_KNOWLEDGE.financialPatterns.evidence,
        relatedEntities: ["Crypto Vault 0x7F...44b", "TARGET-01", "Aura Logistics Holding", "Dock Warehouse #4"],
        confidence: INVESTIGATION_KNOWLEDGE.financialPatterns.confidence,
        sourceReferences: INVESTIGATION_KNOWLEDGE.financialPatterns.sources,
      };
    }
  }

  // 3. COMMUNITY / CLUSTER / CONNECTIVITY QUERIES
  if (
    lower.includes("cluster") ||
    lower.includes("community") ||
    lower.includes("group") ||
    lower.includes("influential") ||
    lower.includes("most connected") ||
    lower.includes("sabse")
  ) {
    if (targetLanguage === "hi") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hi",
        text: "नेटवर्क टोपोलॉजी और लूवेन मॉड्यूलरिटी एल्गोरिदम के अनुसार, इस जांच में 3 अलग-अलग समुदाय (clusters) पहचाने गए हैं।",
        answerSummary:
          "TARGET-01 (Viktor R.) सबसे प्रभावशाली नोड (Betweenness: 0.94) है जो 'कोर सिंडिकेट' (Cluster 1) और 'शेल लॉजिस्टिक्स' (Cluster 2) के बीच एकमात्र प्राथमिक पुल (bridge) है।",
        evidenceLinks: [
          { id: "TOPOLOGY_MOD_01", name: "Louvain मॉड्यूलरिटी 0.72 कम्युनिटी मैप" },
          { id: "CENTRALITY_CALC", name: "बिटवीननेस सेंट्रैलिटी स्कोर 0.94" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Elena Rostova", "Mark V."],
        confidence: "95% फोरेंसिक विश्वसनीयता",
        sourceReferences: ["ग्राफ एनालिटिक्स इंजन", "दूरसंचार इंटरसेप्ट रजिस्ट्री"],
      };
    } else if (targetLanguage === "hinglish") {
      return {
        detectedLanguage: detected,
        responseLanguage: "hinglish",
        text: "Network graph analytics ke hisaab se is case mein 3 distinct operational clusters hain, jisme TARGET-01 sabse zyada influential entity hai.",
        answerSummary:
          "TARGET-01 ka betweenness score 0.94 hai aur yeh 5 direct links ke through Core Syndicate (Cluster 1) aur Shell Corporate Logistics (Cluster 2) ke beech main bridge ka kaam karta hai.",
        evidenceLinks: [
          { id: "TOPOLOGY_MOD_01", name: "Louvain Modularity 0.72 community map" },
          { id: "CENTRALITY_CALC", name: "Betweenness centrality score 0.94" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Elena Rostova", "Mark V."],
        confidence: "95% Forensic Confidence",
        sourceReferences: ["Graph Analytics Engine", "Telecom Intercept Registry"],
      };
    } else {
      return {
        detectedLanguage: detected,
        responseLanguage: "en",
        text: "Louvain modularity clustering isolates 3 distinct operational communities within Operation Nexus. TARGET-01 exhibits the highest betweenness centrality (0.94) across the network.",
        answerSummary:
          "TARGET-01 connects Cluster 1 (Core Syndicate Command) with Cluster 2 (Shell Logistics & Legal Cover), acting as the single point of failure and primary strategic coordinator.",
        evidenceLinks: [
          { id: "TOPOLOGY_MOD_01", name: "Louvain Modularity 0.72 community map" },
          { id: "CENTRALITY_CALC", name: "Betweenness centrality score 0.94" },
        ],
        relatedEntities: ["TARGET-01", "SUSPECT-02", "Elena Rostova", "Mark V."],
        confidence: "95% Forensic Confidence",
        sourceReferences: ["CIPHER Graph Topology Engine", "Telecom Subpoena Batch 0412"],
      };
    }
  }

  // 4. ENTITY IMPORTANCE / CONNECTIONS (DEFAULT FOR TARGET-01 / SUSPECT-02)
  const entityData = entityKey === "suspect02" ? INVESTIGATION_KNOWLEDGE.suspect02 : INVESTIGATION_KNOWLEDGE.target01;

  if (targetLanguage === "hi") {
    return {
      detectedLanguage: detected,
      responseLanguage: "hi",
      text: `${entityData.label} (${entityData.name}) इस जांच में एक उच्च-प्राथमिकता वाला नोड है क्योंकि इसका बिटवीननेस सेंट्रैलिटी स्कोर ${entityData.betweenness} है और इसके ${entityData.directConnections.length} प्रत्यक्ष साक्ष्य-समर्थित संबंध हैं।`,
      answerSummary:
        `साक्ष्यों के आधार पर, यह इकाई कई अलग-अलग परिचालनों को जोड़ती है। इसके प्रत्यक्ष संपर्कों में शामिल हैं: ${entityData.directConnections.join(", ")}। कानून प्रवर्तन मानकों के अनुसार मानव सत्यापन अनिवार्य है।`,
      evidenceLinks: entityData.evidence,
      relatedEntities: entityData.directConnections.slice(0, 4),
      confidence: entityData.confidence,
      sourceReferences: entityData.sources,
    };
  } else if (targetLanguage === "hinglish") {
    return {
      detectedLanguage: detected,
      responseLanguage: "hinglish",
      text: `${entityData.label} (${entityData.name}) investigation mein isliye important hai kyunki iska betweenness centrality score ${entityData.betweenness} hai aur iske ${entityData.directConnections.length} direct linked connections hain.`,
      answerSummary:
        `Forensic logs ke according, yeh entity multiple criminal clusters ko aapas mein jodh rahi hai. Iske direct connections mein shamil hain: ${entityData.directConnections.join(", ")}। Yeh ek active investigative lead hai.`,
      evidenceLinks: entityData.evidence,
      relatedEntities: entityData.directConnections.slice(0, 4),
      confidence: entityData.confidence,
      sourceReferences: entityData.sources,
    };
  } else {
    return {
      detectedLanguage: detected,
      responseLanguage: "en",
      text: `${entityData.label} (${entityData.name}) represents a critical high-centrality entity with a betweenness score of ${entityData.betweenness} and ${entityData.directConnections.length} direct forensic links.`,
      answerSummary:
        `Evidence establishes direct coordinates across telecommunications, financial transfers, and physical logistics. Direct linkages include: ${entityData.directConnections.join(", ")}. Note: Findings provide investigative leads requiring human analyst verification.`,
      evidenceLinks: entityData.evidence,
      relatedEntities: entityData.directConnections.slice(0, 4),
      confidence: entityData.confidence,
      sourceReferences: entityData.sources,
    };
  }
}
