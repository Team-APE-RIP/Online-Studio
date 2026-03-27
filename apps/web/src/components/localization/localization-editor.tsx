"use client";

import { useCallback, useMemo, useState } from "react";
import { updateResource } from "@/src/lib/resource";
import {
  useResourceCollaboration,
  type CollaborationConnectionStatus,
} from "@/src/lib/use-resource-collaboration";

interface LocalizationResource {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  summary: string | null;
  updatedAt: string;
  content?: {
    entries?: LocalizationEntry[];
  };
}

interface LocalizationEntry {
  key: string;
  zh: string;
  en: string;
}

interface LocalizationContent {
  entries: LocalizationEntry[];
}

interface LocalizationEditorProps {
  projectSlug: string;
  resources: LocalizationResource[];
}

function buildInitialEntries(resource?: LocalizationResource) {
  if (resource?.content?.entries?.length) {
    return resource.content.entries;
  }

  return [
    {
      key: "focus_industrial_revival_title",
      zh: "工业复兴",
      en: "Industrial Revival",
    },
  ];
}

function normalizeImportedEntries(input: unknown): LocalizationEntry[] {
  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const entry = item as Partial<LocalizationEntry>;

        return {
          key: typeof entry.key === "string" ? entry.key : "",
          zh: typeof entry.zh === "string" ? entry.zh : "",
          en: typeof entry.en === "string" ? entry.en : "",
        };
      })
      .filter(
        (item): item is LocalizationEntry =>
          item !== null && typeof item.key === "string" && item.key.length > 0,
      );
  }

  if (input && typeof input === "object") {
    return Object.entries(input as Record<string, unknown>).map(([key, value]) => {
      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;

        return {
          key,
          zh: typeof record.zh === "string" ? record.zh : "",
          en: typeof record.en === "string" ? record.en : "",
        };
      }

      return {
        key,
        zh: typeof value === "string" ? value : "",
        en: "",
      };
    });
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

