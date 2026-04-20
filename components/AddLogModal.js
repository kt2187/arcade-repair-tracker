'use client';
import { useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase';

export default function AddLogModal({ machineId, machineName, onClose }) {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSaving(true);

    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase
      .from('maintenance_logs')
      .insert([{ 
        machine_id: machineId, 
        notes: note 
      }]);

    if (error) {
      alert("Error saving note: " + error.message);
      setIsSaving(false);
    } else {
      // Success!
      setIsSaving(false);
      setNote('');
      onClose(); // Close the modal
      alert("Note saved for " + machineName + "!");
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1a1f29', border: '1px solid #22d3ee',
        padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Log Repair: {machineName}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            autoFocus
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you fix?"
            style={{
              width: '100%', minHeight: '100px', padding: '0.75rem',
              borderRadius: '8px', backgroundColor: '#0b0f14',
              color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '1rem', fontFamily: 'inherit'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              style={{
                backgroundColor: '#22d3ee', color: '#0891b2', padding: '8px 16px',
                borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}