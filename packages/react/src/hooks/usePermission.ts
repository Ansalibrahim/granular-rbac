import { useState, useEffect } from 'react';
import { useRBAC } from '../context';

export function usePermission(permission: string) {
  const { hasPermission } = useRBAC();
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function check() {
      setLoading(true);
      const result = await hasPermission(permission);
      setAllowed(result);
      setLoading(false);
    }
    check();
  }, [permission, hasPermission]);

  return { allowed, loading };
}

export function usePermissions(permissions: string[], requireAll: boolean = false) {
  const { hasAnyPermission, hasAllPermissions } = useRBAC();
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function check() {
      setLoading(true);
      const result = requireAll 
        ? await hasAllPermissions(permissions)
        : await hasAnyPermission(permissions);
      setAllowed(result);
      setLoading(false);
    }
    check();
  }, [permissions, requireAll, hasAnyPermission, hasAllPermissions]);

  return { allowed, loading };
}