export function LocalizationEditor({
  projectSlug,
  resources,
}: LocalizationEditorProps) {
  const [activeResourceId, setActiveResourceId] = useState<string | null>(
    resources[0]?.id ?? null,
  );
  const activeResource = useMemo(
    () => resources.find((item) => item.id === activeResourceId) ?? null,
    [activeResourceId, resources],
  );

  const [entries, setEntries] = useState<LocalizationEntry[]>(
    buildInitialEntries(resources[0]),
  );
  const [keyword, setKeyword] = useState("");
  const [importText, setImportText] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revision, setRevision] = useState<string>(
    resources[0]?.updatedAt ?? new Date().toISOString(),
  );

  const handleSnapshot = useCallback(
    (_snapshot: { revision: string }, content: LocalizationContent) => {
      const nextEntries = Array.isArray(content.entries)
        ? content.entries
        : buildInitialEntries();

      setEntries(nextEntries);
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
      content: LocalizationContent,
    ) => {
      const nextEntries = Array.isArray(content.entries)
        ? content.entries
        : buildInitialEntries();

      setEntries(nextEntries);
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
  } = useResourceCollaboration<LocalizationContent>({
    resourceId: activeResourceId,
    fallbackContent: {
      entries: buildInitialEntries(),
    },
    onSnapshot: handleSnapshot,
    onUpdated: handleUpdated,
  });

  const filteredEntries = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        if (!normalizedKeyword) {
          return true;
        }

        return [entry.key, entry.zh, entry.en]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
      });
  }, [entries, keyword]);

  function handleSelectResource(resourceId: string) {
    const resource = resources.find((item) => item.id === resourceId);
    setActiveResourceId(resourceId);
    setEntries(buildInitialEntries(resource));
    setRevision(resource?.updatedAt ?? new Date().toISOString());
    setKeyword("");
    setImportText("");
    setFeedback(null);
    setLastEventMessage(null);
  }

  function handleAddEntry() {
    setEntries((prev) => [
      ...prev,
      {
        key: `new_key_${Date.now()}`,
        zh: "",
        en: "",
      },
    ]);
  }

  function handleUpdateEntry(
    index: number,
    field: keyof LocalizationEntry,
    value: string,
  ) {
    setEntries((prev) =>
      prev.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry,
      ),
    );
  }

  function handleDeleteEntry(index: number) {
    setEntries((prev) => prev.filter((_, entryIndex) => entryIndex !== index));
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${activeResource?.slug ?? "localization"}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setFeedback("Localization JSON 已导出");
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importText);
      const nextEntries = normalizeImportedEntries(parsed);

      if (!nextEntries.length) {
        setFeedback("导入失败：未解析到有效条目");
        return;
      }

      setEntries(nextEntries);
      setFeedback(`已导入 ${nextEntries.length} 条本地化记录`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "导入失败，JSON 格式无效");
    }
  }

  async function handleSave() {
    if (!activeResource) {
      setFeedback("没有可保存的 Localization 资源");
      return;
    }

    setSaving(true);
    setFeedback(null);

    const nextContent: LocalizationContent = {
      entries,
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
        setFeedback("Localization 已保存（HTTP 回退）");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const missingCount = entries.filter((entry) => !entry.en.trim()).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
      <aside className="glass-panel rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.24em] text-white/55">
          Resource Tree
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">本地化资源</h2>

        <div className="mt-5 space-y-3">
          {resources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => handleSelectResource(resource.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                resource.id === activeResourceId
                  ? "border-emerald-300/30 bg-emerald-300/10"
                  : "border-white/10 bg-white/6 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">
                  {resource.title}
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-200">
                  Loc
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
              Editor
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {projectSlug} / Localization Editor
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddEntry}
              className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
            >
              新增条目
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-300/15"
            >
              导出 JSON
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
            条目数：{entries.length}
          </div>
          <div className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100">
            Missing EN：{missingCount}
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

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索 key / zh / en..."
            className="w-full max-w-md rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
          />
          <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs text-sky-100">
            Filtered: {filteredEntries.length}
          </span>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
                Batch Import
              </div>
              <div className="mt-2 text-sm text-slate-200/74">
                支持数组格式：
                [{`{"key":"...","zh":"...","en":"..."}`}]，
                也支持对象格式：
                {`{"focus_key":{"zh":"中文","en":"English"}}`}
              </div>
            </div>
            <button
              type="button"
              onClick={handleImport}
              className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-300/15"
            >
              导入覆盖当前条目
            </button>
          </div>

          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder='粘贴 JSON，例如 [{"key":"focus_a","zh":"工业复兴","en":"Industrial Revival"}]'
            className="mt-4 min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_96px] bg-white/8 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-300/66">
            <div>Key</div>
            <div>zh-CN</div>
            <div>en-US</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-white/8">
            {filteredEntries.map(({ entry, index }) => {
              const isMissing = !entry.en.trim();

              return (
                <div
                  key={`${entry.key}-${index}`}
                  className={`grid grid-cols-[1.4fr_1fr_1fr_96px] items-start gap-4 px-4 py-4 text-sm ${
                    isMissing ? "bg-rose-300/5" : "bg-white/4"
                  }`}
                >
                  <input
                    value={entry.key}
                    onChange={(event) =>
                      handleUpdateEntry(index, "key", event.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300/30"
                  />
                  <input
                    value={entry.zh}
                    onChange={(event) =>
                      handleUpdateEntry(index, "zh", event.target.value)
                    }
                    className="rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300/30"
                  />
                  <input
                    value={entry.en}
                    onChange={(event) =>
                      handleUpdateEntry(index, "en", event.target.value)
                    }
                    className={`rounded-xl border px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300/30 ${
                      isMissing
                        ? "border-rose-300/30 bg-rose-300/10"
                        : "border-white/10 bg-white/8"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(index)}
                    className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-300/15"
                  >
                    删除
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {feedback || lastEventMessage ? (
          <div className="mt-4 space-y-3">
            {feedback ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100/85">
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
          Overview
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">条目概览</h2>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-300/62">
              Entries
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {entries.length}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
              Ready
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {entries.length - missingCount}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-rose-200/80">
              Missing EN
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {missingCount}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-sky-100/80">
              Filtered
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {filteredEntries.length}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}