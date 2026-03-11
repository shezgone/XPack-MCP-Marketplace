"use client";

import React, { useCallback } from "react";
import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Textarea,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  MCPServiceAPIItem,
  MCPServiceFormData,
} from "@/shared/types/mcp-service";

interface ToolsTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
  hideUrl?: boolean;
  serviceType?: "openapi" | "flowise";
  errors?: Record<string, string>;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  formData,
  onInputChange,
  hideUrl = false,
  serviceType = "openapi",
  errors = {},
}) => {
  const { t } = useTranslation();
  const isFlowise = serviceType === "flowise";

  const handleToolChange = useCallback(
    (index: number, field: keyof MCPServiceAPIItem, value: string) => {
      onInputChange(
        "apis",
        (formData.apis || []).map((api, i) =>
          i === index ? { ...api, [field]: value } : api
        )
      );
    },
    [formData.apis, onInputChange]
  );

  return (
    <div className="space-y-4">
      {isFlowise && (
        <div className="rounded-lg border border-default-200 bg-default-50 p-4">
          <p className="text-sm font-medium text-default-700">
            {t(
              "Use a domain+function tool name such as process_control_analysis or quality_control_analysis."
            )}
          </p>
          <p className="mt-1 text-xs text-default-500">
            {t(
              "The orchestrator will choose tools more reliably when the name and descriptions clearly separate business domains."
            )}
          </p>
        </div>
      )}
      <Table
        aria-label="APIs table"
        removeWrapper
        className="border-1 rounded-lg overflow-hidden"
        classNames={{
          thead: "[&>tr]:first:rounded-none",
          th: "first:rounded-none last:rounded-none",
        }}
      >
        <TableHeader>
          <TableColumn className="w-1/4">{t("Tool Name")}</TableColumn>
          <TableColumn className="w-1/4" hidden={hideUrl}>
            {t("Tool URL")}
          </TableColumn>
          <TableColumn>{t("Description")}</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={t(
            "No tools added yet. Add your first tool using the input above."
          )}
        >
          {(formData.apis || []).map((tool, index) => (
            <TableRow key={`tool-${index}`}>
              <TableCell>
                <Input
                  value={tool.name}
                  onChange={(e) =>
                    handleToolChange(index, "name", e.target.value)
                  }
                  size="sm"
                  isInvalid={isFlowise && !!errors.tool_name}
                  errorMessage={isFlowise ? errors.tool_name : undefined}
                  placeholder={
                    isFlowise ? "domain_function" : t("Tool Name")
                  }
                />
              </TableCell>
              <TableCell hidden={hideUrl}>
                <Input value={tool.url} size="sm" isDisabled />
              </TableCell>
              <TableCell>
                <div className="space-y-3">
                  <Input
                    value={tool.description || ""}
                    onChange={(e) =>
                      handleToolChange(index, "description", e.target.value)
                    }
                    size="sm"
                    label={isFlowise ? t("Short Tool Description") : undefined}
                    isInvalid={isFlowise && !!errors.tool_description}
                    errorMessage={isFlowise ? errors.tool_description : undefined}
                  />
                  {isFlowise && (
                    <Textarea
                      value={tool.long_description || ""}
                      onChange={(e) =>
                        handleToolChange(
                          index,
                          "long_description",
                          e.target.value
                        )
                      }
                      minRows={4}
                      size="sm"
                      label={t("Long Tool Description")}
                      placeholder={t(
                        "Explain when the tool should be selected, what domain it covers, and what outcome it returns."
                      )}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
