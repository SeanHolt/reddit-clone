"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ClientRedirectGuard({ trigger }: { trigger: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (trigger) {
      router.push("/settings/username");
    }
  }, [trigger, router]);

  return null;
}
