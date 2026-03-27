"use client";

import { useCallback, useMemo, useState } from "react";
import { updateResource } from "@/src/lib/resource";
import {
  useResourceCollaboration,
  type CollaborationConnectionStatus,
} from "@/src/lib/use-resource-collaboration";

interface FocusTreeEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface FocusTreeResource {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  summary: string | null;
  updatedAt: string;
  content?: {
    nodes?: FocusTreeNode[];
    edges?: FocusTreeEdge[];
  };
}

interface FocusTreeNode {
  id: string;
  title: string;
  x: number;
  y: number;
}

interface FocusTreeContent {
  nodes: FocusTreeNode[];
  edges: FocusTreeEdge[];
}

interface FocusTreeEditorProps {
  projectSlug: string;
  resources: FocusTreeResource[];
}

function buildInitialNodes(resource?: FocusTreeResource) {
  if (resource?.content?.nodes?.length) {
    return resource.content.nodes;
  }

  return [
    {
      id: "node_1",
      title: "新节点",
      x: 120,
      y: 80,
    },
  ];
}

function buildInitialEdges(resource?: FocusTreeResource) {
  if (resource?.content?.edges?.length) {
    return resource.content.edges;
  }

  return [];
}

function getStatusText(status: CollaborationConnectionStatus) {
  switch (status) {
    case "connecting":
      return "协同连接中";
    case "connected":
      return "协同已连接";
    case "disconnected":
      return "协同已断开";
    case "error":
      return "协同异常";
    default:
      return "协同未启动";
  }
}

function getStatusClassName(status: CollaborationConnectionStatus) {
  switch (status) {
    case "connected":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
    case "connecting":
      return "border-sky-300/20 bg-sky-300/10 text-sky-100";
    case "disconnected":
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    case "error":
      return "border-rose-300/20 bg-rose-300/10 text-rose-100";
    default:
      return "border-white/10 bg-white/6 text-slate-200/78";
  }
}

