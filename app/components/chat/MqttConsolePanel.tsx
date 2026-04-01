import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useChatEvents } from '~/hooks/useChatEvents';
import { useMqtt } from '~/providers/MqttContext';
import type { ProcessEvent } from '~/types';
import { cn } from '~/utils/cn';
import { List, BarChart3, Trash2, X } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */

interface LogEntry {
  id: number;
  receivedAt: number;
  resourceName: string;
  resourceId: string;
  jobName: string;
  jobId: number;
  jobStatus: string;
  durationMs: number | null;
  resourceAttributes?: any;
}

interface TimelineEntry {
  id: number;
  resourceName: string;
  jobName: string;
  jobId: number;
  activeAt: number;
  completedAt: number | null;
  jobStatus: 'active' | 'completed' | 'failed' | 'retrying';
}

/* ─── Constants ─────────────────────────────────────────────────── */

const MAX_LOG_ENTRIES = 200;

const statusColors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  retrying: 'bg-yellow-100 text-yellow-700',
};

const barColors: Record<string, { bg: string; border: string; text: string }> = {
  Message: { bg: 'bg-blue-400/80', border: 'border-blue-500', text: 'text-blue-900' },
  ChatCompletionJob: { bg: 'bg-green-400/80', border: 'border-green-500', text: 'text-green-900' },
  TtsJob: { bg: 'bg-orange-400/80', border: 'border-orange-500', text: 'text-orange-900' },
  SttJob: { bg: 'bg-purple-400/80', border: 'border-purple-500', text: 'text-purple-900' },
  EmbeddingJob: { bg: 'bg-red-400/80', border: 'border-red-500', text: 'text-red-900' },
  PaymentJob: { bg: 'bg-pink-400/80', border: 'border-pink-500', text: 'text-pink-900' },
  Scenario: { bg: 'bg-teal-400/80', border: 'border-teal-500', text: 'text-teal-900' },
  Chat: { bg: 'bg-cyan-400/80', border: 'border-cyan-500', text: 'text-cyan-900' },
};

const defaultBarColor = { bg: 'bg-gray-400/80', border: 'border-gray-500', text: 'text-gray-900' };

/* ─── Helpers ───────────────────────────────────────────────────── */

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
};

/* ─── Timeline View ─────────────────────────────────────────────── */

const BAR_HEIGHT = 22;
const BAR_GAP = 3;
const LABEL_WIDTH = 140;

