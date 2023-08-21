import { useDebounceFn } from "ahooks"

const useDebounce = (fn: (...arg: any) => any, option?: any) => {
  const { cancel, flush, run } = useDebounceFn(fn, { wait: 500, ...option })
  return {
    cancel,
    flush,
    run,
  }
}
export default useDebounce
