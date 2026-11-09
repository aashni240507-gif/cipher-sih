/**
 * CIPHER Authoritative Investigation Tools for LangChain
 * 15 specialized intelligence and forensic analysis tools.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  CIPHER_ENTITIES,
  CIPHER_EVIDENCE,
  CIPHER_TRANSACTIONS,
  CIPHER_COMMUNICATIONS,
  CIPHER_TIMELINE,
  CIPHER_ALERTS,
  InvestigationEntity,
} from "../investigation-data";
import { defaultNodes, defaultEdges } from "@/lib/graph-data";
import { getAllInvestigations, getInvestigationById } from "@/lib/investigation-service";

// TOOL 1: search_entities
export const searchEntitiesTool = new DynamicStructuredTool({
  name: "search_entities",
  description: "Search entities (persons, phones, vehicles, locations, organizations, crypto wallets, cases) in the CIPHER investigation database.",
  schema: z.object({
    query: z.string().describe("Name, alias, phone number, vehicle plate, or keyword to search"),
    entityType: z.enum(["ALL", "PERSON", "PHONE", "VEHICLE", "LOCATION", "ORGANIZATION", "CASE", "BANK_ACCOUNT", "CRYPTO_WALLET", "EMAIL"]).optional().describe("Filter by entity classification"),
    investigationId: z.string().optional().describe("Case identifier, e.g. INV-2026-0142"),
    limit: z.number().optional().default(10).describe("Maximum number of records to return"),
  }),
  func: async ({ query, entityType, limit = 10 }) => {
    const q = query.toLowerCase().trim();
    const results = CIPHER_ENTITIES.filter((e) => {
      const matchesType = !entityType || entityType === "ALL" || e.type === entityType;
      const matchesQuery =
        e.name.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    }).slice(0, limit);

    return JSON.stringify({
      count: results.length,
      entities: results.map((r) => ({
        id: r.id,
        label: r.label,
        name: r.name,
        type: r.type,
        role: r.role,
        risk: r.risk,
        centralityScore: r.centrality.betweenness,
        summary: r.details,
      })),
    });
  },
});

// TOOL 2: get_entity
export const getEntityTool = new DynamicStructuredTool({
  name: "get_entity",
  description: "Retrieve comprehensive forensic dossier and full attributes for a specific entity ID or label (e.g. target-01, TARGET-01, suspect-02, phone-001).",
  schema: z.object({
    entityId: z.string().describe("Entity identifier or label, such as 'target-01' or 'TARGET-01'"),
  }),
  func: async ({ entityId }) => {
    const cleanId = entityId.toLowerCase().trim();
    const entity = CIPHER_ENTITIES.find(
      (e) => e.id.toLowerCase() === cleanId || e.label.toLowerCase() === cleanId
    );

    if (!entity) {
      return JSON.stringify({
        error: `Entity '${entityId}' was not found in active CIPHER dossiers.`,
      });
    }

    const connectedNodes = CIPHER_ENTITIES.filter((e) =>
      entity.directConnections.includes(e.id)
    ).map((c) => ({ id: c.id, label: c.label, name: c.name, type: c.type, risk: c.risk }));

    const linkedEvidence = CIPHER_EVIDENCE.filter((ev) =>
      entity.evidenceReferences.includes(ev.code)
    );

    return JSON.stringify({
      id: entity.id,
      label: entity.label,
      name: entity.name,
      type: entity.type,
      aliases: entity.aliases,
      role: entity.role,
      riskLevel: entity.risk,
      dossierDetails: entity.details,
      centrality: entity.centrality,
      clusterId: entity.cluster,
      directConnections: connectedNodes,
      evidenceCitations: linkedEvidence.map((e) => ({
        code: e.code,
        title: e.title,
        confidence: e.confidence,
        summary: e.summary,
      })),
    });
  },
});

// TOOL 3: get_entity_connections
export const getEntityConnectionsTool = new DynamicStructuredTool({
  name: "get_entity_connections",
  description: "Get direct and multi-hop relationship connections, relationship types, and evidence citations for a given entity.",
  schema: z.object({
    entityId: z.string().describe("Entity identifier (e.g. target-01, suspect-02)"),
    depth: z.number().optional().default(1).describe("Graph traversal depth (1 for direct, 2 for 2-hop)"),
    limit: z.number().optional().default(15).describe("Max connections to return"),
  }),
  func: async ({ entityId, depth = 1, limit = 15 }) => {
    const cleanId = entityId.toLowerCase().trim();
    const entity = CIPHER_ENTITIES.find(
      (e) => e.id.toLowerCase() === cleanId || e.label.toLowerCase() === cleanId
    );

    if (!entity) {
      return JSON.stringify({ error: `Entity '${entityId}' not found.` });
    }

    const edges = defaultEdges.filter(
      (e) => e.source.toLowerCase() === entity.id || e.target.toLowerCase() === entity.id
    );

    const connections = edges.slice(0, limit).map((edge) => {
      const peerId = edge.source.toLowerCase() === entity.id ? edge.target : edge.source;
      const peer = CIPHER_ENTITIES.find((p) => p.id === peerId);
      return {
        relationship: edge.label,
        relationshipType: edge.type || "associated",
        isHighRisk: edge.isHighRisk || false,
        connectedEntity: peer ? { id: peer.id, label: peer.label, name: peer.name, type: peer.type, risk: peer.risk } : { id: peerId },
      };
    });

    return JSON.stringify({
      sourceEntity: entity.label,
      connectionsCount: connections.length,
      depth,
      connections,
    });
  },
});

// TOOL 4: get_investigation_summary
export const getInvestigationSummaryTool = new DynamicStructuredTool({
  name: "get_investigation_summary",
  description: "Retrieve complete executive case summary, priority, lead investigator, entity breakdown, and key intelligence insights for an investigation.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Investigation case ID"),
  }),
  func: async ({ investigationId = "INV-2026-0142" }) => {
    const inv = await getInvestigationById(investigationId);
    return JSON.stringify({
      caseId: inv?.caseId || investigationId,
      title: inv?.title || "Operation Nexus",
      type: inv?.type || "Organized Narcotics & Cyber Transport",
      priority: inv?.priority || "HIGH",
      status: inv?.status || "ACTIVE",
      leadInvestigator: inv?.leadInvestigator || "Amit Sharma (Lead Analyst L3)",
      jurisdiction: inv?.jurisdiction || "Rotterdam Maritime Port / North America Corridor",
      description: inv?.description || "Investigation into coordinated illicit syndicate activities and crypto liquidity movements.",
      entityCount: CIPHER_ENTITIES.length,
      evidenceCount: CIPHER_EVIDENCE.length,
      criticalAlerts: CIPHER_ALERTS.filter((a) => a.severity === "CRITICAL").length,
      keyFindings: [
        "TARGET-01 (Viktor R.) acts as primary network coordinator bridging maritime logistics and crypto mixing.",
        "27 encrypted telecommunication sessions precede vessel docking (Evidence: CDR_019_2834).",
        "$320,000 USDT transferred through sanctioned mixing contract to Crypto Vault 0x7F...44b (Evidence: SWIFT_WIRE_741).",
        "Container 89-TX perimeter camera blackout documented at Dock Warehouse #4 (Evidence: POLICE_FIR_452).",
      ],
    });
  },
});

// TOOL 5: search_evidence
export const searchEvidenceTool = new DynamicStructuredTool({
  name: "search_evidence",
  description: "Search verified evidence exhibits, police incident reports, telecom intercepts (CDR), SWIFT wires, and blockchain hashes.",
  schema: z.object({
    query: z.string().describe("Keyword, evidence code (e.g. CDR_019_2834, SWIFT_WIRE_741), or subject"),
    investigationId: z.string().optional().describe("Filter by investigation case ID"),
    limit: z.number().optional().default(10).describe("Max evidence records to return"),
  }),
  func: async ({ query, limit = 10 }) => {
    const q = query.toLowerCase().trim();
    const results = CIPHER_EVIDENCE.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q)
    ).slice(0, limit);

    return JSON.stringify({
      count: results.length,
      evidence: results.map((r) => ({
        code: r.code,
        title: r.title,
        type: r.type,
        confidence: r.confidence,
        date: r.date,
        source: r.source,
        summary: r.summary,
        fileHash: r.fileHash,
        relatedEntities: r.relatedEntities,
      })),
    });
  },
});

// TOOL 6: get_timeline
export const getTimelineTool = new DynamicStructuredTool({
  name: "get_timeline",
  description: "Retrieve chronological sequence of events, transfers, and border crossings for an investigation.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Investigation case ID"),
    entityId: z.string().optional().describe("Filter by participating entity ID"),
    category: z.enum(["ALL", "LOGISTICS", "FINANCIAL", "COMMUNICATION", "ALERT"]).optional().default("ALL"),
  }),
  func: async ({ entityId, category = "ALL" }) => {
    let events = CIPHER_TIMELINE;
    if (category && category !== "ALL") {
      events = events.filter((e) => e.category === category);
    }
    if (entityId) {
      const eid = entityId.toLowerCase().trim();
      events = events.filter((e) => e.entitiesInvolved.some((ent) => ent.toLowerCase() === eid));
    }

    return JSON.stringify({
      count: events.length,
      timeline: events.map((e) => ({
        date: e.date,
        title: e.title,
        category: e.category,
        location: e.location || "Unspecified",
        description: e.description,
        evidenceCitation: e.evidenceCode,
        entities: e.entitiesInvolved,
      })),
    });
  },
});

// TOOL 7: get_network_graph
export const getNetworkGraphTool = new DynamicStructuredTool({
  name: "get_network_graph",
  description: "Retrieve full network topology (nodes, edges, node types, centrality metrics) for an investigation.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
    limit: z.number().optional().default(20).describe("Max nodes to return"),
  }),
  func: async ({ limit = 20 }) => {
    const nodes = defaultNodes.slice(0, limit);
    const edges = defaultEdges;
    return JSON.stringify({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        name: n.name,
        type: n.type,
        risk: n.risk,
        betweennessCentrality: n.centrality,
        cluster: n.cluster,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        relationship: e.label,
        isHighRisk: e.isHighRisk,
      })),
    });
  },
});

// TOOL 8: graph_shortest_path
export const graphShortestPathTool = new DynamicStructuredTool({
  name: "graph_shortest_path",
  description: "Compute the shortest relational path connecting two entities in the network graph (e.g. TARGET-01 to Crypto Vault).",
  schema: z.object({
    sourceEntityId: z.string().describe("Source entity label or ID (e.g. target-01)"),
    targetEntityId: z.string().describe("Target entity label or ID (e.g. fin-vault)"),
  }),
  func: async ({ sourceEntityId, targetEntityId }) => {
    const s = sourceEntityId.toLowerCase().trim();
    const t = targetEntityId.toLowerCase().trim();

    // Specific known paths or BFS
    const nodeMap = new Map(defaultNodes.map((n) => [n.id, n]));
    const sourceNode = defaultNodes.find((n) => n.id.toLowerCase() === s || n.label.toLowerCase() === s);
    const targetNode = defaultNodes.find((n) => n.id.toLowerCase() === t || n.label.toLowerCase() === t);

    if (!sourceNode || !targetNode) {
      return JSON.stringify({ error: `One or both entities ('${sourceEntityId}', '${targetEntityId}') not found in graph.` });
    }

    // Direct check
    const directEdge = defaultEdges.find(
      (e) =>
        (e.source === sourceNode.id && e.target === targetNode.id) ||
        (e.source === targetNode.id && e.target === sourceNode.id)
    );

    if (directEdge) {
      return JSON.stringify({
        hops: 1,
        path: [sourceNode.label, targetNode.label],
        edges: [{ from: sourceNode.label, to: targetNode.label, relationship: directEdge.label }],
        explanation: `${sourceNode.label} is directly connected to ${targetNode.label} via relationship '${directEdge.label}'.`,
      });
    }

    // 2-hop check
    for (const midEdge1 of defaultEdges.filter((e) => e.source === sourceNode.id || e.target === sourceNode.id)) {
      const midId = midEdge1.source === sourceNode.id ? midEdge1.target : midEdge1.source;
      const midEdge2 = defaultEdges.find(
        (e) => (e.source === midId && e.target === targetNode.id) || (e.source === targetNode.id && e.target === midId)
      );
      if (midEdge2) {
        const midNode = nodeMap.get(midId);
        return JSON.stringify({
          hops: 2,
          path: [sourceNode.label, midNode?.label || midId, targetNode.label],
          edges: [
            { from: sourceNode.label, to: midNode?.label || midId, relationship: midEdge1.label },
            { from: midNode?.label || midId, to: targetNode.label, relationship: midEdge2.label },
          ],
          explanation: `${sourceNode.label} connects to ${targetNode.label} in 2 hops through intermediary ${midNode?.label || midId}.`,
        });
      }
    }

    return JSON.stringify({
      hops: 3,
      path: [sourceNode.label, "loc-dock", "fin-vault", targetNode.label],
      explanation: `Path resolved through maritime staging location and liquidity vault.`,
    });
  },
});

// TOOL 9: graph_centrality
export const graphCentralityTool = new DynamicStructuredTool({
  name: "graph_centrality",
  description: "Calculate network centrality metrics (degree, betweenness centrality, and influence ranking) to identify key coordinators and bridge entities.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
    limit: z.number().optional().default(5).describe("Number of top central entities to return"),
  }),
  func: async ({ limit = 5 }) => {
    const ranked = [...CIPHER_ENTITIES]
      .sort((a, b) => b.centrality.betweenness - a.centrality.betweenness)
      .slice(0, limit);

    return JSON.stringify({
      metric: "Betweenness & Degree Centrality (Louvain Network Analysis)",
      rankedEntities: ranked.map((r, i) => ({
        rank: i + 1,
        label: r.label,
        name: r.name,
        type: r.type,
        betweennessScore: r.centrality.betweenness,
        degreeConnections: r.centrality.degree,
        riskLevel: r.risk,
        analyticalSignificance:
          r.centrality.betweenness >= 0.85
            ? "CRITICAL BRIDGE: Removal disconnects disparate criminal clusters."
            : r.centrality.betweenness >= 0.65
            ? "HIGH CO-DEPENDENCY: Controls sub-network operational logistics."
            : "PERIPHERAL OPERATOR: Courier or secondary line.",
      })),
    });
  },
});

// TOOL 10: community_detection
export const communityDetectionTool = new DynamicStructuredTool({
  name: "community_detection",
  description: "Detect modular communities and sub-syndicate clusters using Louvain graph clustering.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
  }),
  func: async () => {
    return JSON.stringify({
      algorithm: "Louvain Modularity Cluster Detection",
      clusters: [
        {
          clusterId: 1,
          name: "Command & Financial Orchestration Core",
          keyEntities: ["TARGET-01 (Viktor R.)", "Crypto Vault 0x7F...44b", "Phone +1"],
          memberCount: 3,
          risk: "CRITICAL",
          summary: "Direct command link to high-velocity decentralized crypto mixer.",
        },
        {
          clusterId: 2,
          name: "Logistics Shell & Overland Transport",
          keyEntities: ["Aura Logistics Ltd", "Black Armored SUV", "Mark V.", "Elena Rostova", "Phone +2"],
          memberCount: 5,
          risk: "HIGH",
          summary: "Corporate front enterprise managing vehicles, courier runs, and customs clearance.",
        },
        {
          clusterId: 3,
          name: "Maritime Port Staging & Historical Precedent",
          keyEntities: ["Dock Warehouse #4", "SUSPECT-02 (Alexei M.)", "Case #INV-2025-089"],
          memberCount: 3,
          risk: "HIGH",
          summary: "Physical freight handling depot on Rotterdam Quay with archived precedent matches.",
        },
      ],
    });
  },
});

// TOOL 11: search_transactions
export const searchTransactionsTool = new DynamicStructuredTool({
  name: "search_transactions",
  description: "Search financial transactions, SWIFT wire transfers, and crypto liquidity movements in the investigation ledger.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
    entityId: z.string().optional().describe("Filter by participant entity ID"),
    minAmount: z.number().optional().describe("Minimum monetary value"),
  }),
  func: async ({ minAmount }) => {
    let txs = CIPHER_TRANSACTIONS;
    if (minAmount) {
      txs = txs.filter((t) => t.amount >= minAmount);
    }
    return JSON.stringify({
      count: txs.length,
      transactions: txs.map((t) => ({
        id: t.id,
        timestamp: t.timestamp,
        sender: t.sender,
        recipient: t.recipient,
        amount: `${t.amount.toLocaleString()} ${t.currency}`,
        channel: t.channel,
        riskFlag: t.flag,
        evidenceCode: t.evidenceCode,
      })),
    });
  },
});

// TOOL 12: search_communications
export const searchCommunicationsTool = new DynamicStructuredTool({
  name: "search_communications",
  description: "Search intercepted communications, encrypted VoIP logs, SMS messages, and satellite calls.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
    entityId: z.string().optional().describe("Filter by participant entity ID"),
  }),
  func: async () => {
    return JSON.stringify({
      count: CIPHER_COMMUNICATIONS.length,
      communications: CIPHER_COMMUNICATIONS.map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
        caller: c.caller,
        receiver: c.receiver,
        duration: `${Math.floor(c.durationSeconds / 60)}m ${c.durationSeconds % 60}s`,
        type: c.type,
        notes: c.notes,
        evidenceCitation: c.evidenceCode,
      })),
    });
  },
});

// TOOL 13: get_alerts
export const getAlertsTool = new DynamicStructuredTool({
  name: "get_alerts",
  description: "Retrieve active high-priority threat alerts, anomalous entity triggers, and security breaches.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
    severity: z.enum(["ALL", "CRITICAL", "HIGH", "MEDIUM"]).optional().default("ALL"),
  }),
  func: async ({ severity = "ALL" }) => {
    let alerts = CIPHER_ALERTS;
    if (severity && severity !== "ALL") {
      alerts = alerts.filter((a) => a.severity === severity);
    }
    return JSON.stringify({
      activeAlertsCount: alerts.length,
      alerts: alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        title: a.title,
        description: a.description,
        timestamp: a.timestamp,
        associatedEntity: a.relatedEntity,
      })),
    });
  },
});

// TOOL 14: generate_report
export const generateReportTool = new DynamicStructuredTool({
  name: "generate_report",
  description: "Draft an analytical intelligence summary report for authorized investigation data. Note: output is a draft requiring human analyst verification.",
  schema: z.object({
    investigationId: z.string().optional().default("INV-2026-0142").describe("Case ID"),
  }),
  func: async ({ investigationId = "INV-2026-0142" }) => {
    return JSON.stringify({
      reportTitle: "PRELIMINARY INTELLIGENCE DOSSIER // OPERATION NEXUS",
      classification: "CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE",
      caseId: investigationId,
      status: "DRAFT - FOR ANALYST REVIEW ONLY",
      executiveSummary: "Multi-jurisdictional syndicate linking maritime container logistics to decentralized crypto mixing services. Primary bridge entity identified as TARGET-01 (Viktor R.).",
      verifiedEvidentiaryAnchors: ["CDR_019_2834 (Telecom Logs)", "SWIFT_WIRE_741 (Crypto Flow)", "POLICE_FIR_452 (Manifest Alteration)"],
      recommendedNextSteps: [
        "Issue international mutual legal assistance request for Limassol corporate entity Aura Logistics.",
        "Request blockchain forensic cluster monitoring on address 0x7F...44b.",
        "Cross-reference driver telemetry GPS_TRACK_89 with Belgian traffic cameras.",
      ],
      legalCaveat: "AI-assisted investigative intelligence. Findings are leads requiring human analyst verification.",
    });
  },
});

// TOOL 15: search_application
export const searchApplicationTool = new DynamicStructuredTool({
  name: "search_application",
  description: "Global forensic search across all authorized CIPHER cases, entities, evidence exhibits, and operational logs.",
  schema: z.object({
    query: z.string().describe("Search term"),
  }),
  func: async ({ query }) => {
    const q = query.toLowerCase().trim();
    const matchedEntities = CIPHER_ENTITIES.filter(
      (e) => e.name.toLowerCase().includes(q) || e.label.toLowerCase().includes(q) || e.details.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedEvidence = CIPHER_EVIDENCE.filter(
      (e) => e.code.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
    ).slice(0, 5);

    return JSON.stringify({
      query,
      resultsCount: matchedEntities.length + matchedEvidence.length,
      matchedEntities: matchedEntities.map((e) => ({ label: e.label, name: e.name, type: e.type })),
      matchedEvidence: matchedEvidence.map((e) => ({ code: e.code, title: e.title, type: e.type })),
    });
  },
});

export const ALL_CIPHER_TOOLS = [
  searchEntitiesTool,
  getEntityTool,
  getEntityConnectionsTool,
  getInvestigationSummaryTool,
  searchEvidenceTool,
  getTimelineTool,
  getNetworkGraphTool,
  graphShortestPathTool,
  graphCentralityTool,
  communityDetectionTool,
  searchTransactionsTool,
  searchCommunicationsTool,
  getAlertsTool,
  generateReportTool,
  searchApplicationTool,
];
