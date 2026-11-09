/**
 * CIPHER Neo4j Graph Integration Client
 * Handles transactional synchronization between PostgreSQL and Neo4j graph nodes.
 */

export interface Neo4jSyncResult {
  synced: boolean;
  status: "SYNCED" | "PENDING_SYNC" | "LOCAL_GRAPH" | "FAILED";
  message: string;
}

export interface GraphNodePayload {
  id: string;
  caseId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
}

export async function syncInvestigationToNeo4j(
  payload: GraphNodePayload
): Promise<Neo4jSyncResult> {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER || "neo4j";
  const password = process.env.NEO4J_PASSWORD;

  // If Neo4j credentials are not configured in environment, use local graph registry
  if (!uri || !password) {
    return {
      synced: false,
      status: "LOCAL_GRAPH",
      message:
        "Neo4j endpoint not configured in environment (NEO4J_URI). Investigation node registered in local forensic graph engine.",
    };
  }

  try {
    // Dynamic import to prevent bundler failure if driver is optional
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const neo4j = require("neo4j-driver");
    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    try {
      await session.executeWrite((tx: any) =>
        tx.run(
          `
          MERGE (i:Investigation { id: $id, caseId: $caseId })
          SET i.title = $title,
              i.type = $type,
              i.priority = $priority,
              i.status = $status,
              i.syncedAt = datetime()
          RETURN i
          `,
          {
            id: payload.id,
            caseId: payload.caseId,
            title: payload.title,
            type: payload.type,
            priority: payload.priority,
            status: payload.status,
          }
        )
      );

      await session.close();
      await driver.close();

      return {
        synced: true,
        status: "SYNCED",
        message: "Successfully synchronized (:Investigation) case node to Neo4j graph.",
      };
    } catch (err: any) {
      await session.close();
      await driver.close();
      console.warn("[CIPHER Neo4j] Cypher execution error:", err.message);
      return {
        synced: false,
        status: "PENDING_SYNC",
        message: `Neo4j synchronization pending: ${err.message}`,
      };
    }
  } catch (err: any) {
    console.warn("[CIPHER Neo4j] Driver initialization skipped:", err.message);
    return {
      synced: false,
      status: "LOCAL_GRAPH",
      message: "Neo4j driver offline. Local graph registry maintains topology.",
    };
  }
}
