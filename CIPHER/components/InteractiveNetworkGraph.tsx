"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Car,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  ZoomIn,
  ZoomOut,
  Filter,
  Layers,
  Route,
  Maximize2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Focus,
  Activity,
  CheckCircle2,
  Pin,
  Plus,
  Trash2,
  Edit3,
  Link2,
  AlertTriangle,
  FileText,
  Clock,
  Compass,
  X,
  Share2,
} from "lucide-react";
import { useInvestigation } from "@/components/InvestigationContext";

export interface GraphNode {
  id: string;
  label: string;
  name: string;
  type: "suspect" | "person" | "phone" | "vehicle" | "location" | "org" | "case" | "financial" | "clue";
  x: number;
  y: number;
  risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  details: string;
  centrality: string;
  cluster: number;
  status?: string;
  isAnalystClue?: boolean;
  clueData?: {
    observation: string;
    source?: string;
    referenceId?: string;
    dateTime?: string;
    tags?: string[];
    priority?: string;
    confidence?: string;
    createdBy?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type?: "suspect" | "communication" | "financial" | "location" | "org" | "case" | "vehicle" | "analyst";
  isHighRisk?: boolean;
  isAnalystCreated?: boolean;
  notes?: string;
}

interface InteractiveNetworkGraphProps {
  height?: string;
  showInspector?: boolean;
  initialNodes?: GraphNode[];
  initialEdges?: GraphEdge[];
}

export default function InteractiveNetworkGraph({
  height = "h-[560px]",
  showInspector = true,
  initialNodes,
  initialEdges,
}: InteractiveNetworkGraphProps) {
  const searchParams = useSearchParams();
  const { activeCaseId } = useInvestigation();

  // Graph Data State
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes || []);
  const [edges, setEdges] = useState<GraphEdge[]>(initialEdges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [highlightCluster, setHighlightCluster] = useState<number | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [shortestPathActive, setShortestPathActive] = useState(false);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // Modals state
  const [addClueModalOpen, setAddClueModalOpen] = useState(false);
  const [editClueModalOpen, setEditClueModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form states for Add Clue
  const [clueTitle, setClueTitle] = useState("");
  const [clueObservation, setClueObservation] = useState("");
  const [clueSource, setClueSource] = useState("");
  const [cluePriority, setCluePriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [clueNodeType, setClueNodeType] = useState("evidence");
  const [clueConfidence, setClueConfidence] = useState("High (Verified)");

  // Form states for Connect Clue
  const [connectTargetId, setConnectTargetId] = useState("");
  const [connectRelationship, setConnectRelationship] = useState("POTENTIAL_ASSOCIATION");
  const [connectNotes, setConnectNotes] = useState("");

  // SVG Pan & Zoom State
  const [transform, setTransform] = useState({ panX: 0, panY: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({
    startX: 0,
    startY: 0,
    nodeStartX: 0,
    nodeStartY: 0,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const savePositionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch case-specific graph when activeCaseId changes
  useEffect(() => {
    if (!activeCaseId) return;

    setIsLoadingGraph(true);
    fetch(`/api/investigations/${activeCaseId}/graph`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          setEdges(data.edges || []);

          // Check if focusNode is specified in URL
          const focusNodeParam = searchParams.get("focusNode");
          if (focusNodeParam) {
            const found = data.nodes.find(
              (n: GraphNode) =>
                n.id === focusNodeParam ||
                n.name.toLowerCase().includes(focusNodeParam.toLowerCase()) ||
                n.label.toLowerCase().includes(focusNodeParam.toLowerCase())
            );
            if (found) {
              setSelectedNodeId(found.id);
              return;
            }
          }

          if (data.nodes.length > 0) {
            setSelectedNodeId(data.nodes[0].id);
          } else {
            setSelectedNodeId("");
          }
        }
      })
      .catch((err) => console.error("Error loading case graph:", err))
      .finally(() => setIsLoadingGraph(false));
  }, [activeCaseId, searchParams]);

  // Persist node position on drag release
  const persistNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      if (!activeCaseId) return;
      if (savePositionsTimeoutRef.current) {
        clearTimeout(savePositionsTimeoutRef.current);
      }
      savePositionsTimeoutRef.current = setTimeout(() => {
        fetch(`/api/investigations/${activeCaseId}/positions`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            positions: {
              [nodeId]: { x, y },
            },
          }),
        }).catch((err) => console.error("Failed to persist node position:", err));
      }, 500);
    },
    [activeCaseId]
  );

