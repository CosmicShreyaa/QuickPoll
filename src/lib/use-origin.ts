import { useEffect, useState } from "react";

// Empty on the server and on first client render (so SSR output matches),
// then filled in after mount once `window` is available.
export function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}
