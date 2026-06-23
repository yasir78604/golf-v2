import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export const useRealtime = (table, filter = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    const fetchData = async () => {
      try {
        let query = supabase.from(table).select('*');
        if (filter) {
          query = query.eq(filter.field, filter.value);
        }
        const { data, error } = await query;
        if (error) throw error;
        setData(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription
    subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter ? `${filter.field}=eq.${filter.value}` : undefined,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [table, filter]);

  return { data, loading, error };
};