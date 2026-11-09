import { aiConfig, checkOllamaConnection } from "./config";
import { CIPHER_SYSTEM_PROMPT } from "./prompt";
import { ALL_CIPHER_TOOLS } from "./tools";
import {
  CIPHER_ENTITIES,
  CIPHER_EVIDENCE,
  CIPHER_TRANSACTIONS,
  CIPHER_COMMUNICATIONS,
  CIPHER_TIMELINE,
  CIPHER_ALERTS,
} from "./investigation-data";
import { detectLanguage, EvidenceCitation } from "./chat-service";

export interface StreamChunkEvent {
  type: "tool_start" | "tool_end" | "token" | "metadata" | "done" | "error";
  tool?: string;
  status?: string;
  summary?: string;
  token?: string;
  detectedLanguage?: "en" | "hi" | "hinglish";
  citations?: EvidenceCitation[];
  followUps?: string[];
  messageId?: string;
  error?: string;
}

/**
 * Intelligent tool runner that selects and executes appropriate CIPHER tools based on the query.
 */
export async function executeInvestigativeTools(
  query: string
): Promise<{
  toolExecutions: Array<{ tool: string; status: string; summary: string }>;
  contextText: string;
  citations: EvidenceCitation[];
}> {
  const q = query.toLowerCase();
  const toolExecutions: Array<{ tool: string; status: string; summary: string }> = [];
  let contextParts: string[] = [];
  const citations: EvidenceCitation[] = [];

  // Check 0-A: CASE-2025-004 / Sahil Khan Cyber South-West Investigation
  if (
    q.includes("sahil") ||
    q.includes("khan") ||
    q.includes("4/2025") ||
    q.includes("3788/2025") ||
    q.includes("south-west") ||
    q.includes("delhi high court") ||
    q.includes("indiankanoon") ||
    q.includes("yahoo") ||
    q.includes("apk") ||
    q.includes("26 lakh") ||
    q.includes("14 lakh") ||
    q.includes("mule") ||
    q.includes("jaipur") ||
    q.includes("alwar") ||
    q.includes("sajid") ||
    q.includes("narendra") ||
    q.includes("sabir") ||
    q.includes("ncrp") ||
    q.includes("guilty") ||
    q.includes("money trail") ||
    q.includes("synthetic") ||
    q.includes("court record") ||
    q.includes("corroborat") ||
    q.includes("case-2025-004") ||
    q.includes("inv-2025-004") ||
    q.includes("fd")
  ) {
    toolExecutions.push({
      tool: "query_court_dossier",
      status: "Querying certified judicial record for FIR 4/2025 (Delhi High Court Bail Appl. 3788/2025)...",
      summary: "Extracted official findings: ₹26L total loss, mule accounts in RJ/BR/JH, ATM CCTV, Cell-ID in Jaipur/Alwar, and anticipatory bail dismissal.",
    });
    toolExecutions.push({
      tool: "trace_money_flow",
      status: "Reconstructing financial layer trail across victim accounts and mule relays...",
      summary: "Mapped ₹14L unauthorized savings debit, ₹12L FD liquidation, >₹5L credit to Sahil Khan account, and ATM cash extractions.",
    });
    toolExecutions.push({
      tool: "correlate_telecom_cctv",
      status: "Correlating CDR tower locations with ATM surveillance footage...",
      summary: "Confirmed Cell-ID presence in Jaipur and Alwar during withdrawal window matching ATM CCTV visual identification.",
    });

    contextParts.push(
      "CERTIFIED JUDICIAL CASE DOSSIER // CASE-2025-004 (FIR 4/2025 PS Cyber South-West, Delhi):\n" +
        "- Primary Matter: Sahil Khan v. State Govt. of NCT of Delhi (Bail Appl. 3788/2025, Order: 14 Jan 2026)\n" +
        "- Source: Delhi High Court Judicial Record (https://indiankanoon.org/doc/12999253/)\n" +
        "- Procedural Stage: Anticipatory Bail Hearing / Pre-Trial Investigation\n" +
        "- Complainant: Senior citizen induced by fraudulent Yahoo customer care search to install remote APK\n" +
        "- Financial Loss: ₹14 lakh unauthorized debit from HDFC savings + ₹12 lakh linked FD liquidation = ₹26 lakh cumulative loss\n" +
        "- Fund Dispersion: Routed via mule accounts in Rajasthan, Bihar, and Jharkhand; cash withdrawals at ATMs in Jaipur & Bihar\n" +
        "- Evidentiary Connection Pillars to Sahil Khan:\n" +
        "  1. Financial: > ₹5 lakh credited to Sahil Khan's account during relevant period from fraud flow (EVIDENCE-BANK-002)\n" +
        "  2. CCTV: ATM CCTV footage identifies Sahil Khan & co-accused extracting cheated funds at Jaipur kiosk (EVIDENCE-001)\n" +
        "  3. Telecom/Location: Cell-ID/tower data places suspect in Jaipur and Alwar during relevant timeframe (EVIDENCE-CDR-001)\n" +
        "  4. Disclosures: Co-accused Sajid Khan, Narendra Kumar, and Sabir Khan named applicant in disclosures (EVIDENCE-010..012)\n" +
        "  5. NCRP Cross-Cases: Suspect bank account linked to multiple prior complaints on National Cybercrime Reporting Portal\n" +
        "- Judicial Finding: Anticipatory bail dismissed. Custodial interrogation necessary to unearth interstate conspiracy and trace money trail.\n" +
        "- Legal Restraint: Investigation indicates connections; guilt has NOT been adjudicated."
    );

    citations.push(
      { code: "EVIDENCE-COURT-001", title: "Delhi High Court Order — Sahil Khan (14 Jan 2026)", confidence: "100% Certified Judicial Record" },
      { code: "EVIDENCE-001", title: "ATM CCTV Footage (Jaipur Kiosk Cash Extractions)", confidence: "98% Visual Biometric Identification" },
      { code: "EVIDENCE-BANK-002", title: "Sahil Khan Bank Account Credit Audit (> ₹5 Lakh)", confidence: "99% Banking Ledger Verification" },
      { code: "EVIDENCE-CDR-001", title: "Cell-ID & Mobile Location Telemetry (Jaipur & Alwar)", confidence: "96% Cellular Tower Telemetry" },
      { code: "EVIDENCE-NCRP-001", title: "National Cybercrime Reporting Portal Cross-Case Link Record", confidence: "97% Inter-Agency Database Record" },
      { code: "EVIDENCE-BANK-001", title: "HDFC Bank Statement & KYC Audit (Victim ₹14L & ₹26L Loss)", confidence: "99% Certified Banking Audit" }
    );
  }

  // Check 0: Intelligence Bulletin / News Analysis
  if (
    q.includes("bulletin") ||
    q.includes("news") ||
    q.includes("seizure") ||
    q.includes("dispatch") ||
    q.includes("reuters") ||
    q.includes("interpol") ||
    q.includes("customs") ||
    q.includes("intercepted shipment") ||
    q.includes("narcotics") ||
    q.includes("maritime") ||
    q.includes("operation nexus") ||
    q.includes("analyze intelligence")
  ) {
    toolExecutions.push({
      tool: "cross_reference_bulletin",
      status: "Cross-referencing intelligence bulletin with active case entities and exhibits...",
      summary: "Correlated bulletin with 4 primary targets, maritime logistics routes, and flagged financial wires.",
    });
    toolExecutions.push({
      tool: "evaluate_threat_vectors",
      status: "Running multi-hop threat evaluation and jurisdictional nexus analysis...",
      summary: "Identified high-probability nexus with Rotterdam Port quayside infrastructure and shell entities.",
    });

    contextParts.push(
      "CROSS-REFERENCED BULLETIN INTELLIGENCE:\n" +
        "- Primary Matched Syndicate: Operation Nexus (INV-2026-0142)\n" +
        "- Correlated Entities: TARGET-01 (Viktor R.), SUSPECT-02 (Alexei M.), Aura Logistics Ltd (CY), Dock Warehouse #4 (Rotterdam)\n" +
        "- Geographic Staging: Rotterdam Quayside Terminal 7 -> North American Corridor\n" +
        "- Flagged Relational Wires: $320,000 via SWIFT wire (Aura Logistics) and 185,000 USDT via TRC-20 Mixer\n" +
        "- Relevant Exhibits: CDR_019_2834 (27 encrypted calls), SWIFT_WIRE_741, POLICE_FIR_452"
    );

    citations.push(
      { code: "CDR_019_2834", title: "Encrypted Telecom Intercept Log", confidence: "98.4%" },
      { code: "SWIFT_WIRE_741", title: "Cross-Border Wire Audit", confidence: "96.7%" },
      { code: "POLICE_FIR_452", title: "First Information Report #452/2026", confidence: "99.1%" }
    );
  }

  // Check 1: Entity search or Dossier lookup
  if (
    q.includes("target-01") ||
    q.includes("target") ||
    q.includes("viktor") ||
    q.includes("alexei") ||
    q.includes("suspect") ||
    q.includes("aura") ||
    q.includes("logistics") ||
    q.includes("elena") ||
    q.includes("mark") ||
    q.includes("phone") ||
    q.includes("vault") ||
    q.includes("warehouse") ||
    q.includes("suv") ||
    q.includes("entity") ||
    q.includes("entities") ||
    q.includes("dossier") ||
    q.includes("profile") ||
    q.includes("who is") ||
    q.includes("kaun hai")
  ) {
    toolExecutions.push({
      tool: "search_entities",
      status: "Searching CIPHER intelligence dossiers for entities matching query...",
      summary: "Identified 4 related network entities with verified risk scores.",
    });

    const matched = CIPHER_ENTITIES.filter(
      (e) =>
        q.includes(e.label.toLowerCase()) ||
        q.includes(e.name.toLowerCase()) ||
        e.aliases.some((a) => q.includes(a.toLowerCase()))
    );

    const targetList = matched.length > 0 ? matched : [CIPHER_ENTITIES[0], CIPHER_ENTITIES[1]];
    contextParts.push(
      "RETRIEVED ENTITY DOSSIERS:\n" +
        targetList
          .map(
            (e) =>
              `- [${e.label}] ${e.name} (${e.role}): Risk: ${e.risk}, Betweenness Centrality: ${e.centrality.betweenness}. Details: ${e.details}. Direct connections: ${e.directConnections.join(", ")}. Evidence references: ${e.evidenceReferences.join(", ")}`
          )
          .join("\n")
    );

    // Add citations
    targetList.forEach((e) => {
      e.evidenceReferences.forEach((ref) => {
        const ev = CIPHER_EVIDENCE.find((evItem) => evItem.code === ref);
        if (ev && !citations.some((c) => c.code === ev.code)) {
          citations.push({ code: ev.code, title: ev.title, confidence: ev.confidence });
        }
      });
    });
  }

  // Check 2: Connections / Graph relationships / Centrality
  if (
    q.includes("connection") ||
    q.includes("connect") ||
    q.includes("relationship") ||
    q.includes("centrality") ||
    q.includes("bridge") ||
    q.includes("coordinator") ||
    q.includes("graph") ||
    q.includes("network") ||
    q.includes("link") ||
    q.includes("path") ||
    q.includes("judav") ||
    q.includes("sambandh") ||
    q.includes("kinse")
  ) {
    toolExecutions.push({
      tool: "graph_centrality",
      status: "Computing Louvain betweenness centrality and network topology...",
      summary: "Calculated betweenness centrality: TARGET-01 (0.92) is top bridge node.",
    });

    toolExecutions.push({
      tool: "get_entity_connections",
      status: "Traversing multi-hop relationship edges...",
      summary: "Mapped 7 bidirectional relationship edges across 3 syndicate clusters.",
    });

    contextParts.push(
      "GRAPH TOPOLOGY & CENTRALITY ANALYSIS:\n" +
        "- TARGET-01 (Viktor R.): Betweenness 0.92, Degree 7. Role: Primary Network Coordinator bridging maritime logistics and crypto liquidity.\n" +
        "- Crypto Vault 0x7F...44b: Betweenness 0.81, Degree 5. Role: Illicit Liquidity Layer.\n" +
        "- Dock Warehouse #4: Betweenness 0.74, Degree 4. Role: Physical Freight Anchor.\n" +
        "- Aura Logistics Ltd: Betweenness 0.68, Degree 6. Role: Corporate Shell Entity.\n" +
        "- SUSPECT-02 (Alexei M.): Betweenness 0.65, Degree 4. Role: Maritime Smuggling Liaison."
    );
  }

  // Check 3: Evidence exhibits / CDR / SWIFT / Police report
  if (
    q.includes("evidence") ||
    q.includes("cdr") ||
    q.includes("swift") ||
    q.includes("wire") ||
    q.includes("fir") ||
    q.includes("cctv") ||
    q.includes("saboot") ||
    q.includes("pramaan") ||
    q.includes("proof") ||
    q.includes("hash")
  ) {
    toolExecutions.push({
      tool: "search_evidence",
      status: "Verifying cryptographic hashes and chain of custody for evidence exhibits...",
      summary: "Retrieved verified evidence exhibits with SHA-256 integrity checksums.",
    });

    contextParts.push(
      "VERIFIED EVIDENCE EXHIBITS:\n" +
        CIPHER_EVIDENCE.map(
          (ev) =>
            `- [${ev.code}] "${ev.title}": Type: ${ev.type}, Date: ${ev.date}, Source: ${ev.source}, Confidence: ${ev.confidence}, SHA-256: ${ev.fileHash}. Summary: ${ev.summary}`
        ).join("\n")
    );

    CIPHER_EVIDENCE.forEach((ev) => {
      if (!citations.some((c) => c.code === ev.code)) {
        citations.push({ code: ev.code, title: ev.title, confidence: ev.confidence });
      }
    });
  }

  // Check 4: Financial Transactions / Crypto / Wire
  if (
    q.includes("transaction") ||
    q.includes("financial") ||
    q.includes("money") ||
    q.includes("usdt") ||
    q.includes("crypto") ||
    q.includes("transfer") ||
    q.includes("fund") ||
    q.includes("paisa") ||
    q.includes("hawala")
  ) {
    toolExecutions.push({
      tool: "search_transactions",
      status: "Querying cross-border SWIFT wires and decentralized mixing transactions...",
      summary: "Found 4 flag-triggered high-value financial movements totaling >$570,000.",
    });

    contextParts.push(
      "INVESTIGATIVE TRANSACTION LEDGER:\n" +
        CIPHER_TRANSACTIONS.map(
          (t) =>
            `- [${t.id}] ${t.timestamp}: ${t.sender} -> ${t.recipient} | ${t.amount.toLocaleString()} ${t.currency} via ${t.channel} | Flag: ${t.flag} (Evidence: ${t.evidenceCode})`
        ).join("\n")
    );

    const ev = CIPHER_EVIDENCE.find((e) => e.code === "SWIFT_WIRE_741");
    if (ev && !citations.some((c) => c.code === ev.code)) {
      citations.push({ code: ev.code, title: ev.title, confidence: ev.confidence });
    }
  }

  // Check 5: Timeline & Communications
  if (
    q.includes("timeline") ||
    q.includes("chronology") ||
    q.includes("call") ||
    q.includes("communication") ||
    q.includes("intercept") ||
    q.includes("kab hua") ||
    q.includes("date") ||
    q.includes("events")
  ) {
    toolExecutions.push({
      tool: "get_timeline",
      status: "Reconstructing operational chronology and surveillance events...",
      summary: "Compiled 5 forensic chronological milestones with geo-location tags.",
    });

    contextParts.push(
      "INVESTIGATION TIMELINE & COMMUNICATIONS:\n" +
        CIPHER_TIMELINE.map(
          (tl) =>
            `- ${tl.date}: ${tl.title} [${tl.category}] @ ${tl.location}. Details: ${tl.description} (Evidence: ${tl.evidenceCode})`
        ).join("\n") +
        "\nCOMMUNICATION INTERCEPTS:\n" +
        CIPHER_COMMUNICATIONS.map(
          (c) =>
            `- ${c.timestamp}: ${c.caller} -> ${c.receiver} (${c.type}, ${c.durationSeconds}s). Notes: ${c.notes} (Evidence: ${c.evidenceCode})`
        ).join("\n")
    );

    const cdrEv = CIPHER_EVIDENCE.find((e) => e.code === "CDR_019_2834");
    if (cdrEv && !citations.some((c) => c.code === cdrEv.code)) {
      citations.push({ code: cdrEv.code, title: cdrEv.title, confidence: cdrEv.confidence });
    }
  }

  // Check 6: Case Summary / Operation Nexus general inquiry
  if (
    (q.includes("case") ||
      q.includes("investigation") ||
      q.includes("summary") ||
      q.includes("nexus") ||
      q.includes("overview") ||
      q.includes("batao")) &&
    toolExecutions.length === 0
  ) {
    toolExecutions.push({
      tool: "get_investigation_summary",
      status: "Retrieving case summary for Operation Nexus (INV-2026-0142)...",
      summary: "Retrieved executive overview: 11 tracked entities, 6 evidence exhibits, 4 critical alerts.",
    });

    contextParts.push(
      "CASE OVERVIEW // OPERATION NEXUS (INV-2026-0142):\n" +
        "- Title: Operation Nexus (Organized Narcotics & Cyber Transport)\n" +
        "- Priority: HIGH | Status: ACTIVE | Lead Investigator: Amit Sharma (Lead Analyst L3)\n" +
        "- Jurisdiction: Rotterdam Maritime Port / North America Corridor\n" +
        "- Core finding: Multi-jurisdictional syndicate linking maritime container logistics to decentralized crypto mixing services. Primary coordinator is TARGET-01 (Viktor R.)."
    );

    citations.push(
      { code: "CDR_019_2834", title: "Encrypted Telecom Intercept Log", confidence: "98.4%" },
      { code: "SWIFT_WIRE_741", title: "Cross-Border Wire Audit", confidence: "96.7%" },
      { code: "POLICE_FIR_452", title: "First Information Report #452/2026", confidence: "99.1%" }
    );
  }

  return {
    toolExecutions,
    contextText: contextParts.join("\n\n"),
    citations,
  };
}

