"use client";

import React from "react";
import { Input, Chip } from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { MCPServiceFormData } from "@/shared/types/mcp-service";
import { HeadersManagementSettings } from "./HeadersManagementSettings";

interface BasicInfoTabProps {
  formData: MCPServiceFormData;
  newTag: string;
  setNewTag: (value: string) => void;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  errors?: Record<string, string>;
  serviceType?: string;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  newTag,
  setNewTag,
  onInputChange,
  onAddTag,
  onRemoveTag,
  errors,
  serviceType = "openapi",
}) => {
  const { t } = useTranslation();
  const isFlowise = serviceType === "flowise";

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={t("Server ID")}
        placeholder={t("Enter server ID")}
        value={formData.slug_name || ""}
        onChange={(e) => {
          // Only allow English letters, numbers, hyphens, and underscores
          const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "");
          onInputChange("slug_name", value);
        }}
        description={t(
          "Modifying the ID will affect the MCP access URL. Please modify with caution."
        )}
        labelPlacement="outside"
        isRequired
        maxLength={255}
        isInvalid={!!errors?.slug_name}
        errorMessage={errors?.slug_name || t("Server ID is required")}
      />
      <Input
        label={t("Server Name")}
        placeholder={t("Enter server name")}
        value={formData.name}
        onChange={(e) => onInputChange("name", e.target.value)}
        isRequired
        labelPlacement="outside"
        maxLength={255}
        isInvalid={!!errors?.name}
        errorMessage={errors?.name || t("Server name is required")}
      />
      <Input
        label={t("Short Description")}
        placeholder={t("Brief description of the server")}
        value={formData.short_description || ""}
        onChange={(e) => onInputChange("short_description", e.target.value)}
        isRequired
        labelPlacement="outside"
        isInvalid={!!errors?.short_description}
        errorMessage={
          errors?.short_description || t("Short description is required")
        }
      />

      <Input
        label={isFlowise ? t("Flowise Base URL") : t("API Endpoint")}
        placeholder={
          isFlowise ? "http://127.0.0.1:3000" : "https://api.example.com/v1"
        }
        value={formData.base_url || ""}
        onChange={(e) => onInputChange("base_url", e.target.value)}
        isRequired
        labelPlacement="outside"
        isInvalid={!!errors?.base_url}
        errorMessage={errors?.base_url || t("API Endpoint is required")}
      />
      {isFlowise && (
        <Input
          label={t("Chatflow ID")}
          placeholder={t("Enter Flowise chatflow ID")}
          value={formData.flowise_chatflow_id || ""}
          onChange={(e) => onInputChange("flowise_chatflow_id", e.target.value)}
          isRequired
          labelPlacement="outside"
          isInvalid={!!errors?.flowise_chatflow_id}
          errorMessage={
            errors?.flowise_chatflow_id || t("Chatflow ID is required")
          }
        />
      )}
      {/* headers input fields */}
      <HeadersManagementSettings
        formData={formData}
        onInputChange={onInputChange}
      />

      {/* tag management */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={t("Add tag")}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onAddTag()}
            labelPlacement="outside"
            label={t("Tags")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.tags || []).map((tag, index) => (
            <Chip key={index} onClose={() => onRemoveTag(tag)} variant="flat">
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
};
