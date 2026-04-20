'use client';
import { useState } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabase';

export default function AddLogModal({ machine, onClose }) {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
  
    // We extract the name and ID from the 'machine' object here
    const machineId = machine?.id;
    const displayName = machine?.name || "Machine";
    const pendingStatus = machine?.pendingStatus;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!note.trim()) return;
        setIsSaving(true);
    
        const supabase = getBrowserSupabaseClient();
    
        // 1. Save the Log
        const { error: logError } = await supabase
          .from('maintenance_logs')
          .insert([{ machine_id: machineId, notes: note }]);
    
        if (logError) {
          alert("Error saving log: " + logError.message);
          setIsSaving(false);
          return;
        }
    
        // 2. Update the Status (only if we came from the status menu)
        if (pendingStatus) {
          await supabase
            .from('machines')
            .update({ status: pendingStatus })
            .eq('id', machineId);
        }
    
        alert(`Note saved for ${displayName}!`); // This fixes the "undefined"
        setIsSaving(false);
        onClose();
        window.location.reload(); 
      }
      console.log("Modal received this machine:", machine);
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
<h2>Log Note for {displayName}</h2>        <form onSubmit={handleSubmit}>
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