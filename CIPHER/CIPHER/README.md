# CIPHER — AI-Powered Criminal Network Analysis System

> **CIPHER** is an advanced full-stack investigative intelligence and criminal network analysis platform designed for authorized law-enforcement and prosecution agencies. It ingests multi-format intelligence (FIRs, judicial orders, call detail records, financial transactions, surveillance logs, and OSINT telemetry), performs entity resolution and graph linkage, provides interactive evidence boards, tracks chain-of-custody, and delivers evidence-backed AI assistance using **GPT-OSS 120B via Ollama** under strict Responsible AI standards.

---

## Architecture Diagram

```
                                  +---------------------------------------+
                                  |         INVESTIGATOR CLIENT           |
                                  |    Next.js 15 / React 19 / Canvas     |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS / Session Cookies / SSE
                                                      v
                                  +-------------------+-------------------+
                                  |          CIPHER API CORE              |
                                  |      Next.js Route Handlers & DB      |
                                  +----+-----------------------------+----+
                                       |                             |
                 +---------------------+-----------------------+     |
                 |                                             |     |
                 v                                             v     v
+---------------------------------+           +---------------------------------+
|      POSTGRESQL & PRISMA        |           |      NEO4J GRAPH CLUSTER        |
|  - Users & RBAC Audit Logs      |           |  - Multi-Hop Graph Traversal    |
|  - Investigations & Metadata    |           |  - Shortest Path / Adjacency    |
|  - Evidence Exhibits & SHA-256  |           |  - Louvain Modularity Clusters  |
|  - Investigator Clues / Notes   |           |  - Betweenness Centrality       |
+---------------------------------+           +---------------------------------+
                 |                                             |
                 +---------------------+-----------------------+
                                       |
                                       v
                        +-------------------------------+
                        |    LANGCHAIN & OLLAMA ENGINE  |
                        |      GPT-OSS 120B Reasoning   |
                        |  - Grounded Tool Calling      |
                        |  - Multi-Lingual (EN/HI/HING) |
                        |  - Responsible AI Guardrails  |
                        +-------------------------------+
```

---

## Key Capabilities & Features

1. **Operational Command Hub**: Centered rotating wireframe network globe with 12 radial feature cards arranged symmetrically without overlap or collisions.
2. **Delhi High Court Real-World Grounded Case**: Pre-seeded dataset based on *Sahil Khan v. State Govt. of NCT of Delhi* (FIR No. 4/2025, Cyber South-West Delhi, Bail Appl. 3788/2025, IndianKanoon doc 12999253).
3. **Investigation-Specific Graph Data**: Every dossier (e.g. `CASE-2025-004`, `INV-2026-0142`) maintains distinct relational subgraphs, metrics, nodes, and edges.
4. **Investigator Evidence Board & Custom Clue Nodes**: Draggable sticky-note evidence cards, analyst hypothesis connector edges, and `+ ADD CLUE` nodes marked as `USER PROVIDED / UNVERIFIED`.
5. **Cryptographic Evidence Vault**: Client-side and server-side SHA-256 hash digests, chain-of-custody tracking, and IndianKanoon primary source integration.
6. **Geospatial Intelligence Module**: Interactive radar/coordinate vector canvas, dynamic waypoints, chronological playback, and deep linking to network graphs.
7. **Judicial Intelligence Report Generator**: Formal dossier briefs with strictly segregated sections:
   - `FACT`: Retrieved court records and forensic exhibits.
   - `ANALYTICS`: Mathematical graph centrality, PageRank, and Louvain modularity.
   - `AI INTERPRETATION`: Neural hypotheses with `REQUIRES HUMAN VERIFICATION` caveats.
   - `USER CLUE`: Unverified field observations.
8. **Responsible AI & Multi-Lingual Support**: Powered by **GPT-OSS 120B** via Ollama. Fluently supports **English**, **Hindi (हिन्दी)**, and natural **Hinglish**. Never asserts criminal guilt or predicts future criminality.

---

## Prerequisites

- **Node.js**: v18.18+ or v20+
- **npm**: v9+
- **Docker & Docker Compose** (for containerized PostgreSQL and Neo4j)
- **Ollama**: v0.5.0+ (Optional for local AI execution)

---

## Demo Credentials

The platform is pre-configured with investigative accounts:

| Email / Identifier | Password | Role | Clearance Level |
| :--- | :--- | :--- | :--- |
| `analyst.sharma@cipher.intel` | `cipher-classified-pass` | **INVESTIGATOR** | LEVEL 3 - STRICT CLASSIFIED |
| `analyst.vance@cipher.intel` | `cipher-classified-pass` | **ADMIN** | LEVEL 4 - TOP SECRET |

---

## Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd NEXUS
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 3. Seed authoritatively Grounded Case Data
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Ollama & GPT-OSS 120B Configuration

CIPHER supports two configurations for running **GPT-OSS 120B**:

### Option A: Local / Self-Hosted Gateway (Recommended for Testing)
1. Install and start Ollama:
   ```bash
   ollama signin
   ollama pull gpt-oss:120b-cloud
   ollama run gpt-oss:120b-cloud
   ```
