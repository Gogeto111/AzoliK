import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Table,
  HelpCircle,
  Image,
  Search,
  Trash2,
  Download,
  Eye,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  FolderOpen,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type KnowledgeItem = {
  id: string;
  name: string;
  type: "pdf" | "excel" | "faq" | "catalog" | "price-list" | "policy" | "invoice" | "other";
  size: string;
  uploadedAt: number;
  status: "processing" | "ready" | "error";
  chunks: number;
  description?: string;
};

const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: "1", name: "Product Catalog - Summer 2024", type: "catalog", size: "2.4 MB", uploadedAt: Date.now() - 86400000 * 2, status: "ready", chunks: 47, description: "Complete product listings with prices, descriptions, and SKUs" },
  { id: "2", name: "Price List - All Items", type: "price-list", size: "512 KB", uploadedAt: Date.now() - 86400000 * 5, status: "ready", chunks: 23, description: "Current pricing for all products and services" },
  { id: "3", name: "FAQs - Customer Support", type: "faq", size: "128 KB", uploadedAt: Date.now() - 86400000 * 10, status: "ready", chunks: 89, description: "156 frequently asked questions with approved answers" },
  { id: "4", name: "Return & Refund Policy", type: "policy", size: "64 KB", uploadedAt: Date.now() - 86400000 * 30, status: "ready", chunks: 12, description: "Official return, refund, and exchange policies" },
  { id: "5", name: "Vendor Invoices - Q3 2024", type: "invoice", size: "4.2 MB", uploadedAt: Date.now() - 86400000 * 1, status: "processing", chunks: 0, description: "Batch upload of 23 vendor invoices for reconciliation" },
  { id: "6", name: "Menu & Dietary Info", type: "pdf", size: "1.8 MB", uploadedAt: Date.now() - 86400000 * 60, status: "ready", chunks: 34, description: "Complete menu with allergens and nutritional info" },
];

const FILE_TYPES = [
  { id: "pdf", label: "PDF Documents", icon: FileText, color: "rose", accept: ".pdf", description: "Policies, contracts, manuals, menus" },
  { id: "excel", label: "Excel / CSV", icon: Table, color: "emerald", accept: ".xlsx,.xls,.csv", description: "Price lists, inventory, customer data" },
  { id: "faq", label: "FAQs / Q&A", icon: HelpCircle, color: "cyan", accept: ".json,.txt,.csv", description: "Question-answer pairs for support" },
  { id: "catalog", label: "Product Catalog", icon: FolderOpen, color: "violet", accept: ".pdf,.xlsx,.json", description: "Products with images, specs, pricing" },
  { id: "price-list", label: "Price Lists", icon: FileSpreadsheet, color: "amber", accept: ".xlsx,.csv,.pdf", description: "Current pricing for all items" },
  { id: "policy", label: "Policies", icon: FileType, color: "brand", accept: ".pdf,.txt,.docx", description: "Returns, shipping, terms, privacy" },
  { id: "invoice", label: "Invoices / Bills", icon: FileText, color: "rose", accept: ".pdf,.jpg,.png", description: "Vendor bills, expense receipts" },
  { id: "other", label: "Other Files", icon: Image, color: "muted", accept: "*/*", description: "Any other business documents" },
];

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText,
  excel: Table,
  faq: HelpCircle,
  catalog: FolderOpen,
  "price-list": FileSpreadsheet,
  policy: FileType,
  invoice: FileText,
  other: Image,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "rose",
  excel: "emerald",
  faq: "cyan",
  catalog: "violet",
  "price-list": "amber",
  policy: "brand",
  invoice: "rose",
  other: "muted",
};

