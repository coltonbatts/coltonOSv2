import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { parseScheduleMarkdown } from '../lib/scheduleParser';

export default function ScheduleImporter({ onImport, onClose }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (file) => {
        if (!file.name.endsWith('.md')) {
            setError('Please upload a valid Markdown (.md) file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const parsedData = parseScheduleMarkdown(content);

                if (parsedData.blocks.length === 0 && parsedData.dailyFocus.length === 0) {
                    setError("Could not find any schedule data in this file. Check the format.");
                    return;
                }

                setPreview(parsedData);
                setError(null);
            } catch (err) {
                setError('Failed to parse file: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleConfirm = () => {
        if (preview) {
            onImport(preview);
            onClose();
        }
    };

    if (preview) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-white/10 w-full max-w-lg shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-light text-white flex items-center gap-2">
                            <Check className="text-emerald-400" size={20} />
                            Ready to Import
                        </h3>
                        <button onClick={onClose} className="text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded border border-white/10 text-center">
                                <div className="text-2xl text-blue-400 font-light">{preview.blocks.length}</div>
                                <div className="text-xs text-white/40 font-mono uppercase">Recurring Blocks</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded border border-white/10 text-center">
                                <div className="text-2xl text-purple-400 font-light">{preview.dailyFocus.length}</div>
                                <div className="text-xs text-white/40 font-mono uppercase">Daily Focuses</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded border border-white/10 text-center col-span-2">
                                <div className="text-2xl text-yellow-400 font-light">{preview.tasks.length}</div>
                                <div className="text-xs text-white/40 font-mono uppercase">Tasks extracted</div>
                            </div>
                        </div>

                        <div className="text-xs text-white/40 font-mono text-center">
                            This will overwrite conflicting events for next week.
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-3 bg-white text-black font-mono text-sm hover:bg-white/90 transition-colors uppercase tracking-wider"
                        >
                            Confirm Import
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div
                className={`
                bg-slate-900 border-2 border-dashed w-full max-w-lg aspect-video flex flex-col items-center justify-center transition-all
                ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-white/20 hover:border-white/40'}
            `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="mb-4 p-4 bg-white/5 rounded-full">
                    <Upload size={32} className="text-white/40" />
                </div>
                <h3 className="text-lg font-light text-white mb-2">Drop Schedule File</h3>
                <p className="text-sm text-white/40 font-mono max-w-xs text-center mb-6">
                    Drag & drop your markdown schedule file here to automatically build your week.
                </p>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded mb-4">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                <button onClick={onClose} className="text-xs text-white/30 hover:text-white underline font-mono">
                    Cancel
                </button>
            </div>
        </div>
    );
}