  // Validate Edges: Source and Target must exist
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [nodes]);

  const validEdges = useMemo(() => {
    return edges
      .filter((edge) => {
        const srcId = edge.source || (edge as unknown as { from: string }).from;
        const tgtId = edge.target || (edge as unknown as { to: string }).to;
        return nodeMap.has(srcId) && nodeMap.has(tgtId);
      })
      .map((edge) => ({
        ...edge,
        source: edge.source || (edge as unknown as { from: string }).from,
        target: edge.target || (edge as unknown as { to: string }).to,
        label: edge.label || (edge as unknown as { relationship: string }).relationship || "",
      }));
  }, [edges, nodeMap]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (filterType !== "ALL" && node.type !== filterType) return false;
      return true;
    });
  }, [nodes, filterType]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Edges where both source and target are visible
  const visibleEdges = useMemo(() => {
    return validEdges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [validEdges, visibleNodeIds]);

  // Selected node object
  const selectedNode = useMemo(() => {
    return nodeMap.get(selectedNodeId) || nodes[0] || null;
  }, [selectedNodeId, nodeMap, nodes]);

  // Connected node IDs of the selected node
  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (!selectedNodeId) return set;
    for (const edge of validEdges) {
      if (edge.source === selectedNodeId) set.add(edge.target);
      else if (edge.target === selectedNodeId) set.add(edge.source);
    }
    return set;
  }, [selectedNodeId, validEdges]);

  // Dynamic Dijkstra / Shortest Path calculation
  const shortestPathData = useMemo(() => {
    if (!shortestPathActive || !selectedNodeId) {
      return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
    }

    const startId = selectedNodeId;
    let targetId = "loc-dock";
    if (startId === "loc-dock") targetId = "fin-vault";

    const queue: Array<{ node: string; path: string[]; edges: string[] }> = [
      { node: startId, path: [startId], edges: [] },
    ];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.node === targetId) {
        return {
          nodeIds: new Set(current.path),
          edgeIds: new Set(current.edges),
        };
      }

      for (const edge of validEdges) {
        let neighbor: string | null = null;
        if (edge.source === current.node) neighbor = edge.target;
        else if (edge.target === current.node) neighbor = edge.source;

        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            node: neighbor,
            path: [...current.path, neighbor],
            edges: [...current.edges, edge.id],
          });
        }
      }
    }

    return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
  }, [shortestPathActive, selectedNodeId, validEdges]);

  // Color mappings
  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "suspect":
        return {
          bg: "#ea580c",
          border: "#fb923c",
          text: "#fb923c",
          halo: "rgba(251, 146, 60, 0.4)",
          badge: "bg-orange-950 text-orange-400 border-orange-700",
        };
      case "person":
        return {
          bg: "#2563eb",
          border: "#60a5fa",
          text: "#60a5fa",
          halo: "rgba(96, 165, 250, 0.4)",
          badge: "bg-blue-950 text-blue-400 border-blue-700",
        };
      case "phone":
        return {
          bg: "#0891b2",
          border: "#38bdf8",
          text: "#38bdf8",
          halo: "rgba(56, 189, 248, 0.4)",
          badge: "bg-cyan-950 text-cyan-400 border-cyan-700",
        };
      case "vehicle":
        return {
          bg: "#d97706",
          border: "#fbbf24",
          text: "#fbbf24",
          halo: "rgba(251, 191, 36, 0.4)",
          badge: "bg-amber-950 text-amber-400 border-amber-700",
        };
      case "location":
        return {
          bg: "#9333ea",
          border: "#c084fc",
          text: "#c084fc",
          halo: "rgba(192, 132, 252, 0.4)",
          badge: "bg-purple-950 text-purple-400 border-purple-700",
        };
      case "org":
        return {
          bg: "#059669",
          border: "#34d399",
          text: "#34d399",
          halo: "rgba(52, 211, 153, 0.4)",
          badge: "bg-emerald-950 text-emerald-400 border-emerald-700",
        };
      case "case":
        return {
          bg: "#e11d48",
          border: "#fb7185",
          text: "#fb7185",
          halo: "rgba(251, 113, 133, 0.4)",
          badge: "bg-rose-950 text-rose-400 border-rose-700",
        };
      case "financial":
        return {
          bg: "#ca8a04",
          border: "#facc15",
          text: "#facc15",
          halo: "rgba(250, 204, 21, 0.4)",
          badge: "bg-yellow-950 text-yellow-400 border-yellow-700",
        };
      case "clue":
      default:
        return {
          bg: "#b45309",
          border: "#f59e0b",
          text: "#fef08a",
          halo: "rgba(245, 158, 11, 0.4)",
          badge: "bg-amber-950 text-amber-300 border-amber-600",
        };
    }
  };

  const getNodeIcon = (type: GraphNode["type"]) => {
    const iconClass = "w-3.5 h-3.5 text-white stroke-[2.2]";
    switch (type) {
      case "suspect":
      case "person":
        return <User className={iconClass} />;
      case "phone":
        return <Phone className={iconClass} />;
      case "vehicle":
        return <Car className={iconClass} />;
      case "location":
        return <MapPin className={iconClass} />;
      case "org":
        return <Building className={iconClass} />;
      case "financial":
        return <CreditCard className={iconClass} />;
      case "case":
        return <Briefcase className={iconClass} />;
      case "clue":
      default:
        return <Pin className={iconClass} />;
    }
  };

  const getEdgeColor = (edge: GraphEdge) => {
    if (edge.isAnalystCreated) return "#f59e0b";
    switch (edge.type) {
      case "suspect":
        return "#ea580c";
      case "communication":
        return "#0284c7";
      case "financial":
        return "#eab308";
      case "location":
        return "#a855f7";
      case "org":
        return "#10b981";
      case "case":
        return "#f43f5e";
      case "vehicle":
        return "#38bdf8";
      default:
        return edge.isHighRisk ? "#ff3b30" : "#2e466e";
    }
  };

  // Node Drag Handlers
  const handleNodePointerDown = (e: React.PointerEvent, node: GraphNode) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);

    setDraggingNodeId(node.id);
    setDragOffset({
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    });
    setSelectedNodeId(node.id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      const dx = (e.clientX - dragOffset.startX) / transform.zoom;
      const dy = (e.clientY - dragOffset.startY) / transform.zoom;

      const newX = Math.round(dragOffset.nodeStartX + dx);
      const newY = Math.round(dragOffset.nodeStartY + dy);

      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setTransform((prev) => ({
        ...prev,
        panX: panStart.initialPanX + dx,
        panY: panStart.initialPanY + dy,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      const movedNode = nodes.find((n) => n.id === draggingNodeId);
      if (movedNode) {
        persistNodePosition(movedNode.id, movedNode.x, movedNode.y);
      }
      setDraggingNodeId(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Background Canvas Pan Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        initialPanX: transform.panX,
        initialPanY: transform.panY,
      });
    }
  };

  // Zoom and View Controls
  const handleZoomIn = () => {
    setTransform((t) => ({ ...t, zoom: Math.min(2.2, Number((t.zoom + 0.15).toFixed(2))) }));
  };

  const handleZoomOut = () => {
    setTransform((t) => ({ ...t, zoom: Math.max(0.45, Number((t.zoom - 0.15).toFixed(2))) }));
  };

  const handleResetZoom = () => {
    setTransform({ panX: 0, panY: 0, zoom: 1 });
  };

  const handleFitGraph = useCallback(() => {
    if (!svgRef.current || visibleNodes.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    const xs = visibleNodes.map((n) => n.x);
    const ys = visibleNodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const graphWidth = Math.max(maxX - minX + 160, 200);
    const graphHeight = Math.max(maxY - minY + 160, 200);

    const scaleX = width / graphWidth;
    const scaleY = height / graphHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.55), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({
      zoom: Number(newZoom.toFixed(2)),
      panX: Math.round(width / 2 - centerX * newZoom),
      panY: Math.round(height / 2 - centerY * newZoom),
    });
  }, [visibleNodes]);

  const handleFocusSelected = useCallback(() => {
    if (!svgRef.current || !selectedNode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    setTransform((prev) => ({
      ...prev,
      panX: Math.round(width / 2 - selectedNode.x * prev.zoom),
      panY: Math.round(height / 2 - selectedNode.y * prev.zoom),
    }));
  }, [selectedNode]);

  // Handler: Add Clue Submit
  const handleAddClueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueTitle.trim() || !clueObservation.trim() || !activeCaseId) return;

    try {
      const res = await fetch(`/api/investigations/${activeCaseId}/clues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: clueTitle.trim(),
          clueObservation: clueObservation.trim(),
          source: clueSource.trim() || "Field Intelligence",
          priority: cluePriority,
          nodeType: clueNodeType,
          confidence: clueConfidence,
          positionX: 520,
          positionY: 280,
        }),
      });

      const data = await res.json();
      if (data.success && data.clueNode) {
        setNodes((prev) => [...prev, data.clueNode]);
        setSelectedNodeId(data.clueNode.id);
        setAddClueModalOpen(false);
        setClueTitle("");
        setClueObservation("");
        setClueSource("");
      }
    } catch (err) {
      console.error("Error creating clue:", err);
    }
  };

  // Handler: Edit Clue Submit
  const handleEditClueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !activeCaseId) return;

    try {
      const res = await fetch(`/api/investigations/${activeCaseId}/clues/${selectedNode.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: clueTitle.trim() || selectedNode.name,
          clueObservation: clueObservation.trim() || selectedNode.details,
          source: clueSource.trim() || (selectedNode.clueData?.source || "Field Intelligence"),
          priority: cluePriority,
        }),
      });

      const data = await res.json();
      if (data.success && data.updatedNode) {
        setNodes((prev) =>
          prev.map((n) => (n.id === selectedNode.id ? { ...n, ...data.updatedNode } : n))
        );
        setEditClueModalOpen(false);
      }
    } catch (err) {
      console.error("Error updating clue:", err);
    }
  };

  // Handler: Connect Clue Submit
  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !connectTargetId || !activeCaseId) return;

    try {
      const res = await fetch(`/api/investigations/${activeCaseId}/clues/${selectedNode.id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: connectTargetId,
          relationshipType: connectRelationship,
          notes: connectNotes.trim() || "Analyst-entered investigative hypothesis",
        }),
      });

      const data = await res.json();
      if (data.success && data.newEdge) {
        setEdges((prev) => [...prev, data.newEdge]);
        setConnectModalOpen(false);
        setConnectTargetId("");
        setConnectNotes("");
      }
    } catch (err) {
      console.error("Error connecting clue:", err);
    }
  };

  // Handler: Delete Clue Confirm
  const handleDeleteClueConfirm = async () => {
    if (!selectedNode || !activeCaseId) return;

    try {
      const res = await fetch(`/api/investigations/${activeCaseId}/clues/${selectedNode.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
        setEdges((prev) =>
          prev.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
        );
        setDeleteConfirmOpen(false);
        const remaining = nodes.filter((n) => n.id !== selectedNode.id);
        setSelectedNodeId(remaining[0]?.id || "");
      }
    } catch (err) {
      console.error("Error deleting clue:", err);
    }
  };

  const isSelectedClue = Boolean(
    selectedNode && (selectedNode.isAnalystClue || selectedNode.id.startsWith("clue-"))
  );

  return (
    <div
      className={`relative w-full ${height} rounded-xl border border-[#17253b] bg-[#050912] overflow-hidden flex flex-col md:flex-row shadow-2xl select-none`}
    >
      {/* Main Tactical Graph Canvas Area */}
      <div
        className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(#16243a_1px,transparent_1px)] [background-size:24px_24px]"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Floating Controls Toolbar */}
        <header className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-[#0a1222]/95 backdrop-blur-md p-1.5 rounded-lg border border-[#1b2b46] shadow-xl">
            {/* Filter Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  filterType !== "ALL"
                    ? "bg-[#142036] text-[#39d9ff] border border-cyan-800/40"
                    : "text-slate-300 hover:text-white hover:bg-[#121c2e]"
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-[#39d9ff]" />
                <span>TYPE: {filterType}</span>
              </button>

              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-[#080d19] border border-[#19273f] rounded-lg shadow-2xl py-1 z-30 font-mono text-xs">
                  {["ALL", "suspect", "person", "phone", "vehicle", "location", "org", "case", "financial"].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setFilterType(t);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#121e33] flex items-center justify-between capitalize ${
                          filterType === t ? "text-[#39d9ff] font-bold" : "text-slate-300"
                        }`}
                      >
                        <span>{t}</span>
                        {filterType === t && <CheckCircle2 className="w-3 h-3 text-[#39d9ff]" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Shortest Path Toggle */}
            <button
              type="button"
              onClick={() => setShortestPathActive(!shortestPathActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
                shortestPathActive
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-[0_0_10px_rgba(57,217,255,0.3)]"
                  : "text-slate-300 hover:text-white hover:bg-[#121c2e]"
              }`}
              title="Compute Dijkstra Shortest Path to Warehouse/Vault"
            >
              <Route className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHORTEST PATH</span>
            </button>

            {/* ADD CLUE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setClueTitle("");
                setClueObservation("");
                setAddClueModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-mono font-bold text-xs shadow-md transition-all cursor-pointer pointer-events-auto"
              title="Add Investigator Clue (Evidence Board)"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>+ ADD CLUE</span>
            </button>
          </div>

          {/* Canvas Zoom Tools */}
          <div className="flex items-center gap-1 pointer-events-auto bg-[#0a1222]/95 backdrop-blur-md p-1 rounded-lg border border-[#1b2b46] shadow-xl">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16253d] rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16253d] rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitGraph}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16253d] rounded transition-colors"
              title="Fit Graph to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-[#16253d] rounded transition-colors"
              title="Reset Zoom to 100%"
            >
              {Math.round(transform.zoom * 100)}%
            </button>
          </div>
        </header>

        {/* UNIFIED SVG GRAPH CANVAS */}
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
          style={{ touchAction: "none" }}
        >
          <defs>
            <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-path" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Transform group applying Pan and Zoom across all nodes and edges */}
          <g transform={`translate(${transform.panX}, ${transform.panY}) scale(${transform.zoom})`}>
            {/* LAYER 1: RELATIONSHIP EDGES */}
            {visibleEdges.map((edge) => {
              const sourceNode = nodeMap.get(edge.source);
              const targetNode = nodeMap.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const isDirectlyConnected =
                selectedNodeId === edge.source || selectedNodeId === edge.target;
              const isInShortestPath =
                shortestPathActive && shortestPathData.edgeIds.has(edge.id);

              const hasSelection = Boolean(selectedNodeId);
              const isClusterDimmed =
                highlightCluster !== null &&
                (sourceNode.cluster !== highlightCluster || targetNode.cluster !== highlightCluster);

              const isDimmed =
                isClusterDimmed ||
                (hasSelection && !isDirectlyConnected && !isInShortestPath);

              const isAnalyst = Boolean(edge.isAnalystCreated);
              const strokeColor = getEdgeColor(edge);
              const strokeWidth = isInShortestPath ? 3.5 : isDirectlyConnected ? 2.5 : 1.5;

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;
              const labelText = edge.label;
              const textWidth = Math.max(labelText.length * 5.8, 54);

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200"
                  style={{ opacity: isDimmed ? 0.15 : 1 }}
                >
                  {(isDirectlyConnected || isInShortestPath) && (
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isInShortestPath ? "#39d9ff" : strokeColor}
                      strokeWidth={strokeWidth + 4}
                      strokeOpacity={0.35}
                      strokeLinecap="round"
                    />
                  )}

                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isInShortestPath ? "#39d9ff" : strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isAnalyst ? "4 3" : edge.isHighRisk ? "5 4" : undefined}
                    strokeLinecap="round"
                  />

                  {labelText && (
                    <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                      <rect
                        x={-textWidth / 2}
                        y={-9}
                        width={textWidth}
                        height={18}
                        rx={5}
                        fill="#070d18"
                        fillOpacity={0.92}
                        stroke={isAnalyst ? "#f59e0b" : isDirectlyConnected ? strokeColor : "#1e2c44"}
                        strokeWidth={isAnalyst || isDirectlyConnected ? 1.5 : 1}
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill={isAnalyst ? "#fef08a" : isDirectlyConnected ? "#ffffff" : "#94a3b8"}
                        fontSize="8.5"
                        fontWeight={isDirectlyConnected || isAnalyst ? "600" : "400"}
                        fontFamily="ui-monospace, monospace"
                      >
                        {isAnalyst ? `[HYPOTHESIS] ${labelText}` : labelText}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* LAYER 2: NODES */}
            {visibleNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isInShortestPath = shortestPathActive && shortestPathData.nodeIds.has(node.id);
              const isClue = Boolean(node.isAnalystClue || node.id.startsWith("clue-"));

              const isClusterDimmed =
                highlightCluster !== null && node.cluster !== highlightCluster;
              const isDimmed =
                isClusterDimmed ||
                (Boolean(selectedNodeId) && !isConnected && !isInShortestPath && !isSelected);

              // DISTINCT EVIDENCE STICKY-NOTE STYLING FOR CLUES
              if (isClue) {
                const cardWidth = 100;
                const cardHeight = 60;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onPointerDown={(e) => handleNodePointerDown(e, node)}
                    className="cursor-pointer transition-opacity duration-200 group"
                    style={{ opacity: isDimmed ? 0.22 : 1 }}
                  >
                    {/* Selection Halo */}
                    {isSelected && (
                      <rect
                        x={-cardWidth / 2 - 4}
                        y={-cardHeight / 2 - 4}
                        width={cardWidth + 8}
                        height={cardHeight + 8}
                        rx={8}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    )}

                    {/* Note Card Body */}
                    <rect
                      x={-cardWidth / 2}
                      y={-cardHeight / 2}
                      width={cardWidth}
                      height={cardHeight}
                      rx={6}
                      fill="#231b0a"
                      stroke={isSelected ? "#fef08a" : "#d97706"}
                      strokeWidth={isSelected ? 2.2 : 1.4}
                      className="shadow-xl"
                    />

                    {/* Pushpin at Top Center */}
                    <g transform={`translate(0, ${-cardHeight / 2})`}>
                      <circle cx={0} cy={-4} r={5} fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
                      <circle cx={-1.5} cy={-5.5} r={1.5} fill="#ffffff" />
                      <path d="M -2 0 L 2 0 L 0 5 Z" fill="#94a3b8" />
                    </g>

                    {/* Card Header: ANALYST CLUE Tag */}
                    <text
                      x={0}
                      y={-cardHeight / 2 + 15}
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                      letterSpacing="0.05em"
                    >
                      ★ ANALYST CLUE
                    </text>

                    {/* Title Text */}
                    <text
                      x={0}
                      y={-cardHeight / 2 + 28}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
                    </text>

                    {/* Priority Badge Pill inside card */}
                    <rect
                      x={-24}
                      y={-cardHeight / 2 + 36}
                      width={48}
                      height={12}
                      rx={3}
                      fill="#451a03"
                      stroke="#b45309"
                      strokeWidth="1"
                    />
                    <text
                      x={0}
                      y={-cardHeight / 2 + 45}
                      textAnchor="middle"
                      fill="#fde047"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="ui-monospace, monospace"
                    >
                      {node.risk} PRIORITY
                    </text>
                  </g>
                );
              }

              // STANDARD CIRCULAR ENTITY NODES
              const colorInfo = getNodeColor(node.type);
              const labelWidth = Math.max(node.label.length * 6.6, 56);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onPointerDown={(e) => handleNodePointerDown(e, node)}
                  className="cursor-pointer transition-opacity duration-200 group"
                  style={{ opacity: isDimmed ? 0.22 : 1 }}
                >
                  {/* Selection Halo */}
                  {isSelected && (
                    <>
                      <circle
                        r={27}
                        fill="none"
                        stroke="#ff3b30"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        className="animate-spin"
                        style={{ animationDuration: "12s" }}
                      />
                      <circle r={24} fill="#ff3b30" fillOpacity={0.18} filter="url(#glow-selected)" />
                    </>
                  )}

                  {isInShortestPath && !isSelected && (
                    <circle r={24} fill="none" stroke="#39d9ff" strokeWidth="2.5" filter="url(#glow-path)" />
                  )}

                  {isConnected && !isSelected && !isInShortestPath && (
                    <circle
                      r={22}
                      fill="none"
                      stroke={colorInfo.border}
                      strokeWidth="1.5"
                      strokeOpacity={0.7}
                    />
                  )}

                  {/* Base Entity Circle */}
                  <circle
                    r={18}
                    fill={colorInfo.bg}
                    stroke={isSelected ? "#ffffff" : colorInfo.border}
                    strokeWidth={isSelected ? 2.5 : 1.8}
                    className="transition-transform group-hover:scale-105"
                  />

                  {/* Embedded Icon */}
                  <foreignObject
                    x={-9}
                    y={-9}
                    width={18}
                    height={18}
                    className="pointer-events-none flex items-center justify-center"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {getNodeIcon(node.type)}
                    </div>
                  </foreignObject>

                  {/* Risk Indicator Dot */}
                  <circle
                    cx={12}
                    cy={-12}
                    r={4}
                    fill={
                      node.risk === "CRITICAL"
                        ? "#ff3b30"
                        : node.risk === "HIGH"
                        ? "#f97316"
                        : node.risk === "MEDIUM"
                        ? "#eab308"
                        : "#64748b"
                    }
                    stroke="#050912"
                    strokeWidth="1.5"
                  />

                  {/* Node Label Pill */}
                  <g transform="translate(0, 24)" className="pointer-events-none">
                    <rect
                      x={-labelWidth / 2}
                      y={0}
                      width={labelWidth}
                      height={16}
                      rx={4}
                      fill={isSelected ? "#ff3b30" : "#091120"}
                      fillOpacity={0.96}
                      stroke={isSelected ? "#ffffff" : "#1e2c44"}
                      strokeWidth={isSelected ? 1.2 : 1}
                    />
                    <text
                      x={0}
                      y={11.5}
                      textAnchor="middle"
                      fill={isSelected ? "#ffffff" : "#f1f5f9"}
                      fontSize="9"
                      fontWeight={isSelected ? "bold" : "500"}
                      fontFamily="ui-monospace, monospace"
                    >
                      {node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Visual Map Legend Overlay */}
        <div className="absolute left-3 bottom-3 bg-[#080e1a]/95 backdrop-blur-md border border-[#17253b] rounded-lg p-2.5 hidden sm:flex items-center gap-4 text-[10px] text-slate-400 pointer-events-none shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
            <span>Target / Suspect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
            <span>Communication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm" />
            <span>Financial Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-md bg-amber-500 shadow-sm" />
            <span className="text-amber-300 font-bold">Analyst Clue (Note)</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: TACTICAL ENTITY INSPECTOR */}
      {showInspector && selectedNode && (
        <aside className="w-full md:w-84 border-t md:border-t-0 md:border-l border-[#17253b] bg-[#070d18] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header / Title */}
            <div className="flex items-center justify-between border-b border-[#141f33] pb-3">
              <div className="flex items-center gap-2">
                {isSelectedClue ? (
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-[#39d9ff]" />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {isSelectedClue ? "ANALYST EVIDENCE CLUE" : "ENTITY INSPECTOR"}
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${
                  selectedNode.risk === "CRITICAL"
                    ? "bg-red-950/80 text-red-400 border-red-800"
                    : selectedNode.risk === "HIGH"
                    ? "bg-orange-950/80 text-orange-400 border-orange-800"
                    : "bg-amber-950/80 text-amber-400 border-amber-800"
                }`}
              >
                {selectedNode.risk} PRIORITY
              </span>
            </div>

            {/* Identification */}
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: isSelectedClue ? "#f59e0b" : getNodeColor(selectedNode.type).bg }}
                />
                <h3 className="text-sm font-bold text-white leading-tight font-sans">
                  {selectedNode.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-900/60 px-1.5 py-0.5 rounded uppercase">
                  {selectedNode.type}
                </span>
                {isSelectedClue ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                    Analyst Hypothesis
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">
                    Cluster {selectedNode.cluster}
                  </span>
                )}
                {selectedNode.status && (
                  <span className="text-[10px] font-mono text-emerald-400 ml-auto truncate max-w-[130px]">
                    {selectedNode.status}
                  </span>
                )}
              </div>
            </div>

            {/* Operational Details / Observation */}
            <div className="bg-[#0b1322] border border-[#17253d] rounded-lg p-3 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
              <p>{selectedNode.details}</p>
              {selectedNode.clueData?.source && (
                <div className="pt-2 border-t border-[#172338] text-[10px] font-mono text-amber-400 flex items-center justify-between">
                  <span>Source: {selectedNode.clueData.source}</span>
                  <span>{selectedNode.clueData.createdBy || "Amit Sharma"}</span>
                </div>
              )}
            </div>

            {/* Graph Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0b1322] border border-[#17253d] rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-mono">Betweenness</span>
                <span className="font-bold text-white font-mono text-sm">{selectedNode.centrality}</span>
              </div>
              <div className="bg-[#0b1322] border border-[#17253d] rounded-lg p-2.5">
                <span className="text-[10px] text-slate-500 block font-mono">Linked Edges</span>
                <span className="font-bold text-[#39d9ff] font-mono text-sm">
                  {validEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length} links
                </span>
              </div>
            </div>

            {/* DIRECT CONNECTIONS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  DIRECT CONNECTIONS
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {validEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length} total
                </span>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {validEdges
                  .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map((edge) => {
                    const peerId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const peer = nodeMap.get(peerId);
                    if (!peer) return null;
                    return (
                      <div
                        key={edge.id}
                        onClick={() => setSelectedNodeId(peer.id)}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0a1220] hover:bg-[#121f35] cursor-pointer text-xs transition-colors border border-[#15233b] hover:border-[#223b5d] group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getNodeColor(peer.type).bg }}
                          />
                          <div className="truncate">
                            <span className="text-slate-200 group-hover:text-white font-medium block truncate">
                              {peer.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block truncate">
                              {edge.isAnalystCreated ? `[HYPOTHESIS] ${edge.label}` : edge.label}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#39d9ff] shrink-0 transition-colors" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#141f33] flex flex-col gap-2">
            {/* If Clue Node: Show Connect, Edit, Delete options */}
            {isSelectedClue ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setConnectTargetId("");
                    setConnectNotes("");
                    setConnectModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Connect Clue to Node</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClueTitle(selectedNode.name);
                      setClueObservation(selectedNode.details);
                      setClueSource(selectedNode.clueData?.source || "");
                      setCluePriority((selectedNode.risk as any) || "HIGH");
                      setEditClueModalOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-lg bg-[#121c2e] hover:bg-[#1a2840] text-slate-200 text-xs font-mono border border-[#1e2e46] transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-cyan-400" />
                    <span>Edit Clue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="py-2 px-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-mono border border-red-800/60 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Delete Clue</span>
                  </button>
                </div>
              </>
            ) : null}

            {/* Bidirectional Link: View on Map */}
            <Link
              href={`/geospatial?focusNode=${selectedNode.id}`}
              className="w-full py-2 px-3 rounded-lg bg-[#0e1726] hover:bg-[#17253c] text-cyan-300 hover:text-white border border-cyan-800/50 text-xs font-mono transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>View on Geospatial Map</span>
            </Link>

            <button
              type="button"
              onClick={handleFocusSelected}
              className="w-full py-2 px-3 rounded-lg bg-[#101b2d] hover:bg-[#182842] text-slate-200 text-xs font-mono border border-[#1e304e] transition-colors flex items-center justify-center gap-1.5"
            >
              <Focus className="w-3.5 h-3.5 text-[#39d9ff]" />
              <span>Center in View</span>
            </button>
          </div>
        </aside>
      )}

      {/* MODAL: ADD INVESTIGATOR CLUE */}
      {addClueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#090f1b] border border-amber-600/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b46]">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                  ADD INVESTIGATOR CLUE // EVIDENCE BOARD
                </h3>
              </div>
              <button
                onClick={() => setAddClueModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClueSubmit} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Clue Title / Label *</label>
                <input
                  type="text"
                  required
                  value={clueTitle}
                  onChange={(e) => setClueTitle(e.target.value)}
                  placeholder="e.g. Unregistered Freight Manifest #CY-88"
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Observation / Hypothesis Details *</label>
                <textarea
                  required
                  rows={3}
                  value={clueObservation}
                  onChange={(e) => setClueObservation(e.target.value)}
                  placeholder="Detail observed connections, timestamps, or investigative theories..."
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Evidence Source</label>
                  <input
                    type="text"
                    value={clueSource}
                    onChange={(e) => setClueSource(e.target.value)}
                    placeholder="e.g. Informant T-9, Port CCTV"
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priority Level</label>
                  <select
                    value={cluePriority}
                    onChange={(e) => setCluePriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Entity Category</label>
                  <select
                    value={clueNodeType}
                    onChange={(e) => setClueNodeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="evidence">Evidence Exhibit</option>
                    <option value="suspect">Suspect / Person</option>
                    <option value="phone">Telecom / Phone</option>
                    <option value="location">Location / Waypoint</option>
                    <option value="financial">Financial Movement</option>
                    <option value="vehicle">Vehicle / Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Confidence</label>
                  <select
                    value={clueConfidence}
                    onChange={(e) => setClueConfidence(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="High (Verified)">High (Verified)</option>
                    <option value="Probable (75%)">Probable (75%)</option>
                    <option value="Investigative Lead">Investigative Lead</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#17253d] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddClueModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-lg"
                >
                  Pin Clue to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INVESTIGATOR CLUE */}
      {editClueModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#090f1b] border border-cyan-600/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b46]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                  EDIT INVESTIGATOR CLUE
                </h3>
              </div>
              <button
                onClick={() => setEditClueModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditClueSubmit} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Clue Title *</label>
                <input
                  type="text"
                  required
                  value={clueTitle}
                  onChange={(e) => setClueTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Observation / Hypothesis *</label>
                <textarea
                  required
                  rows={3}
                  value={clueObservation}
                  onChange={(e) => setClueObservation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source</label>
                  <input
                    type="text"
                    value={clueSource}
                    onChange={(e) => setClueSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={cluePriority}
                    onChange={(e) => setCluePriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#17253d] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditClueModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONNECT CLUE TO TARGET NODE */}
      {connectModalOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#090f1b] border border-amber-600/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b46]">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                  CONNECT CLUE // FORM INVESTIGATIVE HYPOTHESIS
                </h3>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-3.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#060a12] border border-[#19263e]">
                <span className="text-[10px] text-slate-500 block">SOURCE CLUE</span>
                <span className="text-white font-bold">{selectedNode.name}</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Node to Connect *</label>
                <select
                  required
                  value={connectTargetId}
                  onChange={(e) => setConnectTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select target node...</option>
                  {nodes
                    .filter((n) => n.id !== selectedNode.id)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.type.toUpperCase()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hypothesis Relationship Label</label>
                <select
                  value={connectRelationship}
                  onChange={(e) => setConnectRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="POTENTIAL_ASSOCIATION">POTENTIAL_ASSOCIATION</option>
                  <option value="SEEN_NEAR">SEEN_NEAR</option>
                  <option value="FINANCIAL_LINK">FINANCIAL_LINK</option>
                  <option value="TELECOM_INTERCEPT">TELECOM_INTERCEPT</option>
                  <option value="COVERT_MEETING">COVERT_MEETING</option>
                  <option value="LOGISTICS_CONSIGNMENT">LOGISTICS_CONSIGNMENT</option>
                  <option value="ANALYST_HYPOTHESIS">ANALYST_HYPOTHESIS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Analyst Notes / Rationale</label>
                <input
                  type="text"
                  value={connectNotes}
                  onChange={(e) => setConnectNotes(e.target.value)}
                  placeholder="e.g. Wiretap audio referenced shipment matching this container"
                  className="w-full px-3 py-2 rounded-lg bg-[#060a12] border border-[#1c2c48] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[#17253d] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!connectTargetId}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold shadow-lg disabled:opacity-50"
                >
                  Create Hypothesis Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CLUE CONFIRMATION */}
      {deleteConfirmOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0d070a] border border-red-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950 border border-red-600 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-sans">DELETE INVESTIGATOR CLUE</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Are you sure you want to remove &quot;{selectedNode.name}&quot; and all connected hypothesis edges?
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-red-950 flex items-center justify-end gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClueConfirm}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
