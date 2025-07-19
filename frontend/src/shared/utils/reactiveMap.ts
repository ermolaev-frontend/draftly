export function createDeepReactiveMap<TKey, TValue>(
  map: Map<TKey, TValue> = new Map(),
  onChange?: (event: string, data: any) => void,
): Map<TKey, TValue> {
  if (!(map instanceof Map)) {
    throw new Error('Parameter must be an instance of Map');
  }

  // Proxy for Map
  return new Proxy(map, {
    get(target: Map<TKey, TValue>, prop: string | symbol) {
      if (prop === 'set') {
        return function(this: Map<TKey, TValue>, key: TKey, value: TValue) {
          const oldValue = Reflect.get(target, 'get').call(target, key);
          const result = Reflect.get(target, 'set').call(target, key, value);

          onChange?.('set', { key, value, oldValue });

          return result;
        };
      }

      if (prop === 'delete') {
        return function(this: Map<TKey, TValue>, key: TKey) {
          const oldValue = Reflect.get(target, 'get').call(target, key);
          const result = Reflect.get(target, 'delete').call(target, key);
          
          if (Reflect.get(target, 'has').call(target, key) !== result) {
            onChange?.('delete', { key, oldValue });
          }
          
          return result;
        };
      }

      if (prop === 'clear') {
        return function() {
          const entries = Array.from(Reflect.get(target, 'entries').call(target));
          const result = Reflect.get(target, 'clear').call(target);
          
          if (entries.length > 0) {
            onChange?.('clear', { entries });
          }
          
          return result;
        };
      }

      // For properties, return the value directly
      if (prop === 'size') {
        return Reflect.get(target, prop);
      }

      // For other methods, use Reflect for proper context
      const method = Reflect.get(target, prop);

      if (typeof method === 'function') {
        return function(...args: any[]) {
          return method.apply(target, args);
        };
      }
      
      return method;
    },
  });
} 
