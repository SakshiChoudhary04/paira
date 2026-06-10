import { useState, useEffect, useCallback, useRef } from 'react';

let toastFn = null;
export const showToast = (msg) => toastFn && toastFn(msg);

export default function Toast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = useCallback((m) => {
    setMsg(m);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2500);
  }, []);

  useEffect(() => { toastFn = show; return () => { toastFn = null; }; }, [show]);

  return <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>;
}
