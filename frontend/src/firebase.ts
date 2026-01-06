import { useState } from 'react';

type UserHook = {
  user: any | null;
  isUserLoading: boolean;
};

// Minimal stub for `useUser` used by the app during development.
// Replace with real Firebase/auth implementation later.
export function useUser(): UserHook {
  const [isUserLoading] = useState<boolean>(false);
  const user = null;
  return { user, isUserLoading };
}
