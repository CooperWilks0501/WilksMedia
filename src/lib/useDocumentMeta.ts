import { useEffect } from "react";

/**
 * Sets <title> and the meta description for the current route.
 * Restores defaults on unmount so a route without this hook doesn't
 * inherit a stale title from a previous route.
 */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const previousDesc = metaDesc?.getAttribute("content") ?? "";

    document.title = title;
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      if (metaDesc) metaDesc.setAttribute("content", previousDesc);
    };
  }, [title, description]);
}
