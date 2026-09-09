import React, { useState } from 'react';
import { Lock, KeyRound, Download, Upload, ShieldCheck, X } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';

export const PrivacyLockModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, lockDiary, exportBackup, importBackup } = useDiary();
  const [newPasscode, setNewPasscode] = useState('');
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ passcode: newPasscode.trim() || undefined });
    setMsg({ type: 'success', text: newPasscode.trim() ? 'Passcode successfully set.' : 'Passcode removed.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'success', text: 'Diary backup file downloaded safely.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = importBackup(importText.trim());
    if (success) {
      setMsg({ type: 'success', text: 'Diary memories restored successfully!' });
      setImportText('');
    } else {
      setMsg({ type: 'error', text: 'Failed to restore: Invalid backup file format.' });
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl glass-panel shadow-journal p-6 sm:p-8 z-10 border border-theme-border text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border-light mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-accent/15 border border-theme-accent/30 text-theme-highlight">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-theme-accent">
                Sanctuary Security
              </span>
              <h2 className="text-xl font-serif font-bold text-theme-text mt-0.5">
                Privacy & Data
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-theme-muted hover:text-theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-serif ${
              msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="space-y-6 text-xs font-serif text-theme-muted">
          {/* Lock Now Button */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/25 border border-theme-border-light">
            <div>
              <span className="font-semibold text-sm text-theme-text block mb-0.5">
                Instant Sanctuary Lock
              </span>
              <p className="text-[11px] leading-relaxed">
                Immediately lock the screen to protect your private journal.
              </p>
            </div>
            <button
              onClick={() => {
                lockDiary();
                onClose();
              }}
              className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Now</span>
            </button>
          </div>

          {/* Set / Change Passcode */}
          <form onSubmit={handleSetPasscode} className="p-4 rounded-2xl bg-black/25 border border-theme-border-light space-y-3">
            <div className="flex items-center gap-2 text-theme-text font-semibold text-sm">
              <KeyRound className="w-4 h-4 text-theme-accent" />
              <span>{settings.passcode ? 'Change Passcode' : 'Set Private PIN Passcode'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {settings.passcode
                ? 'Your diary is protected with a passcode. Leave blank and click save to remove it.'
                : 'Set a secret PIN/passcode to require unlock when opening My Diary.'}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter 4-digit PIN..."
                maxLength={8}
                className="w-full bg-white/5 border border-theme-border-light rounded-xl px-3 py-2 text-theme-text font-mono text-center tracking-widest focus:outline-none focus:border-theme-accent"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-theme-accent text-slate-950 font-semibold hover:brightness-110 whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </form>

          {/* Export / Import Backup */}
          <div className="p-4 rounded-2xl bg-black/25 border border-theme-border-light space-y-3">
            <span className="font-semibold text-sm text-theme-text block">
              Backup & Memory Preservation
            </span>
            <p className="text-[11px] leading-relaxed">
              Export all your entries, future letters, dreams, and capsules as a secure JSON backup file.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-theme-text border border-theme-border-light flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-theme-accent" />
                <span>Export Backup</span>
              </button>
            </div>

            <form onSubmit={handleImport} className="pt-2 border-t border-theme-border-light/30 space-y-2">
              <label className="block text-[11px] text-theme-muted">
                Restore from Backup JSON String:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste backup JSON content here..."
                rows={2}
                className="w-full bg-white/5 border border-theme-border-light rounded-xl p-2 text-[10px] font-mono text-theme-text focus:outline-none focus:border-theme-accent"
              />
              <button
                type="submit"
                disabled={!importText.trim()}
                className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-theme-text border border-theme-border-light flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Memories</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