export default function Knowledge() {
  const [items, setItems] = React.useState<KnowledgeItem[]>(MOCK_KNOWLEDGE);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [filter, setFilter] = React.useState<"all" | string>("all");
  const [search, setSearch] = React.useState("");

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    ready: items.filter((i) => i.status === "ready").length,
    processing: items.filter((i) => i.status === "processing").length,
    error: items.filter((i) => i.status === "error").length,
    totalChunks: items.reduce((sum, i) => sum + i.chunks, 0),
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => uploadFile(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const uploadFile = async (file: File) => {
    const type = detectFileType(file);
    const newItem: KnowledgeItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      type,
      size: formatSize(file.size),
      uploadedAt: Date.now(),
      status: "processing",
      chunks: 0,
    };
    setItems((prev) => [newItem, ...prev]);
    setUploading(newItem.id);

    // Simulate processing
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));
    const chunks = Math.floor(Math.random() * 100) + 10;
    setItems((prev) =>
      prev.map((i) =>
        i.id === newItem.id ? { ...i, status: "ready", chunks } : i
      )
    );
    setUploading(null);
  };

  const detectFileType = (file: File): KnowledgeItem["type"] => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      if (name.includes("price") || name.includes("pricing")) return "price-list";
      if (name.includes("catalog") || name.includes("menu")) return "catalog";
      if (name.includes("policy") || name.includes("terms")) return "policy";
      if (name.includes("invoice") || name.includes("bill")) return "invoice";
      return "pdf";
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      if (name.includes("price")) return "price-list";
      if (name.includes("catalog") || name.includes("product")) return "catalog";
      if (name.includes("faq") || name.includes("qa")) return "faq";
      return "excel";
    }
    if (name.includes("faq") || name.includes("qa")) return "faq";
    return "other";
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Upload documents, FAQs, price lists, and catalogs. Your AI workforce reads and uses this knowledge automatically."
        badge={{ label: `${stats.ready} ready - ${stats.processing} processing`, tone: "emerald", dot: true }}
        actions={
          <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Upload Files
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Documents" value={stats.total} icon={FileText} color="brand" />
        <StatCard label="Ready to Use" value={stats.ready} icon={CheckCircle2} color="emerald" />
        <StatCard label="Processing" value={stats.processing} icon={Loader2} color="amber" />
        <StatCard label="Errors" value={stats.error} icon={XCircle} color="rose" />
        <StatCard label="Knowledge Chunks" value={stats.totalChunks} icon={Search} color="violet" />
      </div>

      {/* Upload Zone */}
      <GlassCard
        className={cn("relative p-8 text-center transition-all", dragActive && "border-brand-400/50 bg-brand-500/5")}
        tilt={false}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv,.txt,.json,.docx,.jpg,.png"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(uploadFile);
            if (e.target) e.target.value = "";
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Upload className={cn("h-14 w-14 mx-auto mb-4 text-ink-500 transition-colors", dragActive && "text-brand-400")} />
        <h3 className="text-[18px] font-semibold text-white mb-1">
          {dragActive ? "Drop files here" : "Drag & drop files, or click to browse"}
        </h3>
        <p className="text-[13px] text-ink-400 max-w-md mx-auto">
          PDF, Excel, CSV, JSON, TXT, DOCX, JPG, PNG - Max 50MB per file
          {uploading && <span className="ml-2 text-amber-300"> - Processing {items.find(i => i.id === uploading)?.name}...</span>}
        </p>

        {/* File type hints */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {FILE_TYPES.map((t) => {
            const colorMap: Record<string, string> = {
              rose: "#fb7185",
              emerald: "#34d399",
              cyan: "#22d3ee",
              violet: "#a78bfa",
              amber: "#fbbf24",
              brand: "#8faeff",
              muted: "#6b7280",
            };
            return (
              <button
                key={t.id}
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] text-ink-300 hover:border-white/20 hover:text-white hover:bg-white/[0.04] transition-all"
                style={{ color: colorMap[t.color] }}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Filter & Search */}
      <GlassCard className="p-4" tilt={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge base..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-ink-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["all", "pdf", "excel", "faq", "catalog", "price-list", "policy", "invoice"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
                  filter === f
                    ? "bg-white/[0.08] text-white"
                    : "text-ink-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {f === "all" ? "All" : FILE_TYPES.find(t => t.id === f)?.label || f}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Knowledge Items */}
      <GlassCard className="p-0 overflow-hidden" tilt={false}>
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="h-16 w-16 text-ink-500 mx-auto mb-4" />
            <h3 className="text-[16px] font-medium text-white mb-1">No documents found</h3>
            <p className="text-ink-400">Upload your first document to build the knowledge base.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredItems.map((item, i) => {
              const Icon = TYPE_ICONS[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset",
                      item.type === "pdf" && "from-rose-500/30 to-rose-700/10 text-rose-200",
                      item.type === "excel" && "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
                      item.type === "faq" && "from-cyan-500/30 to-cyan-700/10 text-cyan-200",
                      item.type === "catalog" && "from-violet-500/30 to-violet-700/10 text-violet-200",
                      item.type === "price-list" && "from-amber-500/30 to-amber-700/10 text-amber-200",
                      item.type === "policy" && "from-brand-500/30 to-brand-700/10 text-brand-200",
                      item.type === "invoice" && "from-rose-500/30 to-rose-700/10 text-rose-200",
                      item.type === "other" && "from-ink-600/30 to-ink-800/10 text-ink-300",
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-medium text-white truncate max-w-xs">{item.name}</h4>
                      <p className="text-[11px] text-ink-400">{item.size} - {formatTimeAgo(item.uploadedAt)}</p>
                      {item.description && <p className="text-[11px] text-ink-500 mt-0.5 line-clamp-1">{item.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={item.status === "ready" ? "emerald" : item.status === "processing" ? "amber" : "rose"} dot={item.status === "processing"}>
                      {item.status === "ready" ? `${item.chunks} chunks` : item.status === "processing" ? "Processing..." : "Error"}
                    </Badge>
                    {item.status === "ready" && (
                      <Badge tone="brand" size="xs">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Ready for AI
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="xs" className="h-6 w-6 p-0" title="Preview"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-6 w-6 p-0" title="Edit"><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-6 w-6 p-0" title="Download"><Download className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="xs" className="h-6 w-6 p-0 text-rose-300 hover:text-rose-100" title="Delete" onClick={() => deleteItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* How it works */}
      <GlassCard className="p-6" tilt={false}>
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <Search className="h-4 w-4 text-brand-300" />
          How the Knowledge Base Works
        </h3>
        <p className="mt-1 text-[13px] text-ink-400">
          Upload once, and every department automatically uses this knowledge. No manual syncing needed.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <HowItWorksStep number={1} title="Upload" desc="Drop PDFs, Excel files, FAQs, or policies. We extract and chunk the content." icon={Upload} />
          <HowItWorksStep number={2} title="Process" desc="Content is split into searchable chunks, embedded, and indexed for semantic search." icon={Loader2} />
          <HowItWorksStep number={3} title="Auto-Use" desc="When any department needs info - pricing, policies, specs - they query the knowledge base instantly." icon={CheckCircle2} />
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    brand: "from-brand-500/30 to-brand-700/10 text-brand-200",
    emerald: "from-emerald-500/30 to-emerald-700/10 text-emerald-200",
    amber: "from-amber-500/30 to-amber-700/10 text-amber-200",
    rose: "from-rose-500/30 to-rose-700/10 text-rose-200",
    violet: "from-violet-500/30 to-violet-700/10 text-violet-200",
  };

  return (
    <GlassCard className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[12px] text-ink-400">{label}</div>
        <div className="mt-0.5 text-[22px] font-semibold text-white">{value.toLocaleString()}</div>
      </div>
    </GlassCard>
  );
}

function HowItWorksStep({ number, title, desc, icon: Icon }: { number: number; title: string; desc: string; icon: any }) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/10 ring-1 ring-inset ring-white/10">
        <Icon className="h-6 w-6 text-brand-300" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{number}</span>
      </div>
      <h4 className="mt-3 text-[13px] font-semibold text-white">{title}</h4>
      <p className="mt-1 text-[11.5px] text-ink-400">{desc}</p>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}