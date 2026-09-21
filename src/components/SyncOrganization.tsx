"use client";

import { useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";

export default function SyncOrganization() {
  const { organization, isLoaded } = useOrganization();

  useEffect(() => {
    if (!isLoaded || !organization) return;

    async function syncOrg() {
      try {
        // Aapke API route ki strict validation ke mutabiq yeh fields zaroori hain
        await fetch("/api/organization/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkOrgId: organization?.id,
            name: organization?.name || "My Organization",
            industry: "Technology", // Default fallback taike validation fail na ho
            employeeCount: 10,       // Default fallback
            currency: "USD",
            timezone: "UTC",
          }),
        });
      } catch (error) {
        console.error("Auto-sync background error:", error);
      }
    }

    syncOrg();
  }, [isLoaded, organization?.id, organization?.name]);

  return null;
}