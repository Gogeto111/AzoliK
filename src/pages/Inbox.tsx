import * as React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useEngine } from "@/lib/engine";
import {
  MessageSquare,
  CheckCircle2,
  Edit,
  Send,
  X,
  MoreVertical,
  Star,
  Flag,
  Archive,
  Trash2,
  ArrowLeft,
  Sparkles,
  Bot,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Inbox() {
  const state = useEngine();
  const prefersReduced = useReducedMotion();
  const [selectedConv, setSelectedConv] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const conversations = state.inbox.map((msg) => ({
    id: msg.id,
    customer: msg.customer,
    lastMessage: msg.text,
    time: formatTime(msg.receivedAt),
    unread: Math.floor(Math.random() * 4) + 1,
    status: "needs_reply" as const,
    suggestedReply: generateSuggestedReply(msg.text),
    messages: [
      { from: "customer" as const, text: msg.text, time: formatTime(msg.receivedAt) },
    ],
  }));

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConv) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setReplyText("");
  };

  const handleApprove = () => {
    setReplyText(conversations.find(c => c.id === selectedConv)?.suggestedReply || "");
  };

  return (
    <div>
      <PageHeader
        title="Support Inbox"
        description="Customer conversations handled by your AI Support team. Review, edit, and approve replies — you stay in control."
        badge={{ label: `${conversations.filter(c => c.status === "needs_reply").length} need reply`, tone: "emerald", dot: true }}
        actions={
          <Button size="sm" variant="ghost">
            <Filter className="h-3.5 w-3.5 mr-1" /> Filters
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Conversation List */}
        <GlassCard className="flex flex-col overflow-hidden" tilt={false}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-white">Conversations</h3>
            <Badge tone="emerald" dot>{conversations.length} active</Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 260, damping: 26 }}
              >
                <ConversationItem
                  conv={conv}
                  isSelected={selectedConv === conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                />
              </motion.div>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-ink-400">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-ink-500" />
                <p className="text-[13px]">No conversations yet</p>
                <p className="text-[11px] mt-1">Your AI Support team will handle incoming messages automatically.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Conversation Detail */}
        <GlassCard className="flex flex-col overflow-hidden" tilt={false}>
          {selectedConv ? (
            <>
              <ConversationHeader
                conv={conversations.find(c => c.id === selectedConv)!}
                onClose={() => setSelectedConv(null)}
              />
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <ConversationMessages
                  conv={conversations.find(c => c.id === selectedConv)!}
                />
              </div>
              <ConversationReply
                conv={conversations.find(c => c.id === selectedConv)!}
                replyText={replyText}
                onReplyChange={setReplyText}
                onSend={handleSend}
                onApprove={handleApprove}
                sending={sending}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="h-14 w-14 mx-auto mb-4 text-ink-500" />
                <h3 className="text-[17px] font-semibold text-white mb-1">Select a conversation</h3>
                <p className="text-ink-400">Choose a conversation from the list to view and reply.</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function ConversationItem({ conv, isSelected, onClick }: { conv: any; isSelected: boolean; onClick: () => void }) {
  const channelIcons = {
    whatsapp: <svg className="h-3.5 w-3.5" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.149-.15.297-.347.446-.52.149-.198.048-.372-.025-.52-.073-.173-.27-.58-.37-.752a1.948 1.948 0 00-.572-.347 1.5 1.5 0 00-.67-.122c-.318 0-.52.098-.72.22-.2.123-.402.32-.572.52-.173.199-.32.423-.446.67-.149.274-.198.572-.222.872-.024.298.048.548.27.822.223.273.597.768.872 1.113.273.347.547.748.72 1.164.149.418.173.787.075 1.046-.073.22-.199.52-.399.72-.223.223-.572.597-.847.846-.274.25-.675.6-.94.82-.274.223-.572.347-.92.372-.348.024-.67.024-.92.024-.247 0-.42-.025-.545-.05-.174-.049-.348-.1-.52-.15-.223-.074-.496-.223-.745-.423-.248-.198-.497-.423-.67-.672-.274-.347-.52-.67-.67-.993-.149-.323-.173-.57-.173-.77 0-.248.074-.472.223-.72.223-.372.52-.846.795-1.22.274-.372.573-.698.848-.993.274-.273.574-.52.92-.747.348-.223.67-.347.993-.372 1.27-.025 1.87.92 2.99 1.07 2.03.1.98.1 1.96 0 1.59-.099-.37-.347-.67-.62-.87-.248-.224-.548-.448-.82-.62-.273-.198-.547-.423-.77-.623-.223-.224-.373-.523-.373-.798 0-.297.123-.572.373-.822.223-.224.447-.473.62-.722.174-.248.373-.473.573-.722.199-.274.32-.498.445-.748.124-.223.198-.498.173-.722-.025-.223-.123-.447-.32-.67-.198-.223-.422-.397-.62-.572l-.57-.57c-.423-.423-.896-.747-1.345-.947-.423-.2-.846-.298-1.245-.298-.57 0-1.114.174-1.57.423-.455.224-.846.547-1.145.92-.298.372-.548.747-.72 1.145-.173.4-.223.747-.174.948.05.199.149.397.32.548.199.199.423.32.722.347.52.025.993.15 1.345.174.423.024.82.05 1.193.1.373.073.67.148.92.273.52.273.895.646 1.145 1.022.248.372.422.747.472 1.146.049.423-.024.797-.248 1.145-.223.347-.573.72-.82.992-.248.273-.572.547-.82.82-.248.298-.497.523-.697.747-.198.199-.373.397-.573.623-.199.198-.422.398-.62.597-.223.199-.447.398-.67.573-.223.198-.472.32-.72.32-.198 0-.373-.025-.573-.075-.223-.05-.447-.124-.645-.224-.199-.099-.373-.223-.573-.372zm-4.893 2.247c-1.145 0-2.073-.928-2.073-2.073 0-1.146.928-2.073 2.073-2.073 1.146 0 2.073.927 2.073 2.073 0 1.145-.927 2.073-2.073 2.073zm-.62-4.82c-.62 0-1.123.503-1.123 1.123 0 .62.503 1.123 1.123 1.123.62 0 1.123-.503 1.123-1.123 0-.62-.503-1.123-1.123-1.123z"/></svg>,
    email: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    instagram: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM17 3.5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>,
    sms: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-all",
        isSelected
          ? "bg-white/[0.04] border-l-2 border-brand-400"
          : "hover:bg-white/[0.02]"
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={conv.customer.name} tone="cyan" size="md" status="online" />
        {conv.unread > 0 && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-ink-950">
            {conv.unread > 9 ? "9+" : conv.unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white truncate">{conv.customer.name}</span>
{channelIcons[conv.customer.channel as keyof typeof channelIcons]}
          </div>
          <span className="text-[10px] text-ink-500 whitespace-nowrap">{conv.time}</span>
        </div>
        <p className="mt-1 text-[12px] text-ink-400 truncate">{conv.lastMessage}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone={convStatusTone(conv.status)} size="xs">
            {convStatusLabel(conv.status)}
          </Badge>
          {conv.status === "needs_reply" && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-300">
              <Sparkles className="h-2.5 w-2.5" /> AI drafted reply
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ConversationHeader({ conv, onClose }: { conv: any; onClose: () => void }) {
  const channelIcons = {
    whatsapp: <span className="text-[11px] font-medium text-emerald-400">WhatsApp</span>,
    email: <span className="text-[11px] font-medium text-rose-400">Email</span>,
    instagram: <span className="text-[11px] font-medium text-violet-400">Instagram</span>,
    sms: <span className="text-[11px] font-medium text-cyan-400">SMS</span>,
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/10">
      <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Avatar name={conv.customer.name} tone="cyan" size="lg" status="online" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-white truncate">{conv.customer.name}</h3>
          {channelIcons[conv.customer.channel as keyof typeof channelIcons]}
          <Badge tone={convStatusTone(conv.status)} size="sm">{convStatusLabel(conv.status)}</Badge>
        </div>
        <p className="text-[12px] text-ink-400">{conv.customer.phone || conv.customer.channel}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" title="Star"><Star className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="sm" title="Flag"><Flag className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="sm" title="Archive"><Archive className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="sm" title="More"><MoreVertical className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

function ConversationMessages({ conv }: { conv: any }) {
  return (
    <div className="space-y-4">
      {conv.messages.map((msg: any, i: number) => (
        <motion.div
          key={`${conv.id}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <MessageBubble msg={msg} isOwn={msg.from === "owner" || msg.from === "ai"} />
        </motion.div>
      ))}
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: any; isOwn: boolean }) {
  const isAI = msg.from === "ai";
  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
      {!isOwn && !isAI && <Avatar name={msg.from === "customer" ? "Customer" : "You"} tone="cyan" size="sm" />}
      <div className={cn("max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-[13px] leading-relaxed",
            isAI
              ? "bg-brand-500/15 border border-brand-400/20 text-brand-100"
              : isOwn
              ? "bg-brand-500 text-white rounded-br-md"
              : "bg-white/[0.05] border border-white/10 text-ink-100 rounded-bl-md"
          )}
        >
          {isAI && (
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-brand-300">
              <Bot className="h-3 w-3" />
              <span>AI suggested</span>
            </div>
          )}
          {msg.text}
        </div>
        <span className={cn("mt-1 text-[10px] px-1", isOwn ? "text-brand-200" : "text-ink-500")}>
          {msg.time}
        </span>
      </div>
      {isOwn && <Avatar name="You" tone="brand" size="sm" />}
      {isAI && <Avatar name="AI" tone="brand" size="sm" />}
    </div>
  );
}

function ConversationReply({ conv, replyText, onReplyChange, onSend, onApprove, sending }: any) {
  const hasDraft = replyText.trim().length > 0;
  const hasSuggestion = conv.suggestedReply && !hasDraft;

  return (
    <div className="border-t border-white/10 p-4 space-y-3">
      {hasSuggestion && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[12px] font-medium text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI suggested reply</span>
            </div>
            <Button size="xs" variant="secondary" onClick={onApprove}>
              <Check className="h-3 w-3 mr-1" /> Use this
            </Button>
          </div>
          <p className="text-[12px] text-ink-300">{conv.suggestedReply}</p>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={hasSuggestion ? "Edit the AI reply or write your own…" : "Type your reply…"}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-ink-900/50 px-3.5 py-2.5 text-[13px] text-white placeholder:text-ink-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none"
          />
        </div>
        <Button
          size="lg"
          variant="primary"
          onClick={onSend}
          disabled={!replyText.trim() || sending}
          className="h-10 self-end"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" /> Send
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-500">
        <span>Owner stays in control — AI drafts, you approve</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="xs" className="h-6 px-2">
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button variant="ghost" size="xs" className="h-6 px-2">
            <AlertCircle className="h-3 w-3 mr-1" /> Escalate
          </Button>
        </div>
      </div>
    </div>
  );
}

function generateSuggestedReply(customerText: string): string {
  const lower = customerText.toLowerCase();
  if (lower.includes("cake") || lower.includes("chocolate")) {
    return "Yes, we have fresh chocolate cake (500g) ready for pickup! It's ₹549. Would you like me to reserve one for you?";
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("kitni") || lower.includes("fees")) {
    return "Our monthly membership is ₹2,499, quarterly is ₹5,999. We also have a 1-day trial for ₹199. Would you like to book a trial session?";
  }
  if (lower.includes("appointment") || lower.includes("book") || lower.includes("slot") || lower.includes("checkup")) {
    return "We have openings tomorrow at 11:00 AM, 3:30 PM, and 5:00 PM. Which works best for you? I'll send a confirmation with a deposit link (20%).";
  }
  if (lower.includes("order") || lower.includes("delivery") || lower.includes("pickup")) {
    return "I can help with that! What would you like to order? I'll check availability and send a payment link.";
  }
  return "Thanks for reaching out! Let me check on that for you and get right back.";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function convStatusLabel(status: string): string {
  switch (status) {
    case "needs_reply": return "Needs Reply";
    case "waiting_approval": return "Waiting Approval";
    case "completed": return "Completed";
    default: return status;
  }
}

function convStatusTone(status: string): "emerald" | "amber" | "muted" | "brand" | "rose" | "violet" | "cyan" {
  switch (status) {
    case "needs_reply": return "emerald";
    case "waiting_approval": return "amber";
    case "completed": return "muted";
    default: return "brand";
  }
}

function Filter({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}