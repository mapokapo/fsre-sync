export interface KeyedCache<K, V> {
  delete(key: K): boolean;
  get(key: K): undefined | V;
  has(key: K): boolean;
  set(key: K, value: V): void;
}

export interface SingletonCache<V> {
  clear(): void;
  get(): undefined | V;
  has(): boolean;
  set(value: V): void;
}

export function createCache<V>(keyMapper: () => string): SingletonCache<V>;
export function createCache<V, K>(keyMapper: (key: K) => string): KeyedCache<K, V>;
export function createCache<V, K>(
  keyMapper: (() => string) | ((key: K) => string),
): KeyedCache<K, V> | SingletonCache<V> {
  const store = new Map<string, V>();

  if (keyMapper.length === 0) {
    const slotKey = (keyMapper as () => string)();

    return {
      clear(): void {
        store.delete(slotKey);
      },
      get(): undefined | V {
        return store.get(slotKey);
      },
      has(): boolean {
        return store.has(slotKey);
      },
      set(value: V): void {
        store.set(slotKey, value);
      },
    };
  }

  const toKey = keyMapper;

  return {
    delete(key: K): boolean {
      return store.delete(toKey(key));
    },
    get(key: K): undefined | V {
      return store.get(toKey(key));
    },
    has(key: K): boolean {
      return store.has(toKey(key));
    },
    set(key: K, value: V): void {
      store.set(toKey(key), value);
    },
  };
}
