'use client';
import { useEffect, useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase';

export default function HistoryDrawer({ machine, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const supabase = getBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('machine_id', machine.id)
        .order('created_at', { ascending: false }); // Newest repairs first!

      if (!error) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, [machine.id]);

  return (
    <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
        backgroundColor: '#111827', borderLeft: '1px solid #22d3ee', zIndex: 10000,
        padding: '0', // Changed padding to 0 here to handle the sticky header better
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', overflowY: 'auto'
      }}>
        {/* --- STICKY HEADER --- */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          backgroundColor: '#111827', 
          padding: '2rem', // Move the padding here
          paddingBottom: '1rem',
          zIndex: 10,
          borderBottom: '1px solid rgba(34, 211, 238, 0.2)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>{machine.name} History</h2>
            <button onClick={onClose} style={{ color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
          </div>
        </div>
  
        {/* --- SCROLLABLE CONTENT --- */}
        <div style={{ padding: '0 2rem 2rem 2rem' }}> 
          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading repairs...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>No repair history yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {logs.map((log) => (
                <div key={log.id} style={{ borderLeft: '2px solid #22d3ee', paddingLeft: '1rem' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ color: '#f8fafc', fontSize: '0.9rem', lineHeight: '1.4' }}>{log.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}