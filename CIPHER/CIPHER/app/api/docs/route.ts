import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "CIPHER Criminal Network Analysis System API",
      version: "2.4.0",
      description:
        "Official intelligence and forensic analysis RESTful API for CIPHER multi-agency criminal network investigation platform.",
      contact: {
        name: "CIPHER Law Enforcement Core Services",
        email: "intel-ops@cipher.internal",
      },
    },
    servers: [
      {
        url: "/api",
        description: "Local Operational Gateway",
      },
    ],
    paths: {
      "/investigations": {
        get: {
          summary: "List all active investigations",
          description: "Retrieves complete repository of active, monitored, and archived investigation dossiers.",
          responses: {
            "200": {
              description: "List of investigation dossiers",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      count: { type: "integer" },
                      investigations: { type: "array", items: { $ref: "#/components/schemas/Investigation" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new criminal investigation dossier",
          description:
            "Registers a new case in PostgreSQL via Prisma, creates case node in Neo4j graph, and initializes tracking.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "title",
                    "caseId",
                    "type",
                    "priority",
                    "leadInvestigator",
                    "startDate",
                    "jurisdiction",
                    "description",
                  ],
                  properties: {
                    title: { type: "string", example: "Operation Nexus" },
                    caseId: { type: "string", example: "INV-2026-0142" },
                    type: { type: "string", example: "Organized Narcotics & Cyber Transport" },
                    priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "CRITICAL"], example: "HIGH" },
                    leadInvestigator: { type: "string", example: "Amit Sharma (Lead Analyst L3)" },
                    startDate: { type: "string", format: "date", example: "2026-05-10" },
                    jurisdiction: { type: "string", example: "Rotterdam Maritime Port / North America Corridor" },
                    description: { type: "string", minLength: 20, example: "Investigation into coordinated illicit syndicate activities..." },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Investigation created successfully",
            },
            "400": { description: "Validation error" },
            "409": { description: "Case ID already exists" },
          },
        },
      },
      "/investigations/{id}": {
        get: {
          summary: "Get investigation dossier by ID or Case ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Investigation details" }, "404": { description: "Not found" } },
        },
        patch: {
          summary: "Update investigation details or priority",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Updated investigation" }, "404": { description: "Not found" } },
        },
        delete: {
          summary: "Archive and remove investigation dossier",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Archived successfully" }, "404": { description: "Not found" } },
        },
      },
      "/investigations/{id}/graph": {
        get: {
          summary: "Retrieve graph topology nodes and relationship edges",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Graph topology" } },
        },
      },
      "/investigations/{id}/timeline": {
        get: {
          summary: "Retrieve chronological forensic timeline events",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Timeline events" } },
        },
      },
      "/investigations/{id}/insights": {
        get: {
          summary: "Retrieve automated anomaly detections and forensic AI insights",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "AI insights and alerts" } },
        },
      },
      "/ai/query": {
        post: {
          summary: "Query CIPHER AI Assistant (English, Hindi, Hinglish)",
          description:
            "Provides evidence-grounded answers across English, Hindi, and Hinglish with contextual multi-turn conversation memory.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["query"],
                  properties: {
                    query: { type: "string", example: "Why is TARGET-01 important?" },
                    investigationId: { type: "string", example: "INV-2026-0142" },
                    languagePreference: { type: "string", enum: ["auto", "en", "hi"], example: "auto" },
                    history: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          role: { type: "string", enum: ["user", "assistant"] },
                          content: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Evidence-grounded response with detected language" },
          },
        },
      },
    },
    components: {
      schemas: {
        Investigation: {
          type: "object",
          properties: {
            id: { type: "string" },
            caseId: { type: "string" },
            title: { type: "string" },
            type: { type: "string" },
            priority: { type: "string" },
            status: { type: "string" },
            leadInvestigator: { type: "string" },
            startDate: { type: "string" },
            jurisdiction: { type: "string" },
            description: { type: "string" },
            entitiesCount: { type: "integer" },
            relationshipsCount: { type: "integer" },
            evidenceCount: { type: "integer" },
            alertsCount: { type: "integer" },
            graphSyncStatus: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
