// Suppress benign Chromium ResizeObserver console noise without hiding real errors
// https://crbug.com/809574
const MSGS = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
];

function includesROMessage(input: unknown) {
  const s = typeof input === 'string' ? input : (input as any)?.message;
  return typeof s === 'string' && MSGS.some((m) => s.includes(m));
}

if (typeof window !== 'undefined') {
  // Capture-phase filters (run before other listeners like Vite overlay)
  const errorCapture = (event: ErrorEvent) => {
    if (includesROMessage(event?.message)) {
      event.stopImmediatePropagation();
      event.preventDefault?.();
      return true;
    }
    return false;
  };
  const rejectionCapture = (event: PromiseRejectionEvent) => {
    const reason = (event?.reason && (event.reason.message || String(event.reason))) || '';
    if (includesROMessage(reason)) {
      event.stopImmediatePropagation?.();
      event.preventDefault();
      return true;
    }
    return false;
  };

  window.addEventListener('error', errorCapture as EventListener, { capture: true });
  window.addEventListener('unhandledrejection', rejectionCapture as EventListener, { capture: true });

  // Bubble-phase filters
  window.addEventListener('error', (event) => {
    if (includesROMessage(event?.message)) {
      event.stopImmediatePropagation();
    }
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    if (includesROMessage((event?.reason && (event.reason.message || String(event.reason))) || '')) {
      event.preventDefault();
    }
  });

  // Legacy handlers as last-resort
  const prevOnError = window.onerror;
  window.onerror = function (message: any, ...rest: any[]) {
    if (includesROMessage(message)) return true;
    return prevOnError ? (prevOnError as any).apply(this, [message, ...rest]) : false;
  };
  const prevOnRejection = window.onunhandledrejection;
  window.onunhandledrejection = function (ev: PromiseRejectionEvent) {
    const reason = (ev?.reason && (ev.reason.message || String(ev.reason))) || '';
    if (includesROMessage(reason)) return true;
    return prevOnRejection ? (prevOnRejection as any).call(this, ev) : false;
  };

  // Patch console to drop only these specific messages
  const origError = console.error;
  const origWarn = console.warn;
  console.error = (...args: any[]) => {
    if (args.some(includesROMessage)) return;
    origError.apply(console, args);
  };
  console.warn = (...args: any[]) => {
    if (args.some(includesROMessage)) return;
    origWarn.apply(console, args);
  };
}
