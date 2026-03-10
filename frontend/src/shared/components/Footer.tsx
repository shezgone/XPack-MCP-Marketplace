'use client'
import React from "react";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { Link } from "@nextui-org/react";
interface FooterProps {
  showPoweredBy?: boolean;
}
export function Footer({ showPoweredBy=true }: FooterProps) {
  const { platformConfig } = usePlatformConfig();
  const platformUrl =
    platformConfig?.url ||
    (platformConfig?.domain ? `https://${platformConfig.domain}` : undefined);

  return (
    <footer className="py-4 px-4 sm:px-6 text-center sm:text-end max-w-7xl mx-auto text-xs">
      <span className="mr-1">© 2025 {platformConfig?.name}. All rights reserved.</span>
      {showPoweredBy && (
        platformUrl ? (
          <Link className="text-xs" href={platformUrl}>Powered by {platformConfig?.name}</Link>
        ) : (
          <span className="text-xs">Powered by {platformConfig?.name}</span>
        )
      )}
    </footer>
  );
}
