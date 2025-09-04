import React, { useEffect, useState } from 'react';
import SecurityAlert from '@/components/SecurityAlert';
import { Button } from '@/components/ui/button';

interface Props {
  className?: string;
}

const PROJECT_ID = 'rqahqicfafnxlmdjcozu';
const SUPABASE_AUTH_SETTINGS_URL = `https://supabase.com/dashboard/project/${PROJECT_ID}/auth/settings`;

export const SupabaseSecurityReminder: React.FC<Props> = ({ className = '' }) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const v = localStorage.getItem('leaked_pw_protection_dismissed');
    setDismissed(v === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('leaked_pw_protection_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className={className}>
      <SecurityAlert
        type="warning"
        title="Action recommended: Enable Leaked Password Protection"
        description="Go to Authentication Settings tab in Supabase Dashboard to enable Leaked Password Protection, set minimum password strength to Strong, and optionally set OTP expiry to 10 minutes."
      />
      <div className="mt-3 flex items-center gap-2">
        <a href={SUPABASE_AUTH_SETTINGS_URL} target="_blank" rel="noreferrer">
          <Button size="sm" variant="default">Open Authentication Settings</Button>
        </a>
        <Button size="sm" variant="outline" onClick={handleDismiss}>Dismiss</Button>
      </div>
    </div>
  );
};

export default SupabaseSecurityReminder;
