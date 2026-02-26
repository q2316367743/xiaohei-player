// 定义条件类型，根据是否有默认值来决定数据类型
type DataType<TData, TDefault> = TDefault extends undefined ? Ref<TData | null> : Ref<TData>;

interface RequestOptions<TData, TDefault = undefined> {
  manual?: boolean;
  defaultValue?: TDefault;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface RequestResult<TData, TDefault = undefined> {
  data: DataType<TData, TDefault>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  run: () => Promise<void>;
}

export const useRequest = <TData, TDefault = undefined>(
  asyncFn: () => Promise<TData>,
  options?: RequestOptions<TData, TDefault>
): RequestResult<TData, TDefault> => {
  const { manual = false, defaultValue, onSuccess, onError } = options || {};

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const data = ref<TData | null>(defaultValue !== undefined ? defaultValue : null) as TDefault extends undefined ? Ref<TData | null> : Ref<TData>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const run = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await asyncFn();
      data.value = result as TData;
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      error.value = err;
      
      if (onError) {
        onError(err);
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (!manual) {
      run();
    }
  });

  return {
    data,
    loading,
    error,
    run,
  };
};