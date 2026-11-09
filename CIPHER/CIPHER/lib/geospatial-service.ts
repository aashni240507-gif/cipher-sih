export interface MapWaypoint {
  id: string;
  name: string;
  type: "priority" | "intelligence" | "transit";
  x: number;
  y: number;
  latLong: string;
  details: string;
  entities: string[];
  associatedNodeId?: string;
}

export interface CaseGeospatialData {
  caseId: string;
  title: string;
  jurisdiction: string;
  centerCoordinates: string;
  waypoints: MapWaypoint[];
}

const CASE_GEOSPATIAL_MAP: Record<string, CaseGeospatialData> = {
  // Case 1: Operation Nexus
  "inv-001": {
    caseId: "INV-2026-0142",
    title: "Operation Nexus",
    jurisdiction: "Rotterdam Maritime Port / North Sea Corridor",
    centerCoordinates: "51.9244° N, 4.4777° E",
    waypoints: [
      {
        id: "WP-01",
        name: "Dock Warehouse #4",
        type: "priority",
        x: 420,
        y: 280,
        latLong: "51.9244° N, 4.4777° E",
        details: "Primary contraband container staging facility. Multiple security camera blackouts logged.",
        entities: ["Viktor R.", "Black SUV (TX-89)"],
        associatedNodeId: "loc-dock",
      },
      {
        id: "WP-02",
        name: "Quayside Cargo Terminal 14",
        type: "priority",
        x: 350,
        y: 220,
        latLong: "51.9120° N, 4.4600° E",
        details: "MV Nordica vessel offloading dock. Manifest altered 4 hours prior to container arrival.",
        entities: ["Alexei M.", "Harbor Stevedores"],
        associatedNodeId: "suspect-02",
      },
      {
        id: "WP-03",
        name: "Cell Tower Sector 4B",
        type: "intelligence",
        x: 480,
        y: 190,
        latLong: "51.9380° N, 4.5100° E",
        details: "High density of burner telecommunications matching +1 (555) 019-2834.",
        entities: ["Burner Telemetry (+1 555-019-2834)"],
        associatedNodeId: "phone-001",
      },
      {
        id: "WP-04",
        name: "Limassol Maritime Port Hub",
        type: "intelligence",
        x: 680,
        y: 380,
        latLong: "34.6786° N, 33.0413° E",
        details: "Port of departure for container series #AURA-99 registered to Limassol shell entity.",
        entities: ["Elena Rostova", "Aura Logistics Ltd"],
        associatedNodeId: "org-aura",
      },
      {
        id: "WP-05",
        name: "Highway 10 Toll Interchange",
        type: "transit",
        x: 240,
        y: 340,
        latLong: "51.8800° N, 4.3900° E",
        details: "ANPR optical camera recorded Volvo heavy cargo truck traveling southbound towards secondary depot.",
        entities: ["Courier Mark V."],
        associatedNodeId: "person-mark",
      },
    ],
  },

  // Case 2: Operation DarkHydra
  "inv-002": {
    caseId: "CYB-2026-0481",
    title: "Operation DarkHydra",
    jurisdiction: "Frankfurt / Sofia / Transatlantic Cloud Exfiltration",
    centerCoordinates: "50.1109° N, 8.6821° E",
    waypoints: [
      {
        id: "WP-01",
        name: "C2 Server Data Center Frankfurt",
        type: "priority",
        x: 440,
        y: 250,
        latLong: "50.1109° N, 8.6821° E",
        details: "Primary command and control infrastructure hosting the ShadowGate Exploit Kit listener.",
        entities: ["Threat Actor PHANTOM-X", "ShadowGate Exploit Kit"],
        associatedNodeId: "cyb-c2-frankfurt",
      },
      {
        id: "WP-02",
        name: "Bulletproof Host Facility Sofia",
        type: "priority",
        x: 620,
        y: 360,
        latLong: "42.6977° N, 23.3219° E",
        details: "Colocation datacenter housing mirror payload servers and unindexed Tor hidden service directories.",
        entities: ["DarkHydra Admin", "Decryptor Key Host"],
        associatedNodeId: "cyb-darkhydra",
      },
      {
        id: "WP-03",
        name: "Exfiltration Relay Amsterdam",
        type: "intelligence",
        x: 320,
        y: 180,
        latLong: "52.3676° N, 4.9041° E",
        details: "High-bandwidth proxy relay observed pulling 4.2TB encrypted enterprise backups.",
        entities: ["Exfiltration Proxy Relay"],
        associatedNodeId: "cyb-exfil-proxy",
      },
      {
        id: "WP-04",
        name: "Monero OTC Desk Dubai",
        type: "transit",
        x: 740,
        y: 420,
        latLong: "25.2048° N, 55.2708° E",
        details: "Physical escrow intermediary handling fiat off-ramps from ransom payment addresses.",
        entities: ["Monero Mixer Pool", "OTC Broker 44"],
        associatedNodeId: "cyb-mixer",
      },
    ],
  },

  // Case 3: Operation Golden Hawala
  "inv-003": {
    caseId: "FIN-2026-0819",
    title: "Operation Golden Hawala",
    jurisdiction: "Deira Gold Souk / Karachi / Swiss Banking Corridor",
    centerCoordinates: "25.2711° N, 55.3075° E",
    waypoints: [
      {
        id: "WP-01",
        name: "Gulf Horizon Gold Trading Deira",
        type: "priority",
        x: 480,
        y: 310,
        latLong: "25.2711° N, 55.3075° E",
        details: "Trading front suspected of over-invoicing raw gold bullion shipments to conceal capital flight.",
        entities: ["Tariq Al-Mansoor", "Gulf Horizon Gold Trading"],
        associatedNodeId: "fin-target-tariq",
      },
      {
        id: "WP-02",
        name: "Hawala Exchange Saddar Karachi",
        type: "priority",
        x: 660,
        y: 340,
        latLong: "24.8569° N, 67.0145° E",
        details: "Informal bookmaking desk operating unregistered ledger clearing for transnational remittance syndicates.",
        entities: ["Hawala Broker Karachi", "Courier Asif"],
        associatedNodeId: "fin-hawala-karachi",
      },
      {
        id: "WP-03",
        name: "Swiss Private Vault Zurich",
        type: "intelligence",
        x: 280,
        y: 190,
        latLong: "47.3769° N, 8.5417° E",
        details: "Depository holding numbered security deposit boxes referenced in encrypted ledger seized during audit.",
        entities: ["Swiss Account CH-99", "Trust Escrow"],
        associatedNodeId: "fin-swiss-bank",
      },
      {
        id: "WP-04",
        name: "Jebel Ali Customs Free Zone",
        type: "transit",
        x: 410,
        y: 400,
        latLong: "24.9857° N, 55.0273° E",
        details: "Consignment staging dock used for duty-exempt physical gold re-packaging.",
        entities: ["Al-Mansoor Logistics", "Customs Broker 12"],
        associatedNodeId: "fin-target-tariq",
      },
    ],
  },

  // Case 4: Operation Blue Horizon
  "inv-004": {
    caseId: "TRF-2026-0231",
    title: "Operation Blue Horizon",
    jurisdiction: "Aegean Sea / Piraeus / Mediterranean Transit Hubs",
    centerCoordinates: "37.9429° N, 23.6469° E",
    waypoints: [
      {
        id: "WP-01",
        name: "Safehouse Harbor Compound Piraeus",
        type: "priority",
        x: 490,
        y: 320,
        latLong: "37.9429° N, 23.6469° E",
        details: "Concealed quayside storage warehouse used for holding undocumented persons prior to transit loading.",
        entities: ["Capt. Marco Silva", "Safehouse Piraeus"],
        associatedNodeId: "trf-target-silva",
      },
      {
        id: "WP-02",
        name: "Coastal Waypoint Izmir Bay",
        type: "intelligence",
        x: 620,
        y: 280,
        latLong: "38.4237° N, 27.1428° E",
        details: "Staging launch cove for unflagged night-time rigid inflatable boat transfers.",
        entities: ["PanGlobal Maritime Feeder", "Transit Crew 3"],
        associatedNodeId: "trf-vessel-aeolos",
      },
      {
        id: "WP-03",
        name: "Victoria Square Safe Flat Athens",
        type: "transit",
        x: 430,
        y: 210,
        latLong: "37.9926° N, 23.7297° E",
        details: "Urban coordination apartment where false travel documents and visas are forged and distributed.",
        entities: ["Document Forger L-7", "Passport Workshop"],
        associatedNodeId: "trf-target-silva",
      },
    ],
  },

  // Case 5: Operation Iron Fortress
  "inv-005": {
    caseId: "INV-2025-089",
    title: "Operation Iron Fortress",
    jurisdiction: "Black Sea Basin / Odesa Port / Danube River Corridors",
    centerCoordinates: "46.4825° N, 30.7233° E",
    waypoints: [
      {
        id: "WP-01",
        name: "Warehouse 19 Odesa Seaport",
        type: "priority",
        x: 520,
        y: 240,
        latLong: "46.4825° N, 30.7233° E",
        details: "Underground munitions bunker containing false manifest crates labeled as agricultural irrigation pipes.",
        entities: ["Dmitri Volkov", "RedStar Armaments"],
        associatedNodeId: "arm-target-volkov",
      },
      {
        id: "WP-02",
        name: "Freight Rail Siding Constanta",
        type: "priority",
        x: 390,
        y: 330,
        latLong: "44.1792° N, 28.6498° E",
        details: "Covert rail freight transshipment facility connecting standard and broad-gauge track corridors.",
        entities: ["Volkov Forwarding", "Rail Conductor 8"],
        associatedNodeId: "arm-depot-constanta",
      },
      {
        id: "WP-03",
        name: "Air Runway Chisinau Outer",
        type: "intelligence",
        x: 310,
        y: 160,
        latLong: "46.9277° N, 28.9309° E",
        details: "Decommissioned military strip utilized for unlogged nighttime cargo turboprop landings.",
        entities: ["Heavy Cargo IL-76", "Ground Handling Team"],
        associatedNodeId: "arm-target-volkov",
      },
    ],
  },
};

export function resolveGeospatialKey(idOrCaseId: string): string {
  if (!idOrCaseId) return "inv-001";
  const normalized = idOrCaseId.trim().toLowerCase();
  if (CASE_GEOSPATIAL_MAP[normalized]) return normalized;

  for (const [key, data] of Object.entries(CASE_GEOSPATIAL_MAP)) {
    if (
      data.caseId.toLowerCase() === normalized ||
      data.title.toLowerCase() === normalized ||
      key === normalized
    ) {
      return key;
    }
  }

  // Case ID matching prefix
  if (normalized.includes("nexus") || normalized.includes("0142")) return "inv-001";
  if (normalized.includes("hydra") || normalized.includes("0481")) return "inv-002";
  if (normalized.includes("hawala") || normalized.includes("0819")) return "inv-003";
  if (normalized.includes("horizon") || normalized.includes("0231")) return "inv-004";
  if (normalized.includes("fortress") || normalized.includes("089")) return "inv-005";

  return "inv-001";
}

export function getInvestigationGeospatialData(idOrCaseId: string): CaseGeospatialData {
  const key = resolveGeospatialKey(idOrCaseId);
  return CASE_GEOSPATIAL_MAP[key] || CASE_GEOSPATIAL_MAP["inv-001"];
}