2. In your `.env.local`:
   ```env
   OLLAMA_BASE_URL="http://localhost:11434"
   OLLAMA_MODEL="gpt-oss:120b-cloud"
   ```

### Option B: Direct Ollama Cloud API
1. Obtain your API key from [Ollama Cloud](https://ollama.com).
2. In your `.env.local` (Keep API keys strictly server-side):
   ```env
   OLLAMA_BASE_URL="https://ollama.com"
   OLLAMA_API_KEY="your_secure_ollama_cloud_api_key_here"
   OLLAMA_MODEL="gpt-oss:120b"
   ```

*Note: If no live Ollama cluster is detected, CIPHER automatically falls back to its deterministic synthetic neural engine so UI evaluation is never interrupted.*

---

## Neo4j Graph Database Setup

### Starting Neo4j via Docker
```bash
docker compose up -d neo4j
```
- **Neo4j Browser UI**: [http://localhost:7474](http://localhost:7474)
- **Bolt Protocol**: `bolt://localhost:7687`
- **Default Auth**: `neo4j / cipher_neo4j_secret_password`

Configure in `.env.local`:
```env
NEO4J_URI="bolt://localhost:7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="cipher_neo4j_secret_password"
```

---

## PostgreSQL Database Setup

### Starting PostgreSQL via Docker
```bash
docker compose up -d postgres
```
Configure in `.env.local`:
```env
DATABASE_URL="postgresql://cipher_admin:cipher_secure_pass_2026@localhost:5432/cipher_intel?schema=public"
```

---

## Docker Deployment

To launch the full CIPHER ecosystem (PostgreSQL 16 + Neo4j 5 + CIPHER App):
```bash
docker compose up --build -d
```
Inspect running services:
```bash
docker compose ps
docker compose logs -f cipher-app
```

---

## API Specification & OpenAPI 3.0 Documentation

CIPHER exposes full OpenAPI 3.0 documentation:
- **API Spec Endpoint**: `GET /api/docs`
- **Health / Status Check**: `GET /api/ai/status`

### Core Endpoints Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate investigator and issue `cipher_session` cookie |
| `POST` | `/api/auth/logout` | Invalidate cryptographic session and clear cookies |
| `GET` | `/api/auth/me` | Retrieve active authenticated session user profile |
| `GET` | `/api/investigations` | List all investigation dossiers with metrics |
| `POST` | `/api/investigations` | Launch a new investigation with duplicate Case ID validation |
| `GET` | `/api/investigations/:id/graph` | Fetch case-specific relationship network nodes and edges |
| `PATCH` | `/api/investigations/:id/positions` | Persist custom node layout coordinates |
| `POST` | `/api/investigations/:id/clues` | Add manual `USER PROVIDED / UNVERIFIED` clue node |
| `POST` | `/api/investigations/:id/clues/connect`| Connect custom clue to target graph entity |
| `GET` | `/api/investigations/:id/timeline` | Fetch chronological multi-channel timeline events |
| `GET` | `/api/evidence` | List verified evidence exhibits with SHA-256 digests |
| `POST` | `/api/evidence` | Ingest new evidence with tamper-evident cryptographic hash |
| `GET` | `/api/alerts` | List case-scoped threat alerts |
| `PATCH` | `/api/alerts/:id` | Update alert status (`ACKNOWLEDGED`, `RESOLVED`) |
| `GET` | `/api/data-sources` | List multi-format ingested data sources |
| `POST` | `/api/data-sources` | Ingest and parse intelligence dossiers |
| `GET` | `/api/reports` | Retrieve compiled judicial intelligence reports |
| `POST` | `/api/reports` | Compile judicial report with segregated Fact/Analytics/AI |
| `GET` | `/api/search?q=...` | Universal global search across cases, entities, and exhibits |
| `POST` | `/api/ai/chat/stream` | Server-Sent Events (SSE) streaming chat with tool calling |
| `POST` | `/api/demo/reset` | Reset all test environments to pristine baseline state |

---

## Automated Verification & Testing

Execute automated regression test suite:
```bash
node scratch/test-sahil-khan-dataset.js
```
Expected output:
```
==================================================
CIPHER AUTHORITATIVE HIGH COURT GROUNDING AUDIT
Case: Sahil Khan v. State Govt. of NCT of Delhi (FIR 4/2025)
==================================================
Total Tests: 36
Passed: 36
Failed: 0
Status: 100% COURT RECORD GROUNDED
==================================================
```

---

## Responsible AI Compliance Note

The CIPHER platform strictly enforces Responsible AI governance for law enforcement:
1. **Never Asserts Guilt**: CIPHER algorithms identify statistical correlations and operational leads; only human judicial bodies establish guilt.
2. **Never Uses Prohibited Terms**: Outputs avoid phrases like *Confirmed Criminal*, *Guilty Person*, or *Crime Probability*.
3. **Mandatory Provenance**: Every AI interpretation identifies retrieved factual citations (`COURT_RECORDED`, `VERIFIED_EVIDENCE`), mathematical graph analytics, and explicit `REQUIRES HUMAN VERIFICATION` notices.
