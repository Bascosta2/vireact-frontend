import { useEffect, useState } from 'react';

/** True once `active` has stayed true for `delayMs`, so fast loads never flash a skeleton. */
export const useDelayedFlag = (active: boolean, delayMs = 1000): boolean => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [active, delayMs]);
  return show;
};
