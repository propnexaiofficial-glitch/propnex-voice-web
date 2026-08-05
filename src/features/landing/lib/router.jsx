"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter as useNextRouter,
} from "next/navigation";
import { useEffect } from "react";

export function Link({ to, href, ...props }) {
  return <NextLink href={href ?? to ?? "/"} {...props} />;
}

export function useLocation() {
  const pathname = usePathname();

  return {
    pathname,
    hash: typeof window !== "undefined" ? window.location.hash : "",
  };
}

export function useRouter() {
  return useNextRouter();
}

export function useNavigate() {
  const router = useNextRouter();

  return (to, options) => {
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  };
}

export function useParams() {
  return useNextParams();
}

export function Navigate({ to, replace = false }) {
  const router = useNextRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  }, [router, to, replace]);

  return null;
}
