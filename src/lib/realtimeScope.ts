// Scoped realtime subscriptions with throttle + React Query invalidation.
// Replaces global `event:'*'` channels that broadcast every write to every
// admin — at scale that floods websockets and forces full refetches.
//
// Use:
//   useScopedRealtime({
//     table: 'problems',
//     filter: constituency ? `constituency=eq.${constituency}` : undefined,
//     invalidateKeys: [['problems', constituency]],
//   });

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throttle } from '@/lib/throttle';

interface Opts {
  table: string;
  /** Postgres-changes filter, e.g. `constituency=eq.Madurai-North` */
  filter?: string;
  /** React Query keys to invalidate when an event arrives */
  invalidateKeys?: readonly unknown[][];
  /** Optional extra callback (also throttled) */
  onChange?: () => void;
  /** Throttle window in ms (default 1000) */
  throttleMs?: number;
  /** Channel name override (defaults to table+filter) */
  channelName?: string;
}

export function useScopedRealtime({
  table,
  filter,
  invalidateKeys = [],
  onChange,
  throttleMs = 1000,
  channelName,
}: Opts) {
  const qc = useQueryClient();
  useEffect(() => {
    const handler = throttle(() => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k as any }));
      onChange?.();
    }, throttleMs);

    const ch = supabase
      .channel(channelName ?? `${table}:${filter ?? 'all'}`)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
        handler,
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, channelName, throttleMs, JSON.stringify(invalidateKeys)]);
}
