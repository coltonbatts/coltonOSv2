import React, { useState, useEffect } from 'react';
import { auth, linkWithCredential, EmailAuthProvider, GoogleAuthProvider, linkWithPopup } from '../lib/firebase';
import { User, Mail, Shield, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

export default function SettingsView({ uid, user }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [linkError, setLinkError] = useState(null);
    const [linkSuccess, setLinkSuccess] = useState(null);

    const isAnonymous = user?.isAnonymous;

    const handleLinkEmail = async (e) => {
        e.preventDefault();
        setIsLinking(true);
        setLinkError(null);
        setLinkSuccess(null);

        try {
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(auth.currentUser, credential);
            setLinkSuccess("Account successfully upgraded to permanent email/password account.");
        } catch (error) {
            console.error("Error upgrading account:", error);
            setLinkError(error.message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleLinkGoogle = async () => {
        setIsLinking(true);
        setLinkError(null);
        setLinkSuccess(null);

        try {
            const provider = new GoogleAuthProvider();
            await linkWithPopup(auth.currentUser, provider);
            setLinkSuccess("Account successfully linked with Google.");
        } catch (error) {
            console.error("Error linking Google:", error);
            setLinkError(error.message);
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    SYSTEM SETTINGS
                </h1>
                <p className="text-white/40 font-mono text-sm max-w-2xl">
                    Configure authentication, security, and global preferences.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                {/* PROFILE CARD */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        User Profile
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">User ID</div>
                            <div className="font-mono text-white/80 text-sm truncate">{uid}</div>
                        </div>

                        <div className="bg-black/40 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Account Type</div>
                                <div className={`font-mono text-sm ${isAnonymous ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {isAnonymous ? 'ANONYMOUS (TEMPORARY)' : 'PERMANENT'}
                                </div>
                            </div>
                            {isAnonymous && <AlertCircle className="w-5 h-5 text-yellow-500/50" />}
                            {!isAnonymous && <CheckCircle className="w-5 h-5 text-green-500/50" />}
                        </div>
                    </div>
                </div>

                {/* AUTH UPGRADE CARD */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Security Upgrade
                    </h2>

                    {isAnonymous ? (
                        <div className="space-y-6">
                            <p className="text-sm text-white/60 leading-relaxed">
                                You are currently using a temporary guest session.
                                <strong className="text-white block mt-1">
                                    You will lose all data if you clear your browser cache or switch devices.
                                </strong>
                            </p>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Convert to Permanent</h3>

                                {/* Email Form */}
                                <form onSubmit={handleLinkEmail} className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Choose Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                    <button
                                        disabled={!email || !password || isLinking}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-stone-100 font-bold py-2 px-4 rounded transition-colors text-sm"
                                    >
                                        {isLinking ? 'Linking...' : 'Link Email & Password'}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-white/20 text-xs">OR</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                {/* Google Button */}
                                <button
                                    onClick={handleLinkGoogle}
                                    disabled={isLinking}
                                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium py-2 px-4 rounded transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" /> {/* Ideally use Google icon, using Mail as placeholder */}
                                    Link with Google
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <p className="text-white font-medium">Account Secured</p>
                            <p className="text-white/40 text-sm mt-1">Your data is safely synced to your account.</p>
                            <button
                                onClick={() => auth.signOut()}
                                className="mt-6 text-red-400 hover:text-red-300 text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <LogOut className="w-3 h-3" /> Sign Out
                            </button>
                        </div>
                    )}

                    {/* Feedback Messages */}
                    {linkError && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-200 text-xs">
                            {linkError}
                        </div>
                    )}
                    {linkSuccess && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-200 text-xs">
                            {linkSuccess}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