function TimelineView({ entries, now }: { entries: TimelineEntry[]; now: number }) {
  const origin = entries.length > 0 ? entries[0].activeAt : now;
  const totalMs = Math.max(now - origin + 500, 1000); // min 1s span
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const toPercent = (ms: number) => (ms / totalMs) * 100;

  // Time axis tick count (1s intervals, max 20 ticks)
  const tickCount = Math.min(Math.ceil(totalMs / 1000) + 1, 20);

  return (
    <div ref={scrollRef} className='flex-1 overflow-y-auto scrollbar-medium'>
      {/* time axis */}
      <div className='sticky top-0 bg-neutral-05 z-10 flex'>
        <div className='shrink-0 px-2 py-1 text-[10px] font-medium text-neutral-01 border-r border-neutral-04' style={{ width: LABEL_WIDTH }}>
          Job
        </div>
        <div className='relative flex-1 h-6 border-b border-neutral-04'>
          {Array.from({ length: tickCount }, (_, i) => (
            <div
              key={i}
              className='absolute top-0 h-full border-l border-neutral-04/40 text-[9px] text-neutral-01 pl-0.5'
              style={{ left: `${toPercent(i * 1000)}%` }}
            >
              {i}s
            </div>
          ))}
        </div>
      </div>

      {/* bars */}
      <div className='relative'>
        {entries.map((entry) => {
          const endTime = entry.completedAt ?? now;
          const durationMs = endTime - entry.activeAt;
          const leftPct = toPercent(entry.activeAt - origin);
          const widthPct = Math.max(toPercent(durationMs), 0.5);
          const colors = barColors[entry.resourceName] || defaultBarColor;
          const isActive = !entry.completedAt;
          const isFailed = entry.jobStatus === 'failed';

          return (
            <div key={entry.id} className='flex' style={{ height: BAR_HEIGHT + BAR_GAP }}>
              {/* label */}
              <div
                className='shrink-0 px-2 flex items-center text-[10px] font-mono truncate border-r border-neutral-04/30'
                style={{ width: LABEL_WIDTH }}
              >
                <span className={cn('truncate', colors.text)}>{entry.resourceName}</span>
                <span className='text-neutral-01 mx-0.5'>.</span>
                <span className='text-neutral-01 truncate'>{entry.jobName}</span>
              </div>
              {/* bar area */}
              <div className='relative flex-1 flex items-center'>
                <div
                  className={cn(
                    'absolute h-4 rounded-sm border flex items-center px-1',
                    isFailed ? 'bg-red-400/80 border-red-500' : colors.bg,
                    isFailed ? '' : colors.border,
                    isActive && 'animate-pulse'
                  )}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  title={`${entry.resourceName}.${entry.jobName} — ${formatDuration(durationMs)} (${entry.jobStatus})`}
                >
                  <span className='text-[9px] font-medium text-white truncate drop-shadow-sm'>{formatDuration(durationMs)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Log View ──────────────────────────────────────────────────── */

function LogView({ entries }: { entries: LogEntry[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries]);

  const handleRowClick = (entry: LogEntry) => {
    if (!entry.resourceAttributes || Object.keys(entry.resourceAttributes).length === 0) return;
    setExpandedId((prev) => (prev === entry.id ? null : entry.id));
  };

  return (
    <div ref={scrollRef} className='flex-1 overflow-auto scrollbar-medium font-mono text-xs'>
      <table className='w-full'>
        <thead className='sticky top-0 bg-neutral-05'>
          <tr className='text-left text-neutral-01'>
            <th className='px-2 py-1 font-medium'>Time</th>
            <th className='px-2 py-1 font-medium'>Resource</th>
            <th className='px-2 py-1 font-medium'>Job</th>
            <th className='px-2 py-1 font-medium'>ID</th>
            <th className='px-2 py-1 font-medium'>Status</th>
            <th className='px-2 py-1 font-medium text-right'>Duration</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} className='px-2 py-4 text-center text-neutral-01'>
                Waiting for events...
              </td>
            </tr>
          ) : (
            entries.map((entry) => {
              const hasAttributes = entry.resourceAttributes && Object.keys(entry.resourceAttributes).length > 0;
              const isExpanded = expandedId === entry.id;
              return (
                <Fragment key={entry.id}>
                  <tr
                    className={cn(
                      'border-b border-neutral-04/50 hover:bg-neutral-05/50',
                      hasAttributes && 'cursor-pointer',
                      isExpanded && 'bg-neutral-05/50',
                    )}
                    onClick={() => handleRowClick(entry)}
                  >
                    <td className='px-2 py-1 text-neutral-01 whitespace-nowrap'>{formatTime(entry.receivedAt)}</td>
                    <td className='px-2 py-1 whitespace-nowrap'>{entry.resourceName}</td>
                    <td className='px-2 py-1 whitespace-nowrap'>{entry.jobName}</td>
                    <td className='px-2 py-1 text-neutral-01 whitespace-nowrap'>{entry.jobId}</td>
                    <td className='px-2 py-1'>
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', statusColors[entry.jobStatus] || 'bg-gray-100 text-gray-700')}>
                        {entry.jobStatus}
                      </span>
                    </td>
                    <td className='px-2 py-1 text-right whitespace-nowrap'>
                      {entry.durationMs !== null ? (
                        <span className='text-green-700 font-medium'>{formatDuration(entry.durationMs)}</span>
                      ) : (
                        <span className='text-neutral-01'>-</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && hasAttributes && (
                    <tr className='border-b border-neutral-04/50'>
                      <td colSpan={6} className='px-3 py-2 bg-neutral-900 text-neutral-100'>
                        <div className='text-[10px] font-semibold text-neutral-400 mb-1'>Resource Attributes</div>
                        <pre className='whitespace-pre-wrap break-all max-h-48 overflow-auto scrollbar-medium text-[11px]'>
                          {JSON.stringify(entry.resourceAttributes, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Panel ────────────────────────────────────────────────── */

interface MqttConsolePanelProps {
  chatId: string;
  onClose: () => void;
}

const EVENT_TYPES = ['created', 'updated', 'deleted'] as const;

const eventTypeColors: Record<string, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
};

const MqttConsolePanel: React.FC<MqttConsolePanelProps> = ({ chatId, onClose }) => {
  const { connectionState, getSubscriptions } = useMqtt();
  const [view, setView] = useState<'log' | 'timeline'>('timeline');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [now, setNow] = useState(Date.now());
  const activeJobsRef = useRef<Map<number, number>>(new Map());
  const idCounter = useRef(0);
  const [hiddenJobNames, setHiddenJobNames] = useState<Set<string>>(new Set(['updated', 'deleted']));
  const [autoClear, setAutoClear] = useState(true);

  const toggleJobName = (name: string) => {
    setHiddenJobNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Tick "now" for animating active bars
  useEffect(() => {
    if (view !== 'timeline') return;
    const hasActive = timelineEntries.some((e) => !e.completedAt);
    if (!hasActive) return;
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, [view, timelineEntries]);

  const autoClearRef = useRef(autoClear);
  autoClearRef.current = autoClear;

  const onProcessEvent = useCallback((event: ProcessEvent) => {
    // Auto-clear on new user message
    if (autoClearRef.current && event.resourceName === 'Message' && event.jobName === 'created' && event.jobStatus === 'active' && event.resourceAttributes?.role === 'USER') {
      setLogEntries([]);
      setTimelineEntries([]);
      activeJobsRef.current.clear();
      idCounter.current = 0;
    }

    const ts = Date.now();
    const id = ++idCounter.current;

    // --- Log view ---
    let durationMs: number | null = null;
    if (event.jobStatus === 'active') {
      activeJobsRef.current.set(event.jobId, ts);
    } else if (event.jobStatus === 'completed' || event.jobStatus === 'failed') {
      const activeTime = activeJobsRef.current.get(event.jobId);
      if (activeTime) {
        durationMs = ts - activeTime;
        activeJobsRef.current.delete(event.jobId);
      }
    }

    setLogEntries((prev) => {
      const next = [
        {
          id,
          receivedAt: ts,
          resourceName: event.resourceName,
          resourceId: event.resourceId,
          jobName: event.jobName,
          jobId: event.jobId,
          jobStatus: event.jobStatus,
          durationMs,
          resourceAttributes: event.resourceAttributes,
        },
        ...prev,
      ];
      return next.length > MAX_LOG_ENTRIES ? next.slice(0, MAX_LOG_ENTRIES) : next;
    });

    // --- Timeline view ---
    if (event.jobStatus === 'active') {
      setTimelineEntries((prev) => [
        ...prev,
        {
          id,
          resourceName: event.resourceName,
          jobName: event.jobName,
          jobId: event.jobId,
          activeAt: ts,
          completedAt: null,
          jobStatus: 'active',
        },
      ]);
    } else if (event.jobStatus === 'completed' || event.jobStatus === 'failed') {
      setTimelineEntries((prev) =>
        prev.map((e) => (e.jobId === event.jobId && !e.completedAt ? { ...e, completedAt: ts, jobStatus: event.jobStatus as TimelineEntry['jobStatus'] } : e))
      );
    }

    setNow(ts);
  }, []);

  const { processEventsTopic } = useChatEvents(chatId, { onProcessEvent, enabled: true });


  return (
    <div className='border-t border-neutral-04 bg-white flex flex-col h-[280px] shrink-0'>
      {/* header */}
      <div className='flex items-center justify-between px-3 py-1.5 border-b border-neutral-04 bg-neutral-05'>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full shrink-0',
              connectionState.isConnected ? 'bg-green-500' : connectionState.isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-500',
            )}
            title={
              connectionState.isConnected
                ? `Connected (${getSubscriptions().length} subs)`
                : connectionState.isConnecting
                  ? `Reconnecting (attempt ${connectionState.reconnectAttempts})`
                  : connectionState.error || 'Disconnected'
            }
          />
          <span className='text-body-sm font-semibold text-neutral-01'>MQTT Console</span>
          <span className='text-[10px] font-mono text-neutral-01'>{processEventsTopic}</span>
          <div className='flex items-center bg-white rounded border border-neutral-04 overflow-hidden'>
            <button
              type='button'
              onClick={() => setView('log')}
              className={cn('px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 transition-colors', view === 'log' ? 'bg-neutral-05 text-base-black' : 'text-neutral-01')}
              title='Log view'
            >
              <List size={12} /> Log
            </button>
            <button
              type='button'
              onClick={() => setView('timeline')}
              className={cn('px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 transition-colors', view === 'timeline' ? 'bg-neutral-05 text-base-black' : 'text-neutral-01')}
              title='Timeline view'
            >
              <BarChart3 size={12} /> Timeline
            </button>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {/* Event type filters */}
          <div className='flex items-center gap-0.5'>
            {EVENT_TYPES.map((type) => {
              const isVisible = !hiddenJobNames.has(type);
              return (
                <button
                  key={type}
                  type='button'
                  onClick={() => toggleJobName(type)}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors',
                    isVisible ? eventTypeColors[type] : 'bg-neutral-04/50 text-neutral-01 line-through',
                  )}
                  title={`${isVisible ? 'Hide' : 'Show'} ${type} events`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <div className='w-px h-4 bg-neutral-04' />
          <button
            type='button'
            onClick={() => setAutoClear((prev) => !prev)}
            className={cn('p-1 rounded transition-colors', autoClear ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200 text-neutral-01')}
            title={autoClear ? 'Auto-clear on new message (on)' : 'Auto-clear on new message (off)'}
          >
            <Trash2 size={14} />
          </button>
          <button type='button' onClick={onClose} className='p-1 hover:bg-gray-200 rounded transition-colors' title='Close'>
            <X size={14} className='text-neutral-01' />
          </button>
        </div>
      </div>

      {/* body */}
      {view === 'log' ? (
        <LogView entries={logEntries.filter((e) => !hiddenJobNames.has(e.jobName))} />
      ) : (
        <TimelineView entries={timelineEntries.filter((e) => !hiddenJobNames.has(e.jobName))} now={now} />
      )}
    </div>
  );
};

export default MqttConsolePanel;
