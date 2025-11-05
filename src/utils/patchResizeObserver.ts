// Patch ResizeObserver methods to guard against the "ResizeObserver loop completed" exceptions
// This is a last-resort safety patch that wraps observe/unobserve/disconnect in try/catch
// to avoid noisy console errors originating from third-party libs or browser bugs.

if (typeof window !== 'undefined' && typeof (window as any).ResizeObserver !== 'undefined') {
  try {
    const RO: any = (window as any).ResizeObserver;
    const proto = RO.prototype;

    const origObserve = proto.observe;
    const origUnobserve = proto.unobserve;
    const origDisconnect = proto.disconnect;

    proto.observe = function (target: Element, options?: any) {
      try {
        return origObserve.call(this, target, options);
      } catch (err) {
        // swallow ResizeObserver loop errors
        try {
          const message = err && (err.message || String(err));
          if (typeof message === 'string' && (message.includes('ResizeObserver loop completed') || message.includes('ResizeObserver loop limit exceeded'))) {
            return;
          }
        } catch (_) {}
        // rethrow if it's a different error
        throw err;
      }
    };

    proto.unobserve = function (target: Element) {
      try {
        return origUnobserve.call(this, target);
      } catch (err) {
        return;
      }
    };

    proto.disconnect = function () {
      try {
        return origDisconnect.call(this);
      } catch (err) {
        return;
      }
    };
  } catch (e) {
    // ignore patch failures
    // eslint-disable-next-line no-console
    console.debug('ResizeObserver patch failed', e);
  }
}
