import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a debounced version of `callback` that delays invoking it until
 * `delay` ms have passed since the last call. Useful for inputs that fire
 * onChange on every keystroke but should only persist after the user pauses.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Always call the latest version of the callback, without resetting the timer
  callbackRef.current = callback

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}