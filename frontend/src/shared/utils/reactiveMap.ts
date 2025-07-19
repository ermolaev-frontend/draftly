export function createDeepReactiveMap<TKey, TValue extends object>(
  map: Map<TKey, TValue> = new Map(),
  onChange?: (event: string, data: any) => void,
  makeReactive: <T extends object>(obj: T) => T = function<T extends object>(obj: T): T {
    return new Proxy(obj, {
      get(target: T, prop: string | symbol) {
        return Reflect.get(target, prop);
      },
      set(target: T, prop: string | symbol, value: any) {
        const oldValue = Reflect.get(target, prop);
        const result = Reflect.set(target, prop, value);
        onChange?.('nested-update', { target, prop, value, oldValue });

        return result;
      },
    });
  },
): Map<TKey, TValue> {
  if (!(map instanceof Map)) {
    throw new Error('Параметр должен быть экземпляром Map');
  }

  const wrapValue = (value: TValue): TValue => {
    if (typeof value === 'object' && value !== null) {
      return makeReactive(value);
    }

    return value;
  };

  return new Proxy(map, {
    get(target: Map<TKey, TValue>, prop: string | symbol) {
      if (prop === 'set') {
        return (key: TKey, value: TValue) => {
          const oldValue = target.get(key);
          const reactiveValue = wrapValue(value);
          const result = target.set(key, reactiveValue);

          if (!Object.is(oldValue, reactiveValue)) {
            onChange?.('set', { key, value: reactiveValue, oldValue });
          }

          return result;
        };
      }

      if (prop === 'delete') {
        return (key: TKey) => {
          const oldValue = target.get(key);
          const result = target.delete(key);

          if (oldValue !== undefined && !target.has(key)) {
            onChange?.('delete', { key, oldValue });
          }

          return result;
        };
      }

      if (prop === 'clear') {
        return () => {
          const entries = Array.from(target.entries());
          const result = target.clear();

          if (entries.length > 0) {
            onChange?.('clear', { entries });
          }

          return result;
        };
      }

      const value = (target as any)[prop];

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
