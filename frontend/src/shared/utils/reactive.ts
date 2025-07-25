export function makeReactive<T extends object>(
  _obj: T,
  onChange?: (_event: string, _data: any) => void,
): T {
  return new Proxy(_obj, {
    get(target: T, prop: string | symbol) {
      return Reflect.get(target, prop);
    },
    set(target: T, prop: string | symbol, value: any) {
      const oldValue = Reflect.get(target, prop);
      const result = Reflect.set(target, prop, value);
      
      if (!Object.is(oldValue, value)) {
        onChange?.('nested-update', { target, prop, value, oldValue });
      }

      return result;
    },
  });
}

export function createDeepReactiveMap<TKey, TValue extends object>(
  map: Map<TKey, TValue> = new Map(),
  onChange?: (_event: string, _data: any) => void,
): Map<TKey, TValue> {
  if (!(map instanceof Map)) {
    throw new Error('Parameter must be an instance of Map');
  }

  const wrapValue = (value: TValue): TValue => {
    if (typeof value === 'object' && value !== null) {
      return makeReactive(value, onChange);
    }

    return value;
  };

  const reactiveMap = new Map<TKey, TValue>();

  for (const [key, value] of map.entries()) {
    reactiveMap.set(key, wrapValue(value));
  }

  return new Proxy(reactiveMap, {
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

      const value = Reflect.get(target, prop);

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
