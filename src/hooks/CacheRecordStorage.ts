
type initialValueFunc<T> = () => T
type initialValue<T> = T | initialValueFunc<T>

export function useCacheRecordStorage(key: string) {
  const cacheRecord = useLocalStorage<Record<string, any>>(key, {});
  return <T extends string | number | boolean>(prefix: string, key: string, initial: initialValue<T>): Ref<T> => {
    const label = `${prefix}/${key}`;
    return customRef<T>((track, trigger) => ({
      get(): T {
        track();
        const t = cacheRecord.value[label] as T;
        if (!t) {
          return typeof initial === 'function' ? initial() : initial;
        }
        return t;
      },
      set(value) {
        trigger()
        cacheRecord.value[label] = value;
      }
    })) as Ref<T>
  }
}
