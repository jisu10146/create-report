export async function register() {
  // Next.js dev overlay (shadow-portal.js) accesses localStorage during SSR.
  // In some Node.js environments localStorage is defined as a broken stub.
  // Provide a proper in-memory implementation so the server doesn't crash.
  if (
    typeof globalThis.localStorage === "undefined" ||
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value); },
        removeItem: (key: string) => { store.delete(key); },
        clear: () => { store.clear(); },
        get length() { return store.size; },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
      },
      writable: true,
      configurable: true,
    });
  }
}
