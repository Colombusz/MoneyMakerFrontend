import { useCallback } from 'react';
import { apiFetch } from '../../services/api';

export function usePartner(refreshProfile: () => Promise<void>, onReloadData: () => Promise<void>) {
  const handleGenerateInviteCode = useCallback(async (): Promise<string> => {
    // Backend returns `{ inviteCode, expiresAt, message }` (see
    // PartnerService.generateInvite); accept both `inviteCode` and the legacy
    // `code` alias so a stale backend never yields `undefined`.
    const data = await apiFetch<{ inviteCode?: string; code?: string }>(
      '/api/partners/invite',
      { method: 'POST' }
    );
    const code = data.inviteCode ?? data.code;
    if (!code) throw new Error('Server did not return an invite code');
    return code;
  }, []);

  const handleAcceptInviteCode = useCallback(
    async (code: string): Promise<void> => {
      // Backend zod schema requires `inviteCode` (partnerValidation.ts) —
      // sending `code` fails validation with 400 and the link never happens.
      await apiFetch('/api/partners/accept', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: code })
      });
      await refreshProfile();
      await onReloadData();
    },
    [refreshProfile, onReloadData]
  );

  const handleUnlinkPartner = useCallback(async (): Promise<void> => {
    await apiFetch('/api/partners/unlink', { method: 'POST' });
    await refreshProfile();
    await onReloadData();
  }, [refreshProfile, onReloadData]);

  return {
    handleGenerateInviteCode,
    handleAcceptInviteCode,
    handleUnlinkPartner
  };
}
