export const useState = <T>(initial: T): [Ref<T>, (v: T) => void] => {
  const data = ref<T>(initial) as Ref<T>;

  return [
    data,
    (v: T) => {
      data.value = v;
    }
  ]
}

export const useBoolState = (initial: boolean): [Ref<boolean>, () => void] => {
  const [data, setData] = useState(initial);
  return [
    data,
    () => {
      setData(!data.value);
    }
  ]
}