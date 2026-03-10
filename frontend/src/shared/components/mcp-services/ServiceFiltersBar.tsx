"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { Plus } from "lucide-react";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";

interface ServiceFiltersBarProps {
  onAddService: (type: string) => void;
  serviceType?: string;
}

const BaseServiceFiltersBar: React.FC<ServiceFiltersBarProps> = ({
  onAddService,
  serviceType = "openapi",
}) => {
  const { t } = useTranslation();
  const isFlowise = serviceType === "flowise";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Button
          color="primary"
          onPress={() => onAddService(serviceType)}
          startContent={<Plus size={16} />}
          size="sm"
        >
          {isFlowise ? t("Add Flowise") : t("Add Server")}
        </Button>
      </div>

      <div className="flex gap-2"></div>
    </div>
  );
};
export const ServiceFiltersBar = withComponentInjection(
  "shared/components/mcp-services/ServiceFiltersBar",
  BaseServiceFiltersBar
);