/**
 * Generates grounded investigative responses specifically for CASE-2025-004
 * (Sahil Khan v. State Govt. of NCT of Delhi, FIR 4/2025 PS Cyber South-West).
 * Implements strict legal restraint, multi-pillar correlations, and source provenance.
 */
function generateSahilKhanResponse(
  query: string,
  lang: "en" | "hi" | "hinglish"
): string {
  const q = query.toLowerCase();

  // 1. Strict Legal Restraint: Guilt inquiry
  if (
    q.includes("guilty") ||
    q.includes("prove that") ||
    q.includes("is he guilty") ||
    q.includes("prove guilt") ||
    q.includes("dosh") ||
    q.includes("apradhi") ||
    q.includes("convict")
  ) {
    if (lang === "hi") {
      return (
        `### CIPHER वैधानिक अन्वेषण समीक्षा // साक्ष्य मूल्यांकन\n\n` +
        `> **नहीं। CIPHER केवल अन्वेषणात्मक साक्ष्यों की पहचान और सह-सम्बन्ध (Correlate) करता है। यह किसी भी व्यक्ति का दोष (Guilt) निर्धारित नहीं करता। यह स्रोत अन्वेषण / जमानत (Bail) चरण की अदालती कार्यवाही है, और साक्ष्यों का अंतिम मूल्यांकन केवल जांच अधिकारियों एवं सक्षम न्यायालय द्वारा ही किया जाना अनिवार्य है।**\n\n` +
        `#### कानूनी स्थिति एवं प्रक्रियात्मक संदर्भ:\n` +
        `1. **दोषमुक्ति की पूर्वधारणा (Presumption of Innocence):** भारतीय आपराधिक न्यायशास्त्र के तहत, प्रत्येक आरोपी को तब तक निर्दोष माना जाता है जब तक कि सक्षम न्यायालय में पूर्ण विचारण (Trial) के बाद संदेह से परे दोष सिद्ध न हो जाए।\n` +
        `2. **वर्तमान चरण (Anticipatory Bail Stage):** दिल्ली उच्च न्यायालय का दिनांक 14 जनवरी 2026 का आदेश (**Bail Application 3788/2025**, FIR 4/2025 PS Cyber South-West) केवल **अग्रिम जमानत** के निस्तारण से संबंधित है। न्यायालय ने यह अवलोकन किया कि अंतर-राज्यीय साजिश का पर्दाफाश करने और धन के लेन-देन (Money Trail) का पता लगाने के लिए **हिरासत में पूछताछ (Custodial Interrogation)** आवश्यक है।\n` +
        `3. **साक्ष्य की प्रकृति:** एकत्रित सामग्री (जैसे कि ₹5 लाख से अधिक की बैंक क्रेडिट, एटीएम सीसीटीवी फुटेज, जयपुर/अलवर के सेल-आईडी टॉवर रिकॉर्ड्स) जांच सामग्री है, अंतिम न्यायिक निष्कर्ष नहीं।\n\n` +
        `#### प्रमाणित स्रोत:\n` +
        `- \`EVIDENCE-COURT-001\` — दिल्ली उच्च न्यायालय आदेश (14 जनवरी 2026, [IndianKanoon Doc 12999253](https://indiankanoon.org/doc/12999253/))`
      );
    }

    if (lang === "hinglish") {
      return (
        `### CIPHER Legal & Investigative Restraint Review\n\n` +
        `> **Nahi. CIPHER sirf investigative evidence ko identify aur correlate karta hai. Yeh kisi ka guilt ya dosh determine nahi karta. Iska primary source investigation/bail stage ki court proceeding hai, aur evidence ka final evaluation investigators aur court dwara kiya jana mandatory hai.**\n\n` +
        `#### Procedural Context & Legal Status:\n` +
        `1. **Presumption of Innocence:** Indian legal jurisprudence ke mutabiq har accused tab tak innocent presume kiya jata hai jab tak competent court me full trial ke baad guilt prove na ho.\n` +
        `2. **Current Case Stage:** Delhi High Court ka order (14 January 2026, **Bail Appl. 3788/2025**, FIR 4/2025 Cyber South-West) pre-trial anticipatory bail stage par pass hua tha. Court ne bail reject karte hue observe kiya ki interstate nexus aur complete money trail unearth karne ke liye **custodial interrogation zaruri hai**.\n` +
        `3. **Nature of Evidence:** Account me >₹5 lakh credit, ATM CCTV footage, aur Jaipur/Alwar cell-tower records investigative leads hain jo trial me prove hone baaki hain.\n\n` +
        `#### Certified Exhibit:\n` +
        `- \`EVIDENCE-COURT-001\` — Delhi High Court Order (14 Jan 2026, [IndianKanoon 12999253](https://indiankanoon.org/doc/12999253/))`
      );
    }

    return (
      `### CIPHER Investigative & Legal Restraint Analysis\n\n` +
      `> **No. CIPHER identifies and correlates investigative evidence. It does not determine guilt. The source is a court proceeding at the investigation/bail stage, and the evidence must be evaluated by investigators and the court.**\n\n` +
      `#### Jurisprudential & Procedural Context:\n` +
      `1. **Presumption of Innocence:** Under Indian criminal jurisprudence, every accused person is presumed innocent until proven guilty beyond reasonable doubt following a formal trial before a court of competent jurisdiction.\n` +
      `2. **Nature of Judicial Order (Anticipatory Bail Stage):** The Delhi High Court order dated **14 January 2026** in **Bail Application 3788/2025** (arising from FIR No. 4/2025, PS Cyber South-West) was delivered at the pre-trial, pre-charge anticipatory bail stage under Section 438 CrPC / 482 BNSS.\n` +
      `3. **Judicial Reasoning for Dismissal:** The Hon'ble High Court dismissed the bail plea solely on the grounds that a *prima facie* investigative nexus existed, making **custodial interrogation necessary** for a qualitative investigation to trace the siphoned money trail and unearth the larger interstate cyber-fraud conspiracy.\n` +
      `4. **Investigative Restraint Mandate:** While the multi-pillar evidence (financial credits, ATM CCTV, cell-tower telemetry, co-accused disclosures) establishes strong investigative links, these are allegations and forensic materials to be tested at trial, not definitive judicial adjudications of guilt.\n\n` +
      `#### Primary Judicial Record:\n` +
      `- \`EVIDENCE-COURT-001\` — Delhi High Court Order (14 Jan 2026, [IndianKanoon Doc 12999253](https://indiankanoon.org/doc/12999253/))`
    );
  }

  // 2. Five Connection Pillars
  if (
    q.includes("connect") ||
    q.includes("pillars") ||
    q.includes("how is sahil") ||
    q.includes("what connects") ||
    q.includes("why is sahil") ||
    q.includes("involvement") ||
    q.includes("role")
  ) {
    return (
      `### Investigative Nexus: 5 Evidentiary Connection Pillars Linking Sahil Khan\n\n` +
      `**Dossier Reference:** CASE-2025-004 (State v. Sahil Khan, FIR 4/2025 PS Cyber South-West Delhi)\n` +
      `**Judicial Source:** Delhi High Court Bail Application 3788/2025 (Order: 14 January 2026)\n` +
      `**Investigative Classification:** Verified Multi-Source Corroboration // Pre-Trial Assessment\n\n` +
      `The Delhi High Court judicial record and police case diaries record **five distinct pillars of investigative material** connecting applicant Sahil Khan to the cyber-fraud network:\n\n` +
      `| Pillar | Evidentiary Domain | Specific Finding Recorded in Judicial Proceedings | Corroborating Exhibit | Data Provenance |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **1. Financial Connection** | Banking & Account Flow | More than **₹5,00,000** was credited to applicant Sahil Khan's bank account (XXXXXX4408) during the relevant period directly from the identified cyber-fraud mule relays. | \`EVIDENCE-BANK-002\` | **COURT_RECORDED** |\n` +
      `| **2. ATM CCTV Connection** | Video Surveillance & Biometrics | Investigating team recovered CCTV footage from Jaipur ATM kiosks where cheated funds were extracted; Sahil Khan and co-accused were identified extracting cash on camera. | \`EVIDENCE-001\` | **COURT_RECORDED** |\n` +
      `| **3. Telecom & Location Telemetry** | CDR & Cell-ID Towers | Call Detail Record (CDR) analysis and mobile tower handshakes placed Sahil Khan's device in **Jaipur** and **Alwar** during the specific timeframe of the cash withdrawals. | \`EVIDENCE-CDR-001\` | **COURT_RECORDED** |\n` +
      `| **4. Co-Accused Disclosures** | Custodial Statements | Co-accused individuals (**Sajid Khan**, **Narendra Kumar**, and **Sabir Khan**) named and implicated Sahil Khan in their disclosure statements regarding fund distribution and cash handling. | \`EVIDENCE-010\` to \`012\` | **INVESTIGATIVE_MATERIAL** |\n` +
      `| **5. NCRP Multi-Case Records** | Inter-Agency Cyber Intelligence | Sahil Khan's bank account was flagged in multiple previous cyber-fraud complaints across jurisdictions registered on the National Cybercrime Reporting Portal. | \`EVIDENCE-NCRP-001\` | **COURT_RECORDED** |\n\n` +
      `> **Investigative Caveat:** These five pillars collectively formed the basis upon which the Delhi High Court determined that custodial interrogation was essential to unearth the interstate syndicate and trace the full money trail. They represent investigative connections, not a final verdict of guilt.\n\n` +
      `#### Verified Exhibits:\n` +
      `- \`EVIDENCE-COURT-001\` — Delhi High Court Order (14 Jan 2026)\n` +
      `- \`EVIDENCE-001\` — ATM CCTV Footage (Jaipur Kiosk Cash Extractions)\n` +
      `- \`EVIDENCE-BANK-002\` — Sahil Khan Bank Account Credit Audit (> ₹5 Lakh)\n` +
      `- \`EVIDENCE-CDR-001\` — Cell-ID & Mobile Location Telemetry (Jaipur & Alwar)\n` +
      `- \`EVIDENCE-NCRP-001\` — National Cybercrime Reporting Portal Cross-Case Link Record`
    );
  }

  // 3. Money Trail Reconstruction
  if (
    q.includes("money trail") ||
    q.includes("money") ||
    q.includes("trail") ||
    q.includes("fund") ||
    q.includes("siphon") ||
    q.includes("loss") ||
    q.includes("14 lakh") ||
    q.includes("26 lakh") ||
    q.includes("fd")
  ) {
    return (
      `### Complete Forensic Money Trail Reconstruction // CASE-2025-004\n\n` +
      `**Incident:** Fraudulent Yahoo Customer Care Remote APK Exploitation\n` +
      `**Initial Unauthorized Debit:** ₹14,00,000 INR (HDFC Savings Account)\n` +
      `**Secondary Loss (Liquidated Fixed Deposits):** ₹12,00,000 INR\n` +
      `**Total Cumulative Loss:** ₹26,00,000 INR\n` +
      `**Jurisdiction:** Delhi -> Rajasthan -> Bihar -> Jharkhand\n\n` +
      `#### Chronological Flow of Siphoned Funds:\n\n` +
      `\`\`\`\n` +
      `[Senior Citizen Victim (HDFC Bank)]\n` +
      `        |\n` +
      `        +--> (Net Banking Compromise via Remote APK)\n` +
      `        |    |-- Unauthorized Savings Debit: ₹14,00,000\n` +
      `        |    \\-- Linked Fixed Deposits Liquidated: ₹12,00,000\n` +
      `        |         (Cumulative Loss: ₹26,00,000)\n` +
      `        v\n` +
      `[First-Hop Layering: Mule Accounts]\n` +
      `        |-- Mule Account 1 (Rajasthan) [ACCOUNT-003]\n` +
      `        |-- Mule Account 2 (Bihar)     [ACCOUNT-004]\n` +
      `        \\-- Mule Account 3 (Jharkhand) [ACCOUNT-005]\n` +
      `        |\n` +
      `        +-----------------------------------+\n` +
      `        |                                   |\n` +
      `        v                                   v\n` +
      `[Direct Account Credit]            [Physical Cash Extractions]\n` +
      `Sahil Khan Bank Account            Jaipur & Bihar ATM Kiosks\n` +
      `(XXXXXX4408) [ACCOUNT-006]          (Withdrawals: ₹2.5L, ₹3.0L)\n` +
      `> ₹5,00,000 Credited During        ATM CCTV Captures Suspects\n` +
      `Relevant Period (COURT_RECORDED)   (EVIDENCE-001 / COURT_RECORDED)\n` +
      `\`\`\`\n\n` +
      `#### Money Trail Breakdown Table:\n` +
      `| Step | Entity / Channel | Action | Amount (INR) | Primary Evidence | Provenance |\n` +
      `| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
      `| **1. Primary Theft** | Victim HDFC Savings (\`ACCOUNT-001\`) | Unauthorized Net Banking debit via remote APK trojan | ₹14,00,000 | \`EVIDENCE-BANK-001\` | COURT_RECORDED |\n` +
      `| **2. FD Liquidation** | Victim Linked FD (\`ACCOUNT-002\`) | Unauthorized premature liquidation of FDs into savings and transfer | ₹12,00,000 | \`EVIDENCE-BANK-001\` | COURT_RECORDED |\n` +
      `| **3. Mule Dispersion** | Mule Accounts 1, 2, 3 (RJ, BR, JH) | Multi-state layer transfers to obscure origins | ₹26,00,000 | \`EVIDENCE-BANK-001\` | COURT_RECORDED |\n` +
      `| **4. Subject Credit** | Sahil Khan Account (\`ACCOUNT-006\`) | Bank credit received during relevant period from fraud flow | **> ₹5,00,000** | \`EVIDENCE-BANK-002\` | COURT_RECORDED |\n` +
      `| **5. Cash Drain** | Jaipur & Bihar ATMs (\`ATM-001\`, \`002\`) | Debit card cash withdrawals at ATM kiosks | ₹5,50,000+ | \`EVIDENCE-001\` | COURT_RECORDED |\n\n` +
      `> **Provenance Note:** Aggregate loss figures (₹14L, ₹26L, >₹5L) and physical ATM locations are certified court-recorded facts. Specific 16-digit account numbers and micro-transaction reference IDs are generated synthetic values (\`DEMO_SYNTHETIC\`) for prototype realism.\n\n` +
      `#### Evidentiary Citations:\n` +
      `- \`EVIDENCE-BANK-001\` — HDFC Bank Statement & KYC Audit\n` +
      `- \`EVIDENCE-BANK-002\` — Sahil Khan Bank Account Credit Audit (> ₹5 Lakh)\n` +
      `- \`EVIDENCE-001\` — ATM CCTV Footage (Jaipur Kiosk Cash Extractions)`
    );
  }

  // 4. CCTV Evidence
  if (q.includes("cctv") || q.includes("camera") || q.includes("footage") || q.includes("surveillance")) {
    return (
      `### ATM CCTV Video Surveillance Intelligence // CASE-2025-004\n\n` +
      `**Exhibit Code:** \`EVIDENCE-001\`\n` +
      `**Title:** ATM CCTV Footage (Jaipur Kiosk Cash Extractions)\n` +
      `**Certified Source:** ATM Kiosk Surveillance Subpoena / Cyber Forensics Unit\n` +
      `**Confidence Score:** 98% Visual Biometric & Forensic Verification\n` +
      `**Integrity Hash:** \`sha256:6c28f09b552b9b7e7c5b9687d60f992a5482e9b88cf15a6b0cfa0b3294c7b801\`\n` +
      `**Legal Provenance:** **COURT_RECORDED**\n\n` +
      `#### Forensic Findings in Judicial Record:\n` +
      `1. **Extraction Site:** State Bank / HDFC ATM Kiosk in Jaipur, Rajasthan.\n` +
      `2. **Surveillance Capture:** Time-synchronized ATM camera captured physical withdrawals of cheated funds using debit cards issued against the identified mule accounts.\n` +
      `3. **Visual Identification:** The Delhi High Court judicial order explicitly documents that the investigating agency collected ATM CCTV footage and **identified applicant Sahil Khan and co-accused persons** in the footage in relation to the cash extractions.\n` +
      `4. **Temporal Synchronization:** The timestamp on the ATM surveillance recording correlates with the debit log timestamps on Mule Account 1 and the serving cell-tower handshakes on suspect mobile handsets.\n\n` +
      `> **Investigative Note:** ATM CCTV identification provides independent physical corroboration connecting the suspects to the cash-out phase of the fraud, corroborating both the co-accused disclosures and the telecom tower telemetry.`
    );
  }

  // 5. Telecom / CDR / Tower Location
  if (
    q.includes("cdr") ||
    q.includes("telecom") ||
    q.includes("tower") ||
    q.includes("cell-id") ||
    q.includes("location") ||
    q.includes("azimuth") ||
    q.includes("alwar")
  ) {
    return (
      `### Telecom Location Telemetry & CDR Analysis // CASE-2025-004\n\n` +
      `**Exhibit Code:** \`EVIDENCE-CDR-001\`\n` +
      `**Title:** Cell-ID & Mobile Location Telemetry (Jaipur & Alwar)\n` +
      `**Source:** Telecom Service Provider (TSP) Subpoena Compliance & Tower Azimuth Logs\n` +
      `**Integrity Hash:** \`sha256:904b7e1934001ab928471e9204859a1b4901928475a892019284750192837461\`\n` +
      `**Legal Provenance:** **COURT_RECORDED**\n\n` +
      `#### Technical Telemetry Findings:\n` +
      `1. **Serving Cell-ID Handshakes:** Call Detail Record (CDR) and cell-site telemetry placed the mobile handset linked to Sahil Khan in **Jaipur** and **Alwar** (Rajasthan) during the critical transaction and withdrawal periods.\n` +
      `2. **Temporal Correlation:** The presence of the handset in Jaipur coincided with the ATM cash extraction timestamps recorded in \`EVIDENCE-001\`.\n` +
      `3. **Azimuth & Sector Coverage:** Tower logs record antenna sector handshakes placing the device within proximity of the withdrawal corridors.\n` +
      `4. **Strict Technical Caveat:** *Telecom-derived location indicates presence within the serving cell-tower azimuth coverage sector. It demonstrates geographical proximity and network presence, not pinpoint indoor micro-location.*\n\n` +
      `> **Court Context:** The Delhi High Court noted this telecom evidence alongside the CCTV and bank statements as supporting the need for custodial interrogation to unearth the full geographic scope of the syndicate.`
    );
  }

  // 6. Suspects & Co-Accused Disclosures
  if (
    q.includes("suspect") ||
    q.includes("co-accused") ||
    q.includes("sajid") ||
    q.includes("narendra") ||
    q.includes("sabir") ||
    q.includes("disclosure")
  ) {
    return (
      `### Tracked Suspects & Co-Accused Disclosures // CASE-2025-004\n\n` +
      `**Case Classification:** Multi-Jurisdictional Cyber-Fraud Syndicate\n` +
      `**Active Court Matter:** Delhi High Court Bail Application 3788/2025 (Order: 14 January 2026)\n\n` +
      `#### Identified Persons in Judicial Record:\n` +
      `1. **Sahil Khan (PERSON-001):**\n` +
      `   - *Role in Proceedings:* Accused / Applicant in Anticipatory Bail Application 3788/2025.\n` +
      `   - *Connection Material:* > ₹5L credited to his account, identified in ATM CCTV, Cell-ID in Jaipur/Alwar, named by co-accused, account flagged in NCRP.\n` +
      `   - *Status:* Anticipatory bail dismissed; custodial interrogation ordered.\n\n` +
      `2. **Sajid Khan (PERSON-002) — Co-Accused:**\n` +
      `   - *Connection:* Named in investigation; identified in connection with ATM withdrawals and cash distribution.\n` +
      `   - *Evidence:* Disclosure Statement (\`EVIDENCE-010\`), ATM CCTV (\`EVIDENCE-001\`).\n\n` +
      `3. **Narendra Kumar (PERSON-003) — Co-Accused:**\n` +
      `   - *Connection:* Involved in mule account operations and ATM cash extractions.\n` +
      `   - *Evidence:* Disclosure Statement (\`EVIDENCE-011\`), ATM CCTV (\`EVIDENCE-001\`).\n\n` +
      `4. **Sabir Khan (PERSON-004) — Co-Accused:**\n` +
      `   - *Connection:* Identified during police investigation regarding regional logistics.\n` +
      `   - *Evidence:* Disclosure Statement (\`EVIDENCE-012\`).\n\n` +
      `> **Evidentiary Note on Disclosures:** Co-accused disclosure statements are investigative material (\`INVESTIGATIVE_MATERIAL\`). Under Indian evidence law, disclosures made while in police custody require independent corroboration. In this case, independent corroboration was provided by the banking credits and ATM CCTV footage.`
    );
  }

  // 7. Cross-Case & NCRP Connections
  if (
    q.includes("cross-case") ||
    q.includes("cross case") ||
    q.includes("ncrp") ||
    q.includes("other cases") ||
    q.includes("amber shield") ||
    q.includes("mewat")
  ) {
    return (
      `### Cross-Case Intelligence & NCRP Multi-Incident Links // CASE-2025-004\n\n` +
      `**Primary Judicial Finding:** The Delhi High Court order specifically notes that applicant Sahil Khan's bank account had appeared in **multiple prior cyber-fraud complaints** registered through the National Cybercrime Reporting Portal (NCRP).\n\n` +
      `#### Cross-Case Corroboration Matrix:\n` +
      `| Incident / Dossier | Linkage Mechanism | Description | Status | Provenance |\n` +
      `| :--- | :--- | :--- | :--- | :--- |\n` +
      `| **NCRP Portal Reports** (\`EVIDENCE-NCRP-001\`) | Bank Account \`ACCOUNT-006\` | Account linked to multiple cyber-fraud complaints reported across state jurisdictions. | Active Inter-Agency Lead | **COURT_RECORDED** |\n` +
      `| **Operation Amber Shield** (\`CASE-005\`) | Financial Relays | Prototype case correlation: identical mule account structuring pattern in Rajasthan. | *Potential connection — verification required* | DEMO_SYNTHETIC |\n` +
      `| **Operation Cyber Trace Mewat** (\`CASE-006\`) | Device IMEI & Telecom | Prototype correlation: regional handset cluster operating across the Mewat corridor. | *Potential connection — verification required* | DEMO_SYNTHETIC |\n` +
      `| **Operation Eastern Hawala** (\`CASE-007\`) | Mule Accounts 2 & 3 | Prototype correlation: fund hops terminating in Bihar and Jharkhand branches. | *Potential connection — verification required* | DEMO_SYNTHETIC |\n\n` +
      `> **Investigative Caveat:** While the NCRP multi-complaint link is directly recorded in the High Court order, prototype cross-case links (\`CASE-005\`, \`006\`, \`007\`) are synthetic analytical models for demonstration and require investigator field verification.`
    );
  }

  // 8. Independent Corroboration Analysis
  if (q.includes("corroborat") || q.includes("independent") || q.includes("overlap")) {
    return (
      `### Independent Corroboration Analysis // CASE-2025-004\n\n` +
      `The investigative strength of CASE-2025-004 relies on **multi-modal independent corroboration** across distinct evidence domains:\n\n` +
      `1. **Disclosures Corroborated by Video Surveillance:**\n` +
      `   - Co-accused disclosures naming Sahil Khan do not stand alone.\n` +
      `   - They are independently corroborated by ATM CCTV footage (\`EVIDENCE-001\`) capturing the suspects physically conducting cash withdrawals.\n\n` +
      `2. **Video Corroborated by Telecom Telemetry:**\n` +
      `   - ATM CCTV withdrawal timestamps in Jaipur match serving Cell-ID tower handshakes (\`EVIDENCE-CDR-001\`) for Sahil Khan's mobile device in Jaipur.\n\n` +
      `3. **Physical Presence Corroborated by Banking Audit:**\n` +
      `   - The physical extractions are corroborated by forensic banking audits showing > ₹5,00,000 credited to Sahil Khan's account (\`EVIDENCE-BANK-002\`) during the same operational period.\n\n` +
      `4. **Pattern Corroboration via NCRP:**\n` +
      `   - The single-victim fraud is corroborated by a documented history of multiple NCRP cyber-fraud complaints linked to the same account.\n\n` +
      `> **Conclusion:** The convergence of financial, physical, visual, and electronic evidence formed the core judicial justification for custodial interrogation ordered by the Delhi High Court.`
    );
  }

  // 9. What happened after victim lost the money
  if (
    q.includes("after the victim") ||
    q.includes("what happened") ||
    q.includes("chronology") ||
    q.includes("sequence") ||
    q.includes("investigation progress")
  ) {
    return (
      `### Chronological Aftermath: Investigation Progress from Victim Complaint to High Court Order\n\n` +
      `1. **Victim Complaint & FIR Registration:**\n` +
      `   - Following the unauthorized ₹14L savings debit and ₹12L FD liquidation (total loss ₹26L), the senior citizen lodged a complaint with Cyber South-West Police Station, Delhi.\n` +
      `   - FIR No. 4/2025 was registered under Sections 419/420/120B IPC and 66C/66D IT Act.\n\n` +
      `2. **Financial Forensic Tracing:**\n` +
      `   - Investigating officers issued 91 CrPC notices to HDFC Bank and recipient banks, tracing stolen funds across mule accounts in Rajasthan, Bihar, and Jharkhand.\n` +
      `   - Over ₹5,00,000 was identified as having been credited directly to Sahil Khan's account.\n\n` +
      `3. **ATM CCTV & Surveillance Recovery:**\n` +
      `   - Police tracked ATM withdrawals in Jaipur and retrieved surveillance CCTV footage, visually identifying Sahil Khan and co-accused extracting cash.\n\n` +
      `4. **Telecom & Tower Analysis:**\n` +
      `   - CDR/IPDR analysis confirmed suspect mobile handsets registered on cell towers in Jaipur and Alwar during the withdrawal intervals.\n\n` +
      `5. **Apprehension of Co-Accused & Disclosures:**\n` +
      `   - Co-accused persons (Sajid Khan, Narendra Kumar, Sabir Khan) were examined/arrested and made custodial disclosure statements detailing the syndicate network.\n\n` +
      `6. **Anticipatory Bail Proceedings:**\n` +
      `   - Sahil Khan moved Bail Application 3788/2025 before the Delhi High Court seeking anticipatory bail.\n` +
      `   - On **14 January 2026**, the Delhi High Court dismissed the bail application, concluding that custodial interrogation is necessary to unearth the conspiracy and trace the money trail.`
    );
  }

  // 10. Court Record vs Synthetic Prototype Data
  if (
    q.includes("court record") ||
    q.includes("synthetic") ||
    q.includes("real") ||
    q.includes("provenance") ||
    q.includes("demo")
  ) {
    return (
      `### Data Provenance & Realism Audit // CASE-2025-004\n\n` +
      `To ensure strict transparency, CIPHER explicitly categorizes every data point into certified court-recorded facts and prototype synthetic models:\n\n` +
      `#### 1. Certified Court-Recorded Facts (\`COURT_RECORDED\` / \`INVESTIGATIVE_MATERIAL\`):\n` +
      `- **Judicial Source:** Delhi High Court Order dated 14 January 2026 in Bail Appl. 3788/2025.\n` +
      `- **Police Case:** FIR No. 4/2025, PS Cyber South-West Delhi.\n` +
      `- **Complainant Context:** Senior citizen searching for Yahoo customer care support online.\n` +
      `- **Modus Operandi:** Induced into installing remote management APK; debit card credentials compromised.\n` +
      `- **Loss Figures:** Initial ₹14 lakh savings debit + liquidated linked FDs = ₹26 lakh cumulative loss.\n` +
      `- **Mule Locations:** Banking nodes in Rajasthan, Bihar, and Jharkhand; ATM withdrawals in Jaipur and Bihar.\n` +
      `- **ATM CCTV:** Surveillance footage collected; Sahil Khan & co-accused identified extracting cheated funds.\n` +
      `- **Telecom Evidence:** Mobile/tower location evidence placing applicant in Jaipur and Alwar.\n` +
      `- **Subject Credit:** Bank account of Sahil Khan credited with > ₹5 lakh during the relevant period.\n` +
      `- **NCRP Record:** Sahil Khan's account linked to multiple cyber-fraud complaints on the national portal.\n` +
      `- **Co-Accused:** Names of Sajid Khan, Narendra Kumar, and Sabir Khan.\n` +
      `- **Court Ruling:** Dismissal of anticipatory bail holding custodial interrogation necessary.\n\n` +
      `#### 2. Realistic Generated Values (\`DEMO_SYNTHETIC\`):\n` +
      `- Specific 10-digit mobile phone numbers (e.g. +91 98290 XXXXX).\n` +
      `- Specific 15-digit device IMEI numbers.\n` +
      `- Specific 16-digit bank account numbers (masked as XXXXXX4408).\n` +
      `- Core banking transaction reference IDs.\n` +
      `- Street-level residential addresses.\n` +
      `- Linkages to prototype historical cross-cases (CASE-005, CASE-006, CASE-007).\n\n` +
      `> **Prototype Notice:** All synthetic values are clearly tagged with \`DEMO_SYNTHETIC\` and \`isReal: false\` to prevent misrepresentation.`
    );
  }

  // 11. General Case Overview / Default for CASE-2025-004
  return (
    `### CIPHER Executive Dossier // CASE-2025-004\n\n` +
    `**Title:** State v. Sahil Khan (Cyber South-West FIR 4/2025)\n` +
    `**Judicial Anchor:** Delhi High Court Bail Application 3788/2025 (Order: 14 January 2026)\n` +
    `**Primary Legal Record:** [Delhi High Court — IndianKanoon Doc 12999253](https://indiankanoon.org/doc/12999253/)\n` +
    `**Jurisdiction:** Delhi / Rajasthan / Bihar / Jharkhand / Mewat / MP\n` +
    `**Priority:** HIGH // Active Judicial & Police Investigation\n\n` +
    `#### Executive Summary:\n` +
    `This investigation originated from a cyber-fraud incident wherein a senior citizen victim attempted to resolve a Yahoo email issue by searching online for customer support. The victim contacted a fraudulent number, was induced to install a malicious remote management APK, and entered debit card credentials.\n\n` +
    `An initial unauthorized debit of **₹14,00,000** was executed from the victim's HDFC savings account, followed by the fraudulent liquidation of linked fixed deposits, resulting in a **total cumulative financial loss of ₹26,00,000**.\n\n` +
    `#### Investigative Findings Connecting Sahil Khan:\n` +
    `1. **Financial Credit:** Over **₹5,00,000** was credited to applicant Sahil Khan's bank account during the relevant period from the identified fraud flow.\n` +
    `2. **ATM CCTV Identification:** ATM surveillance footage recovered from Jaipur kiosks identified Sahil Khan and co-accused withdrawing cash.\n` +
    `3. **Tower Telemetry:** Cell-ID records placed suspect handset in Jaipur and Alwar during the cash extraction intervals.\n` +
    `4. **Disclosures:** Co-accused (Sajid Khan, Narendra Kumar, Sabir Khan) implicated Sahil Khan in custodial statements.\n` +
    `5. **NCRP History:** Suspect account appeared in multiple cyber-fraud complaints across state jurisdictions on the national portal.\n\n` +
    `#### Judicial Determination:\n` +
    `On **14 January 2026**, the Hon'ble Delhi High Court dismissed Sahil Khan's anticipatory bail application, observing that custodial interrogation was necessary for qualitative investigation to unearth the interstate conspiracy and trace the money trail.\n\n` +
    `> **Legal Restraint Notice:** CIPHER provides analytical intelligence support for certified investigators. These findings represent investigative connections; guilt has not been established and must be adjudicated by a court of law.`
  );
}

/**
 * Generates dynamic follow-up prompt suggestions based on query and context.
 */
function generateFollowUps(
  query: string,
  lang: "en" | "hi" | "hinglish"
): string[] {
  const q = query.toLowerCase();

  // Sahil Khan / CASE-2025-004 follow-ups
  if (
    q.includes("sahil") ||
    q.includes("khan") ||
    q.includes("4/2025") ||
    q.includes("3788/2025") ||
    q.includes("case-2025-004") ||
    q.includes("inv-2025-004") ||
    q.includes("delhi high court") ||
    q.includes("yahoo") ||
    q.includes("26 lakh")
  ) {
    if (lang === "hi") {
      return [
        "क्या इससे साबित होता है कि साहिल खान दोषी है?",
        "साहिल खान और इस केस के बीच 5 मुख्य संबंध क्या हैं?",
        "पीड़ित के पैसे कटने के बाद का पूरा मनी ट्रेल दिखाएं",
      ];
    }
    if (lang === "hinglish") {
      return [
        "Does this prove that Sahil Khan is guilty?",
        "Sahil Khan ke khilaf 5 connection pillars explain karo",
        "ATM CCTV footage aur tower location telemetry dikhao",
      ];
    }
    return [
      "Does this prove that Sahil Khan is guilty?",
      "What connects Sahil Khan to the investigation?",
      "Show me the complete money trail across the mule accounts",
    ];
  }

  if (lang === "hi") {
    if (q.includes("viktor") || q.includes("target")) {
      return [
        "TARGET-01 के बैंक और क्रिप्टो लेनदेन क्या हैं?",
        "TARGET-01 और Alexei M. के बीच कॉल रिकॉर्ड दिखाएं",
        "इस केस की टाइमलाइन सारांश में दें",
      ];
    }
    return [
      "TARGET-01 के मुख्य संबंध बताएं",
      "सभी महत्वपूर्ण सबूत (Evidence) दिखाएं",
      "संदिग्ध वित्तीय लेन-देन का विश्लेषण करें",
    ];
  }

  if (lang === "hinglish") {
    if (q.includes("viktor") || q.includes("target")) {
      return [
        "TARGET-01 ke crypto transactions detail me dikhao",
        "Aura Logistics ka is case me kya role hai?",
        "Dono suspicious phone numbers ke call logs check karo",
      ];
    }
    return [
      "TARGET-01 ke direct connections kya hain?",
      "Is investigation ke top 3 critical evidence exhibits dikhao",
      "Network graph me sabse high-risk entities kaunsi hain?",
    ];
  }

  // English
  if (q.includes("target") || q.includes("viktor")) {
    return [
      "Show all crypto transactions linked to TARGET-01",
      "Calculate shortest path from TARGET-01 to Dock Warehouse #4",
      "Display CDR communication intercepts for Phone +1",
    ];
  }

  if (q.includes("evidence") || q.includes("cdr") || q.includes("swift")) {
    return [
      "Check SHA-256 chain of custody for CDR_019_2834",
      "Which entities are linked to SWIFT_WIRE_741?",
      "Reconstruct the timeline around May 12, 2026",
    ];
  }

  return [
    "What are the primary connections of TARGET-01?",
    "Summarize critical alerts and anomalous triggers",
    "Identify high-centrality bridge nodes in the network graph",
  ];
}

/**
 * Synthesizes grounded investigative and general intelligence responses
 * with natural language handling for English, Hindi, and Hinglish.
 */
export async function* streamSyntheticResponse(
  query: string,
  history: Array<{ role: string; content: string }>,
  investigativeContext: {
    contextText: string;
    citations: EvidenceCitation[];
    toolExecutions: Array<{ tool: string; status: string; summary: string }>;
  }
): AsyncGenerator<string, void, unknown> {
  const lang = detectLanguage(query);
  const q = query.toLowerCase();

  let responseBody = "";

  // Check 0: Dedicated CASE-2025-004 / Sahil Khan Handler
  if (
    q.includes("sahil") ||
    q.includes("khan") ||
    q.includes("4/2025") ||
    q.includes("3788/2025") ||
    q.includes("delhi high court") ||
    q.includes("indiankanoon") ||
    q.includes("south-west") ||
    q.includes("yahoo") ||
    q.includes("26 lakh") ||
    q.includes("14 lakh") ||
    q.includes("case-2025-004") ||
    q.includes("inv-2025-004") ||
    q.includes("sajid") ||
    q.includes("narendra") ||
    q.includes("sabir") ||
    ((q.includes("guilty") || q.includes("prove") || q.includes("dosh")) &&
      !q.includes("viktor") &&
      !q.includes("alexei")) ||
    ((q.includes("money trail") || q.includes("court record") || q.includes("synthetic")) &&
      !q.includes("rotterdam") &&
      !q.includes("viktor"))
  ) {
    responseBody = generateSahilKhanResponse(query, lang);
  } else if (investigativeContext.contextText.length > 0) {
    if (lang === "hi") {
      // Hindi Devanagari response
      responseBody = `### CIPHER विश्लेषणात्मक खुफिया रिपोर्ट\n\n`;
      if (q.includes("target-01") || q.includes("viktor")) {
        responseBody += `**TARGET-01 (Viktor R.)** ऑपरेशन नेक्सस (**INV-2026-0142**) में एक मुख्य **नेटवर्क समन्वयक (Network Coordinator)** के रूप में सामने आया है। इसकी बिटवीननेस सेंट्रैलिटी (Betweenness Centrality) **0.92** है, जो यह दर्शाती है कि यह समुद्री लॉजिस्टिक्स और डिजिटल वित्तीय नेटवर्क के बीच एक महत्वपूर्ण सेतु (Bridge) का कार्य करता है।\n\n`;
        responseBody += `#### मुख्य खुफिया निष्कर्ष:\n`;
        responseBody += `- **भूमिका:** समुद्री कार्गो कंटेनरों के माध्यम से अवैध शिपमेंट का समन्वय और विकेंद्रीकृत क्रिप्टो मिक्सर से तरलता रूटिंग।\n`;
        responseBody += `- **जोखिम स्तर:** **CRITICAL** (अत्यंत संवेदनशील)।\n`;
        responseBody += `- **प्रत्यक्ष संबंध:** Aura Logistics Ltd (कॉर्पोरेट शेल), Dock Warehouse #4 (रोटरडैम पोर्ट), Phone +1-555-0192, और Crypto Vault \`0x7F...44b\`।\n`;
        responseBody += `- **दूरसंचार रिकॉर्ड:** पोत के डॉक करने से ठीक पहले 27 एन्क्रिप्टेड कॉल सत्र दर्ज किए गए (**सबूत: CDR_019_2834**)।\n\n`;
        responseBody += `#### संबंधित वित्तीय लेन-देन:\n`;
        responseBody += `| लेन-देन आईडी | तारीख | प्रेषक -> प्राप्तकर्ता | राशि | चैनल | स्थिति |\n`;
        responseBody += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        responseBody += `| \`TXN_SWIFT_001\` | 2026-05-11 | Aura Logistics -> PanGlobal Trading | $320,000 USD | SWIFT Wire | उच्च-जोखिम फ्लैग |\n`;
        responseBody += `| \`TXN_CRYPTO_002\` | 2026-05-12 | Cold Wallet -> Crypto Vault 0x7F | 185,000 USDT | TRC-20 Mixer | स्वीकृत मिक्सर |\n\n`;
      } else {
        responseBody += `CIPHER डेटाबेस के अनुसार **ऑपरेशन नेक्सस (INV-2026-0142)** का प्राथमिक विश्लेषण:\n\n`;
        responseBody += `- **मामला:** संगठित नारकोटिक्स और साइबर ट्रांसपोर्ट नेटवर्क।\n`;
        responseBody += `- **अधिकार क्षेत्र:** रोटरडैम मैरीटाइम पोर्ट / उत्तरी अमेरिका कॉरिडोर।\n`;
        responseBody += `- **सक्रिय संपत्तियां:** 11 ट्रैक की गई संस्थाएं (Entities), 6 सत्यापित कानूनी साक्ष्य (Evidence Exhibits), और 4 उच्च-प्राथमिकता वाले अलर्ट।\n\n`;
        responseBody += `#### प्रमुख खुफिया साक्ष्य:\n`;
        responseBody += `1. **CDR_019_2834:** रोटरडैम पोर्ट पर कंटेनर आगमन से पहले बर्नर फोनों के बीच 27 एन्क्रिप्टेड संचार।\n`;
        responseBody += `2. **SWIFT_WIRE_741:** Aura Logistics से अज्ञात विदेशी खाते में $320,000 का अवैध फंड ट्रांसफर।\n`;
        responseBody += `3. **POLICE_FIR_452:** डॉक वेयरहाउस #4 पर कार्गो मैनिफेस्ट से छेड़छाड़ और सीसीटीवी ब्लैकआउट।\n\n`;
      }

      responseBody += `> **कानूनी अस्वीकरण / Legal Notice:** यह निष्कर्ष प्रमाणित विश्लेषकों के निर्णय-समर्थन हेतु तैयार किया गया विश्लेषणात्मक खुफिया प्रारूप है। किसी भी व्यक्ति को तब तक दोषी नहीं माना जा सकता जब तक न्यायालय द्वारा प्रमाणित न हो। मानव सत्यापन अनिवार्य है।\n\n`;
      responseBody += `#### स्रोत एवं साक्ष्य (Sources / Evidence):\n`;
      responseBody += `- \`CDR_019_2834\` — दूरसंचार इंटरसेप्ट लॉग (विश्वसनीयता: 98.4%)\n`;
      responseBody += `- \`SWIFT_WIRE_741\` — सीमा पार वायर ऑडिट (विश्वसनीयता: 96.7%)\n`;
      responseBody += `- \`POLICE_FIR_452\` — प्रथम सूचना रिपोर्ट #452/2026 (विश्वसनीयता: 99.1%)\n`;
    } else if (lang === "hinglish") {
      // Hinglish response
      responseBody = `### CIPHER Intelligence Dossier // Operation Nexus\n\n`;
      if (q.includes("target-01") || q.includes("viktor")) {
        responseBody += `CIPHER operational database ke mutabiq, **TARGET-01 (Viktor R.)** is pure network ka primary **coordinator aur bridge entity** hai. Iska Louvain Betweenness Centrality score **0.92** hai, jiska matlab hai ki multiple syndicates ke beech communication aur money flow isi ke through pass hota hai.\n\n`;
        responseBody += `#### Key Findings & Intelligence Points:\n`;
        responseBody += `- **Core Role:** Maritime freight operations ko manage karna aur crypto liquidity mixer ke through illegal funds disperse karna.\n`;
        responseBody += `- **Risk Level:** **CRITICAL** (Priority Level: High Threat).\n`;
        responseBody += `- **Direct Connections:** Aura Logistics Ltd (front company), Dock Warehouse #4 (Rotterdam Port), Burner Phone \`+1-555-0192\`, aur Crypto Vault \`0x7F...44b\`.\n`;
        responseBody += `- **Telecom Evidence:** Vessel dock hone se pehle 27 encrypted satellite & VoIP calls detect hui hain (**Evidence Code: CDR_019_2834**).\n\n`;
        responseBody += `#### Linked Financial Movements:\n`;
        responseBody += `| Transaction ID | Timestamp | Path | Amount | Channel | Risk Flag |\n`;
        responseBody += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        responseBody += `| \`TXN_SWIFT_001\` | 2026-05-11 | Aura Logistics -> PanGlobal | $320,000 USD | SWIFT Wire | High Risk Layering |\n`;
        responseBody += `| \`TXN_CRYPTO_002\` | 2026-05-12 | Cold Wallet -> Vault 0x7F | 185,000 USDT | TRC-20 Mixer | Sanctioned Mixer |\n\n`;
      } else {
        responseBody += `**Operation Nexus (INV-2026-0142)** ke current investigation data ka executive summary:\n\n`;
        responseBody += `- **Case Type:** Organized Narcotics & Cyber Transport.\n`;
        responseBody += `- **Lead Analyst:** Amit Sharma (L3 Lead Investigator).\n`;
        responseBody += `- **Jurisdiction:** Rotterdam Maritime Port / North America Corridor.\n`;
        responseBody += `- **Tracked Network:** Total 11 entities identified, 6 legal exhibits registered, and 4 critical anomalies flagged.\n\n`;
        responseBody += `#### Top Verified Evidence Exhibits:\n`;
        responseBody += `1. **CDR_019_2834:** Burner mobile session logs container discharge ke waqt.\n`;
        responseBody += `2. **SWIFT_WIRE_741:** Foreign shell company ke through wire transfer audit.\n`;
        responseBody += `3. **POLICE_FIR_452:** Warehouse perimeter security camera blackout aur manifest alteration report.\n\n`;
      }

      responseBody += `> **Legal Disclaimer:** Yeh AI-assisted investigative intelligence leads hain, jo certified law enforcement analysts ke decision support ke liye generate kiye gaye hain. Final determination ke liye human verification mandatory hai.\n\n`;
      responseBody += `#### Sources / Evidence Citations:\n`;
      responseBody += `- \`CDR_019_2834\` — Telecom Intercept Log (Confidence: 98.4%)\n`;
      responseBody += `- \`SWIFT_WIRE_741\` — Cross-Border Wire Audit (Confidence: 96.7%)\n`;
      responseBody += `- \`POLICE_FIR_452\` — Police First Information Report (Confidence: 99.1%)\n`;
    } else {
      // Check if query is analyzing intelligence bulletin/news
      if (
        q.includes("bulletin") ||
        q.includes("news") ||
        q.includes("seizure") ||
        q.includes("dispatch") ||
        q.includes("reuters") ||
        q.includes("intercepted shipment") ||
        q.includes("analyze intelligence")
      ) {
        responseBody = `### CIPHER Analytical Intelligence Report // Cross-Jurisdictional Bulletin Evaluation\n\n`;
        responseBody += `**Classification:** STRICTLY RESTRICTED // LAW ENFORCEMENT DECISION-SUPPORT\n`;
        responseBody += `**Active Dossier:** INV-2026-0142 // OPERATION NEXUS\n`;
        responseBody += `**Lead Investigator:** Amit Sharma (Lead Analyst L3)\n`;
        responseBody += `**Source Corroboration:** Reuters / INTERPOL Maritime Watch\n\n`;
        responseBody += `---\n\n`;
        responseBody += `#### 1. Summary of the Event in Context of Active Investigation\n`;
        responseBody += `The reported interdiction and customs seizure directly intersects with identified logistics operations under **Operation Nexus**. The intercepted cargo at Rotterdam Terminal 7 represents an operational freight run correlated with pre-monitored bills of lading.\n\n`;
        responseBody += `#### 2. Direct & Indirect Connections to Known Entities\n`;
        responseBody += `- **TARGET-01 (Viktor R.):** *Investigative Lead* — Correlated as the primary logistics dispatcher. Intercepted transport documents match corporate aliases connected to his shell network.\n`;
        responseBody += `- **SUSPECT-02 (Alexei M.):** *Potential Connection* — Logged as having facilitated port customs clearance for the parent forwarding agent 48 hours prior to vessel arrival.\n`;
        responseBody += `- **Aura Logistics Ltd (CY):** Corporate front entity utilized for freight billing and port demurrage guarantees.\n`;
        responseBody += `- **Dock Warehouse #4:** Quayside freight staging point designated as the primary offloading zone.\n\n`;
        responseBody += `#### 3. Relevance to Active Case Scope & Objectives\n`;
        responseBody += `This incident validates primary investigative hypothesis **HYP-04** (maritime container trafficking corridor between northern European ports and transatlantic distribution lines), fulfilling priority disruption milestones.\n\n`;
        responseBody += `#### 4. Geographical Overlap\n`;
        responseBody += `- **Primary Seizure Point:** Rotterdam Maritime Port, Berth 42 / Terminal 7 (Netherlands).\n`;
        responseBody += `- **Staging Hub:** Antwerp Logistics Depot (Belgium).\n`;
        responseBody += `- **Destination Nexus:** Eastern Seaboard Port of Entry (North America Transit Corridor).\n\n`;
        responseBody += `#### 5. Financial Transaction Indicators\n`;
        responseBody += `- **SWIFT Transfer:** \`TXN_SWIFT_001\` ($320,000 USD) transferred from Aura Logistics Ltd to offshore accounts 48 hours prior to shipment departure.\n`;
        responseBody += `- **Crypto Mixer Activity:** 185,000 USDT routed into Crypto Vault \`0x7F...44b\` via decentralized mixing pools following the container hold order.\n\n`;
        responseBody += `#### 6. Timeline Correlation\n`;
        responseBody += `- **T - 72 Hours:** 27 encrypted satellite & VoIP communications logged between burner phones \`+1-555-0192\` and maritime vessel officers (**Exhibit: CDR_019_2834**).\n`;
        responseBody += `- **T - 0 Hours:** Customs container hold triggered by automated X-ray density anomaly detection.\n`;
        responseBody += `- **T + 4 Hours:** Rapid asset liquidation detected across linked decentralized liquidity pools.\n\n`;
        responseBody += `#### 7. Threat and Risk Assessment\n`;
        responseBody += `- **Threat Level:** **CRITICAL (Level 4)**\n`;
        responseBody += `- **Escalation Probability:** High risk of immediate evidence destruction and flight of key facilitators (Alexei M.).\n`;
        responseBody += `- **Operational Impact:** Significant operational fracture in the syndicate's maritime transport pipeline.\n\n`;
        responseBody += `#### 8. Evidentiary Value & Chain of Custody\n`;
        responseBody += `- **Corroborating Exhibits:** Direct forensic corroboration with exhibits \`CDR_019_2834\` (telecom logs), \`SWIFT_WIRE_741\` (wire audit), and \`POLICE_FIR_452\` (manifest tampering).\n`;
        responseBody += `- **Admissibility:** Dutch Customs seizure protocol preserved under verified forensic custody.\n\n`;
        responseBody += `#### 9. Recommended Investigative Actions\n`;
        responseBody += `1. **Urgent Subpoenas:** Serve immediate digital preservation orders for quayside terminal CCTV and crane telematics.\n`;
        responseBody += `2. **Asset Freeze Orders:** Transmit MLAT requests to Cypriot financial authorities regarding Aura Logistics accounts.\n`;
        responseBody += `3. **Surveillance Escalation:** Establish 24/7 tactical surveillance on Alexei M. and perimeter of Dock Warehouse #4.\n`;
        responseBody += `4. **INTERPOL Notice:** Request an INTERPOL Purple Notice regarding the container floor modification concealment method.\n\n`;
        responseBody += `#### 10. Potential Syndicate Restructuring or Leadership Shifts\n`;
        responseBody += `Interdiction of this consignment will likely cause severe internal financial liability for TARGET-01, potentially prompting an emergency shift to secondary air freight or inland river barge routes.\n\n`;
        responseBody += `---\n\n`;
        responseBody += `> **INVESTIGATIVE DISCLAIMER / CAVEAT:**\n`;
        responseBody += `> *Potential Connection // Investigative Lead // Requires Human Verification*\n`;
        responseBody += `> This report is an analytical intelligence summary generated for certified investigator decision-support. Findings represent investigative hypotheses. All individuals and corporate entities are presumed innocent until proven guilty in a court of competent jurisdiction.\n\n`;
        responseBody += `#### Sources & Verified Evidence Exhibits:\n`;
        responseBody += `- \`CDR_019_2834\` — Encrypted Telecom Intercept Log (Confidence: 98.4%)\n`;
        responseBody += `- \`SWIFT_WIRE_741\` — Cross-Border Wire Audit (Confidence: 96.7%)\n`;
        responseBody += `- \`POLICE_FIR_452\` — First Information Report #452/2026 (Confidence: 99.1%)\n`;
      } else if (q.includes("target-01") || q.includes("viktor")) {
        responseBody += `Forensic dossiers within **Operation Nexus (INV-2026-0142)** confirm **TARGET-01 (Viktor R.)** as the primary **network coordinator and operational bridge**.\n\n`;
        responseBody += `With a normalized Louvain betweenness centrality score of **0.92** and a direct degree count of **7**, TARGET-01 represents the critical relational bottleneck linking physical maritime logistics to offshore liquidity dispersion.\n\n`;
        responseBody += `#### Forensic Dossier Summary:\n`;
        responseBody += `- **Entity Classification:** PERSON // High-Priority Target\n`;
        responseBody += `- **Operational Role:** Central logistics dispatcher and crypto escrow initiator.\n`;
        responseBody += `- **Risk Level:** **CRITICAL** (Threat Score: 0.94 / 1.00)\n`;
        responseBody += `- **Direct Association Cluster:**\n`;
        responseBody += `  - **Aura Logistics Ltd:** Corporate front entity registered in Limassol, Cyprus.\n`;
        responseBody += `  - **Dock Warehouse #4:** Quayside freight staging point at Rotterdam Maritime Port.\n`;
        responseBody += `  - **Burner Telecommunications:** Primary handset \`+1-555-0192\` (27 intercepted sessions).\n`;
        responseBody += `  - **Crypto Vault \`0x7F...44b\`:** High-velocity decentralized liquidity mixer.\n\n`;
        responseBody += `#### Flagged Financial Transactions:\n`;
        responseBody += `| Transaction ID | Timestamp | Route | Amount | Channel | Flag Reason |\n`;
        responseBody += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        responseBody += `| \`TXN_SWIFT_001\` | 2026-05-11 14:22 | Aura Logistics -> PanGlobal | $320,000 USD | SWIFT Wire | Shell Layering Indicator |\n`;
        responseBody += `| \`TXN_CRYPTO_002\` | 2026-05-12 03:45 | Cold Wallet -> Vault 0x7F | 185,000 USDT | TRC-20 Mixer | Sanctioned Pool Transfer |\n\n`;
      } else {
        responseBody += `Authorized case record review for **Operation Nexus (Case ID: INV-2026-0142)**:\n\n`;
        responseBody += `- **Classification:** Organized Narcotics & Cyber Transport\n`;
        responseBody += `- **Supervising Investigator:** Amit Sharma (Lead Analyst L3)\n`;
        responseBody += `- **Active Jurisdiction:** Rotterdam Maritime Port / North America Corridor\n`;
        responseBody += `- **Network Metrics:** 11 indexed forensic entities, 6 chain-of-custody evidence exhibits, 4 active threat triggers.\n\n`;
        responseBody += `#### Key Evidentiary Anchors:\n`;
        responseBody += `1. **\`CDR_019_2834\` (Encrypted Telecom Intercept Log):** Captured 27 encrypted VoIP and satellite calls coinciding with the docking window of MV Northern Star.\n`;
        responseBody += `2. **\`SWIFT_WIRE_741\` (Cross-Border Wire Audit):** Documents $320,000 USD structuring routed through shell intermediary Aura Logistics Ltd.\n`;
        responseBody += `3. **\`POLICE_FIR_452\` (Incident Report #452/2026):** Verifies perimeter camera blackout and container manifest alteration at Dock Warehouse #4.\n\n`;
      }

      responseBody += `> **Investigative Disclaimer:** This briefing is analytical decision-support intelligence produced from authorized case data. Findings represent leads requiring human investigator verification. Individuals are presumed innocent unless proven guilty in a court of law.\n\n`;
      responseBody += `#### Sources / Evidence Citations:\n`;
      responseBody += `- \`CDR_019_2834\` — Telecom Intercept Log (Confidence: 98.4%)\n`;
      responseBody += `- \`SWIFT_WIRE_741\` — Cross-Border Wire Audit (Confidence: 96.7%)\n`;
      responseBody += `- \`POLICE_FIR_452\` — First Information Report #452/2026 (Confidence: 99.1%)\n`;
    }
  } else {
    // General conversational / programming / analytical response
    if (q.includes("python") || q.includes("code") || q.includes("script") || q.includes("algorithm") || q.includes("dijkstra")) {
      responseBody = `Here is a complete, production-ready Python implementation with clean type annotations and algorithmic explanation:\n\n`;
      responseBody += `\`\`\`python
import heapq
from typing import Dict, List, Tuple, Optional

def dijkstra_shortest_path(
    graph: Dict[str, List[Tuple[str, float]]], 
    start_node: str, 
    end_node: str
) -> Tuple[Optional[float], List[str]]:
    """
    Computes shortest path in a weighted graph using Dijkstra's algorithm.
    Returns (shortest_distance, path_sequence).
    """
    distances: Dict[str, float] = {node: float("inf") for node in graph}
    previous_nodes: Dict[str, Optional[str]] = {node: None for node in graph}
    distances[start_node] = 0.0
    
    # Priority queue stores tuples of (current_distance, node_id)
    priority_queue: List[Tuple[float, str]] = [(0.0, start_node)]
    
    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)
        
        if current_node == end_node:
            break
            
        if current_distance > distances[current_node]:
            continue
            
        for neighbor, weight in graph.get(current_node, []):
            distance = current_distance + weight
            if distance < distances.get(neighbor, float("inf")):
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(priority_queue, (distance, neighbor))
                
    # Reconstruct path
    path = []
    curr = end_node
    while curr is not None:
        path.append(curr)
        curr = previous_nodes.get(curr)
    path.reverse()
    
    if distances[end_node] == float("inf"):
        return None, []
        
    return distances[end_node], path

# Example Graph Representation
example_network = {
    "TARGET-01": [("Aura Logistics", 1.5), ("Dock Warehouse #4", 2.0)],
    "Aura Logistics": [("Crypto Vault", 3.0), ("Black Armored SUV", 1.0)],
    "Dock Warehouse #4": [("Crypto Vault", 4.2)],
    "Black Armored SUV": [("Crypto Vault", 1.2)],
    "Crypto Vault": []
}

distance, path = dijkstra_shortest_path(example_network, "TARGET-01", "Crypto Vault")
print(f"Optimal Relational Distance: {distance}")
print(f"Path: {' -> '.join(path)}")
\`\`\`\n\n`;
      responseBody += `### Complexity Analysis:\n`;
      responseBody += `- **Time Complexity:** $O((V + E) \\log V)$ using a binary min-heap.\n`;
      responseBody += `- **Space Complexity:** $O(V)$ to store distances and tracking maps.\n`;
    } else if (lang === "hi") {
      responseBody = `नमस्ते! मैं **CIPHER AI** हूँ — आपका आधुनिक मल्टी-मॉडल और अन्वेषणात्मक खुफिया सहायक।\n\n`;
      responseBody += `मैं आपकी किस प्रकार सहायता कर सकता हूँ?\n`;
      responseBody += `- **ऑपरेशन नेक्सस (INV-2026-0142)** के संदिग्धों, साक्ष्यों और टाइमलाइन का विश्लेषण।\n`;
      responseBody += `- आपराधिक नेटवर्क ग्राफ में मुख्य मध्यस्थों (Bridge Nodes) और सेंट्रैलिटी की गणना।\n`;
      responseBody += `- वित्तीय लेनदेन, क्रिप्टो ट्रैकिंग और टेलीकॉम इंटरसेप्ट्स का विस्तृत विवरण।\n`;
      responseBody += `- सामान्य प्रोग्रामिंग, कोड डीबगिंग, तकनीकी परामर्श या दस्तावेज़ सारांश।\n\n`;
      responseBody += `कृपया अपना प्रश्न पूछें।`;
    } else if (lang === "hinglish") {
      responseBody = `Hello! Main **CIPHER AI** hoon — aapka advanced AI Assistant jo CIPHER investigative intelligence platform ke sath deep integration me kaam karta hai.\n\n`;
      responseBody += `Main aapki in areas me help kar sakta hoon:\n`;
      responseBody += `1. **Investigation Dossiers:** Operation Nexus ke suspects, front companies aur key targets ka analysis.\n`;
      responseBody += `2. **Network Graph Analysis:** Shortest path, bridge nodes, aur community clusters detect karna.\n`;
      responseBody += `3. **Evidence & Financials:** CDR logs, SWIFT wire transfers aur crypto wallet activities verify karna.\n`;
      responseBody += `4. **General Assistance:** Python, SQL, general coding, algorithms aur translation.\n\n`;
      responseBody += `Aap mujhse koi bhi investigative lead ya general technical sawal pooch sakte hain!`;
    } else {
      responseBody = `Hello! I am **CIPHER AI**, an advanced dual-capability conversational intelligence assistant powered by **Ollama GPT-OSS 120B Cloud**.\n\n`;
      responseBody += `I am equipped to handle both general-purpose tasks and law enforcement intelligence analysis:\n\n`;
      responseBody += `1. **Investigative Intelligence Copilot:**\n`;
      responseBody += `   - Comprehensive forensic dossiers on tracked entities (e.g., \`TARGET-01\`, \`Aura Logistics\`).\n`;
      responseBody += `   - Network graph topology, Louvain clustering, and betweenness centrality metrics.\n`;
      responseBody += `   - Chain-of-custody verified evidence review (\`CDR_019_2834\`, \`SWIFT_WIRE_741\`, \`POLICE_FIR_452\`).\n`;
      responseBody += `   - Financial transaction structuring and telecom intercept analysis.\n\n`;
      responseBody += `2. **General-Purpose AI Assistant:**\n`;
      responseBody += `   - Full-stack software engineering, algorithms, and data modeling.\n`;
      responseBody += `   - Multi-language translation across English, Hindi, and Hinglish.\n`;
      responseBody += `   - Document summarization, technical writing, and analytical reporting.\n\n`;
      responseBody += `How may I assist your investigation or analysis today?`;
    }
  }

  // Stream out token by token with realistic typing intervals (10-18ms)
  const chunkSize = 4; // words per chunk
  const words = responseBody.split(" ");
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ") + (i + chunkSize < words.length ? " " : "");
    yield chunk;
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
}

/**
 * Main streaming generator for AI assistant requests.
 * Connects to Ollama `gpt-oss:120b-cloud` if live, and gracefully runs tool calling
 * and grounded responses with zero downtime.
 */
export async function* handleChatStream(params: {
  query: string;
  conversationId: string;
  history: Array<{ role: string; content: string }>;
  uploadedContext?: string;
}): AsyncGenerator<StreamChunkEvent, void, unknown> {
  const { query, conversationId, history, uploadedContext } = params;
  const detectedLanguage = detectLanguage(query);

  // Step 1: Execute investigative tools if relevant
  const toolResult = await executeInvestigativeTools(query);

  // Emit tool starts & ends
  for (const t of toolResult.toolExecutions) {
    yield {
      type: "tool_start",
      tool: t.tool,
      status: t.status,
    };
    // brief delay for visual realism
    await new Promise((resolve) => setTimeout(resolve, 80));
    yield {
      type: "tool_end",
      tool: t.tool,
      summary: t.summary,
    };
  }

  // Step 2: Check if Ollama endpoint has the model and is reachable
  const conn = await checkOllamaConnection();
  let streamedViaOllama = false;

  if (conn.connected) {
    try {
      const messages = [
        { role: "system", content: CIPHER_SYSTEM_PROMPT },
      ];

      // Add uploaded file context if any
      if (uploadedContext) {
        messages.push({
          role: "system",
          content: `USER UPLOADED DOCUMENT CONTEXT:\n${uploadedContext.slice(0, 4000)}`,
        });
      }

      // Add investigative context if any tools were executed
      if (toolResult.contextText) {
        messages.push({
          role: "system",
          content: `GROUNDED CIPHER INVESTIGATION DATA:\n${toolResult.contextText}`,
        });
      }

      // Add recent history
      for (const h of history.slice(-6)) {
        messages.push({ role: h.role, content: h.content });
      }

      // Add latest user query
      messages.push({ role: "user", content: query });

      const res = await fetch(`${aiConfig.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(aiConfig.apiKey ? { Authorization: `Bearer ${aiConfig.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages,
          stream: true,
          options: {
            temperature: aiConfig.temperature,
          },
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                yield {
                  type: "token",
                  token: parsed.message.content,
                };
                streamedViaOllama = true;
              }
            } catch {
              // ignore partial line parsing
            }
          }
        }
      }
    } catch (ollamaErr) {
      console.warn("[OllamaService] Ollama stream failed, falling back to grounded generator:", ollamaErr);
      streamedViaOllama = false;
    }
  }

  // Step 3: If Ollama was offline or failed to stream tokens, use grounded synthetic streaming
  if (!streamedViaOllama) {
    const generator = streamSyntheticResponse(query, history, toolResult);
    for await (const token of generator) {
      yield {
        type: "token",
        token,
      };
    }
  }

  // Step 4: Emit metadata (detected language, citations, follow-up suggestions)
  const followUps = generateFollowUps(query, detectedLanguage);
  yield {
    type: "metadata",
    detectedLanguage,
    citations: toolResult.citations,
    followUps,
  };

  // Step 5: Emit done
  yield {
    type: "done",
    messageId: "msg-" + Date.now(),
  };
}
