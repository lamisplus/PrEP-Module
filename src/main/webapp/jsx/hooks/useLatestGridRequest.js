import { useEffect, useRef } from "react";
const useLatestGridRequest = () => {
  const controllerRef = useRef(null);
  const seqRef = useRef(0);

  useEffect(
    () => () => {
      if (controllerRef.current) controllerRef.current.abort();
    },
    []
  );

  return () => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const seq = seqRef.current + 1;
    seqRef.current = seq;
    return {
      signal: controller.signal,
      isCurrent: () => seq === seqRef.current,
    };
  };
};

export const isAbortError = error =>
  !!error &&
  (error.name === "CanceledError" ||
    error.name === "AbortError" ||
    error.code === "ERR_CANCELED");

export default useLatestGridRequest;
