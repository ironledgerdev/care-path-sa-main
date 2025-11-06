// Patch ResizeObserver methods to guard against the "ResizeObserver loop completed" exceptions
// Enhanced ResizeObserver patch.
// Wraps constructor/callback and core methods to prevent "ResizeObserver loop completed with undelivered notifications." noise
// while preserving normal behavior. This targets browser bugs where the RO loop throws during notification delivery.

if (typeof window !== 'undefined' && typeof (window as any).ResizeObserver !== 'undefined') {
  try {
    const NativeRO: any = (window as any).ResizeObserver;

    // Wrapper constructor that ensures callbacks run safely
    const WrappedRO = function (this: any, callback: any) {
      // Wrap provided callback in try/catch to swallow loop errors
      const safeCb = function (entries: any, observer: any) {
        try {
          return callback(entries, observer);
        } catch (err: any) {
          try {
            const msg = err && (err.message || String(err));
            if (typeof msg === 'string' && (msg.includes('ResizeObserver loop completed') || msg.includes('ResizeObserver loop limit exceeded'))) {
              // swallow the benign loop error
              return;
            }
          } catch (_) {}
          // Re-throw other errors so they surface
          throw err;
        }
      };

      // Create native observer with safe callback
      const instance = new NativeRO(safeCb);

      // Copy instance properties to 'this'
      Object.setPrototypeOf(instance, WrappedRO.prototype);
      return instance;
    } as any;

    // Ensure prototype methods mirror native ones but wrapped where necessary
    WrappedRO.prototype = Object.create(NativeRO.prototype, {
      constructor: { value: WrappedRO, writable: true, configurable: true }
    });

    // Patch observe/unobserve/disconnect to guard against browser errors
    const proto = WrappedRO.prototype as any;

    proto.observe = function (target: Element, options?: any) {
      try {
        return NativeRO.prototype.observe.call(this, target, options);
      } catch (err: any) {
        try {
          const message = err && (err.message || String(err));
          if (typeof message === 'string' && (message.includes('ResizeObserver loop completed') || message.includes('ResizeObserver loop limit exceeded'))) {
            return;
          }
        } catch (_) {}
        throw err;
      }
    };

    proto.unobserve = function (target: Element) {
      try {
        return NativeRO.prototype.unobserve.call(this, target);
      } catch (_) {
        return;
      }
    };

    proto.disconnect = function () {
      try {
        return NativeRO.prototype.disconnect.call(this);
      } catch (_) {
        return;
      }
    };

    // Replace global ResizeObserver with our wrapped version
    (window as any).ResizeObserver = WrappedRO;
  } catch (e) {
    // If patching fails, log debug info but do not crash the app
    // eslint-disable-next-line no-console
    console.debug('ResizeObserver enhanced patch failed', e);
  }
}