export function FocusTreeEditor({
  projectSlug,
  resources,
}: FocusTreeEditorProps) {
  const [activeResourceId, setActiveResourceId] = useState<string | null>(
    resources[0]?.id ?? null,
  );
  const activeResource = useMemo(
    () => resources.find((item) => item.id === activeResourceId) ?? null,
    [activeResourceId, resources],
  );

  const [nodes, setNodes] = useState<FocusTreeNode[]>(
    buildInitialNodes(resources[0]),
  );
  const [edges, setEdges] = useState<FocusTreeEdge[]>(
    buildInitialEdges(resources[0]),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    buildInitialNodes(resources[0])[0]?.id ?? null,
  );
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [edgeStartNodeId, setEdgeStartNodeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revision, setRevision] = useState<string>(
    resources[0]?.updatedAt ?? new Date().toISOString(),
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

  const handleSnapshot = useCallback(
    (_snapshot: { revision: string }, content: FocusTreeContent) => {
      const nextNodes = Array.isArray(content.nodes) ? content.nodes : [];
      const nextEdges = Array.isArray(content.edges) ? content.edges : [];

      setNodes(
        nextNodes.length
          ? nextNodes
          : [
              {
                id: "node_1",
                title: "新节点",
                x: 120,
                y: 80,
              },
            ],
      );
      setEdges(nextEdges);
      setRevision(_snapshot.revision);
      setFeedback("已同步最新协同快照");
    },
    [],
  );

  const handleUpdated = useCallback(
    (
      payload: {
        revision: string;
        updatedBy: {
          username: string;
        };
      },
      content: FocusTreeContent,
    ) => {
      const nextNodes = Array.isArray(content.nodes) ? content.nodes : [];
      const nextEdges = Array.isArray(content.edges) ? content.edges : [];

      setNodes(
        nextNodes.length
          ? nextNodes
          : [
              {
                id: "node_1",
                title: "新节点",
                x: 120,
                y: 80,
              },
            ],
      );
      setEdges(nextEdges);
      setRevision(payload.revision);
      setFeedback(`已同步 ${payload.updatedBy.username} 的修改`);
    },
    [],
  );

  const {
    presenceUsers,
    connectionStatus,
    lastEventMessage,
    setLastEventMessage,
    emitResourceUpdate,
  } = useResourceCollaboration<FocusTreeContent>({
    resourceId: activeResourceId,
    fallbackContent: {
      nodes: buildInitialNodes(),
      edges: buildInitialEdges(),
    },
    onSnapshot: handleSnapshot,
    onUpdated: handleUpdated,
  });

  function handleSelectResource(resourceId: string) {
    const resource = resources.find((item) => item.id === resourceId);
    const nextNodes = buildInitialNodes(resource);
    const nextEdges = buildInitialEdges(resource);

    setActiveResourceId(resourceId);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setRevision(resource?.updatedAt ?? new Date().toISOString());
    setSelectedNodeId(nextNodes[0]?.id ?? null);
    setSelectedEdgeId(null);
    setEdgeStartNodeId(null);
    setFeedback(null);
    setLastEventMessage(null);
  }

  function handleAddNode() {
    const newNode: FocusTreeNode = {
      id: `node_${Date.now()}`,
      title: `新节点 ${nodes.length + 1}`,
      x: 120 + nodes.length * 30,
      y: 80 + nodes.length * 30,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
  }

  function handleDeleteSelectedNode() {
    if (!selectedNodeId) {
      return;
    }

    setNodes((prev) => prev.filter((node) => node.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter(
        (edge) => edge.from !== selectedNodeId && edge.to !== selectedNodeId,
      ),
    );
    setEdgeStartNodeId((prev) => (prev === selectedNodeId ? null : prev));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }

  function handleUpdateSelectedTitle(title: string) {
    if (!selectedNodeId) {
      return;
    }

    setNodes((prev) =>
      prev.map((node) => (node.id === selectedNodeId ? { ...node, title } : node)),
    );
  }

  function handlePointerDown(nodeId: string) {
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingNodeId) {
      return;
    }

    const canvasRect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, event.clientX - canvasRect.left - 80);
    const y = Math.max(0, event.clientY - canvasRect.top - 24);

    setNodes((prev) =>
      prev.map((node) =>
        node.id === draggingNodeId
          ? {
              ...node,
              x,
              y,
            }
          : node,
      ),
    );
  }

  function handlePointerUp() {
    setDraggingNodeId(null);
  }

  function handleStartConnect() {
    if (!selectedNodeId) {
      return;
    }

    setEdgeStartNodeId(selectedNodeId);
    setFeedback("请选择一个目标节点以创建连线");
  }

  function handleNodeClick(nodeId: string) {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);

    if (!edgeStartNodeId || edgeStartNodeId === nodeId) {
      return;
    }

    const duplicatedEdge = edges.find(
      (edge) => edge.from === edgeStartNodeId && edge.to === nodeId,
    );

    if (duplicatedEdge) {
      setFeedback("该连线已存在");
      setEdgeStartNodeId(null);
      return;
    }

    const newEdge: FocusTreeEdge = {
      id: `edge_${Date.now()}`,
      from: edgeStartNodeId,
      to: nodeId,
      label: "",
    };

    setEdges((prev) => [...prev, newEdge]);
    setSelectedEdgeId(newEdge.id);
    setSelectedNodeId(null);
    setEdgeStartNodeId(null);
    setFeedback("连线已创建");
  }

  function handleSelectEdge(edgeId: string) {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setEdgeStartNodeId(null);
  }

  function handleDeleteSelectedEdge() {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((prev) => prev.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  }

  function handleUpdateSelectedEdgeLabel(label: string) {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((prev) =>
      prev.map((edge) => (edge.id === selectedEdgeId ? { ...edge, label } : edge)),
    );
  }

  function handleUpdateSelectedEdgeEndpoint(
    field: "from" | "to",
    value: string,
  ) {
    if (!selectedEdgeId) {
      return;
    }

    setEdges((prev) =>
      prev.map((edge) =>
        edge.id === selectedEdgeId
          ? {
              ...edge,
              [field]: value,
            }
          : edge,
      ),
    );
  }

  async function handleSave() {
    if (!activeResource) {
      setFeedback("没有可保存的 Focus Tree 资源");
      return;
    }

    setSaving(true);
    setFeedback(null);

    const nextContent: FocusTreeContent = {
      nodes,
      edges,
    };

    try {
      const sent = emitResourceUpdate({
        resourceId: activeResource.id,
        content: nextContent,
        baseRevision: revision,
      });

      if (sent) {
        setFeedback("已提交协同更新");
      } else {
        const updated = await updateResource(activeResource.id, {
          content: nextContent,
          baseRevision: revision,
        });

        setRevision(updated.revision);
        setFeedback("Focus Tree 已保存（HTTP 回退）");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
      <aside className="glass-panel rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-white/55">
          Resource Tree
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">国策树资源</h2>

        <div className="mt-5 space-y-3">
          {resources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => handleSelectResource(resource.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                resource.id === activeResourceId
                  ? "border-sky-300/30 bg-sky-300/10"
                  : "border-white/10 bg-white/6 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{resource.title}</div>
                <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[11px] text-sky-200">
                  Focus
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-200/72">
                {resource.summary || "暂无摘要说明。"}
              </div>
              <div className="mt-3 text-xs text-slate-300/58">
                {new Date(resource.updatedAt).toLocaleString("zh-CN")}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="glass-panel-strong rounded-[28px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">
              Canvas
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {projectSlug} / Focus Tree Canvas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddNode}
              className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
            >
              新增节点
            </button>
            <button
              type="button"
              onClick={handleStartConnect}
              disabled={!selectedNode}
              className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {edgeStartNodeId ? "选择目标节点..." : "从所选节点创建连线"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300/70">
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
            节点数：{nodes.length}
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
            连线数：{edges.length}
          </div>
          <div
            className={`rounded-full border px-3 py-1.5 ${getStatusClassName(connectionStatus)}`}
          >
            {getStatusText(connectionStatus)}
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-100">
            在线协同：{presenceUsers.length}
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5">
            Revision：{revision}
          </div>
          {edgeStartNodeId ? (
            <div className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-sky-100">
              连线起点：{edgeStartNodeId}
            </div>
          ) : null}
        </div>

        {presenceUsers.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {presenceUsers.map((user) => (
              <div
                key={`${user.userId}-${user.joinedAt}`}
                className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-100"
              >
                {user.username}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
          <div
            className="relative min-h-[520px] overflow-hidden rounded-[24px] border border-dashed border-white/12 bg-white/5"
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {edges.map((edge) => {
                const fromNode = nodes.find((node) => node.id === edge.from);
                const toNode = nodes.find((node) => node.id === edge.to);

                if (!fromNode || !toNode) {
                  return null;
                }

                const x1 = fromNode.x + 80;
                const y1 = fromNode.y + 24;
                const x2 = toNode.x + 80;
                const y2 = toNode.y + 24;
                const isSelected = edge.id === selectedEdgeId;

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isSelected ? "rgba(125,211,252,0.95)" : "rgba(255,255,255,0.35)"}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    {edge.label ? (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 8}
                        fill="rgba(255,255,255,0.9)"
                        fontSize="12"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {edges.map((edge) => {
              const fromNode = nodes.find((node) => node.id === edge.from);
              const toNode = nodes.find((node) => node.id === edge.to);

              if (!fromNode || !toNode) {
                return null;
              }

              const centerX = (fromNode.x + toNode.x) / 2 + 80;
              const centerY = (fromNode.y + toNode.y) / 2 + 24;

              return (
                <button
                  key={`${edge.id}_hitbox`}
                  type="button"
                  onClick={() => handleSelectEdge(edge.id)}
                  className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition ${
                    edge.id === selectedEdgeId
                      ? "border-sky-200 bg-sky-300/80"
                      : "border-white/20 bg-white/20 hover:bg-white/35"
                  }`}
                  style={{
                    left: centerX,
                    top: centerY,
                  }}
                  title={edge.label || `${edge.from} → ${edge.to}`}
                />
              );
            })}

            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onPointerDown={() => handlePointerDown(node.id)}
                onClick={() => handleNodeClick(node.id)}
                className={`absolute w-40 rounded-2xl border px-4 py-3 text-left shadow-lg transition ${
                  node.id === selectedNodeId
                    ? "border-sky-300/40 bg-sky-300/15"
                    : "border-white/10 bg-slate-900/80 hover:bg-slate-900/90"
                }`}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                }}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300/60">
                  Focus Node
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {node.title}
                </div>
              </button>
            ))}

            {!nodes.length ? (
              <div className="grid min-h-[520px] place-items-center text-center">
                <div className="max-w-xl">
                  <div className="text-xs uppercase tracking-[0.26em] text-white/45">
                    Empty Canvas
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    当前没有节点
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-200/74">
                    点击“新增节点”开始构建你的国策树结构。
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {feedback || lastEventMessage ? (
          <div className="mt-4 space-y-3">
            {feedback ? (
              <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm text-sky-100/85">
                {feedback}
              </div>
            ) : null}
            {lastEventMessage ? (
              <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-100/82">
                {lastEventMessage}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <aside className="glass-panel rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-white/55">
          Properties
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">属性面板</h2>

        {selectedNode ? (
          <div className="mt-5 space-y-4">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Title
              </span>
              <input
                value={selectedNode.title}
                onChange={(event) => handleUpdateSelectedTitle(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
              />
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Node ID
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {selectedNode.id}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Position
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                x: {Math.round(selectedNode.x)} / y: {Math.round(selectedNode.y)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleStartConnect}
                className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm text-sky-100 transition hover:bg-sky-300/15"
              >
                以当前节点为起点连线
              </button>
              <button
                type="button"
                onClick={handleDeleteSelectedNode}
                className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100 transition hover:bg-rose-300/15"
              >
                删除节点
              </button>
            </div>
          </div>
        ) : selectedEdge ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Edge ID
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {selectedEdge.id}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Label
              </span>
              <input
                value={selectedEdge.label ?? ""}
                onChange={(event) =>
                  handleUpdateSelectedEdgeLabel(event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
                placeholder="前置条件 / 权重说明"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                From
              </span>
              <select
                value={selectedEdge.from}
                onChange={(event) =>
                  handleUpdateSelectedEdgeEndpoint("from", event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title} ({node.id})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                To
              </span>
              <select
                value={selectedEdge.to}
                onChange={(event) =>
                  handleUpdateSelectedEdgeEndpoint("to", event.target.value)
                }
                className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.title} ({node.id})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleDeleteSelectedEdge}
              className="w-full rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100 transition hover:bg-rose-300/15"
            >
              删除连线
            </button>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm text-slate-200/72">
            选择一个节点后即可编辑节点属性，选择连线中点后可编辑边数据。
          </div>
        )}
      </aside>
    </div>
  );
}