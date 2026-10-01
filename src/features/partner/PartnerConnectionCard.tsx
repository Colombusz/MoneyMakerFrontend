import React, { useState } from 'react';
import { Unlink, Copy, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { Button } from '../../shared/components/ui';

interface PartnerConnectionCardProps {
  user: UserProfile;
  onGenerateInviteCode: () => Promise<string>;
  onAcceptInviteCode: (code: string) => Promise<void>;
  onOpenUnlinkModal: () => void;
  onError: (err: string) => void;
}

export const PartnerConnectionCard: React.FC<PartnerConnectionCardProps> = ({
  user,
  onGenerateInviteCode,
  onAcceptInviteCode,
  onOpenUnlinkModal,
  onError
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConnected = !!(user.partner || (user as UserProfile).partnerId);

  const handleGenerate = async () => {
    onError('');
    try {
      const code = await onGenerateInviteCode();
      setGeneratedCode(code);
    } catch (err: any) {
      onError(err.message || 'Failed to generate invite code');
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    if (!inviteCode.trim()) {
      onError('Please enter a 6-character code');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAcceptInviteCode(inviteCode.trim().toUpperCase());
      setInviteCode('');
    } catch (err: any) {
      onError(err.message || 'Failed to connect partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {isConnected ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              {user.partner?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Connected Partner
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user.partner?.name}
              </h3>
              {user.partner?.email && (
                <span className="text-xs text-slate-400">{user.partner.email}</span>
              )}
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={onOpenUnlinkModal}
            className="flex items-center gap-1.5"
          >
            <Unlink className="w-4 h-4" />
            <span>Unlink Partner</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Connect with your Partner
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate an invite code to share, or enter a code provided by your partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Generate Code */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Option 1</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Generate Invite Code
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Send this 6-character code to your partner to link accounts.
                </p>
              </div>

              {generatedCode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono font-bold text-lg text-center tracking-widest text-blue-600 dark:text-blue-400">
                    {generatedCode}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <Button variant="primary" onClick={handleGenerate} className="w-full">
                  Generate 6-Character Code
                </Button>
              )}
            </div>

            {/* Option 2: Enter Partner's Code */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Option 2</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Enter Partner's Code
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the code you received from your partner.
                </p>
              </div>

              <form onSubmit={handleAccept} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="flex-1 py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono font-bold text-center tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px] text-base"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || inviteCode.length < 4}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmitting ? '...' : 'Connect'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
