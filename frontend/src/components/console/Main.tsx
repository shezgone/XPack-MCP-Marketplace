"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/shared/lib/useTranslation";
import {
  getPersistedAdminToken,
  initializeAdminStore,
  useAdminStore,
} from "@/store/admin";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { SidebarItem, TabKey } from "@/shared/types/dashboard";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import { MCPServicesManagement } from "@/components/mcp-services/MCPServicesManagement";
import UserManagement from "@/components/user-management/UserManagement";
import RevenueManagement from "@/components/revenue-management/RevenueManagement";
import ConsoleSidebar from "./Sidebar";
import { withComponentInjection } from "@/shared/hooks/useComponentInjection";
import { Boxes, DollarSign, Home, ServerIcon, Users } from "lucide-react";
import OnboardingWelcome, { REQUIRED_TASK_KEYS } from "./OnboardingWelcome";
import ConsoleStats from "./ConsoleStats";
import SystemSettingsModal from "./SystemSettingsModal";
import SharePlatformModal from "./SharePlatformModal";
import {
  OnboardingTaskKey,
  TaskItem,
  TaskStatusEnum,
  updateAdminOnboardingTasks,
} from "@/api/onboard.api";
import ResourceGroupManagement from "../resource-group/resourceGroup";

const ConsoleContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admin_token, getAdminUser] = useAdminStore((state) => [
    state.admin_token,
    state.getAdminUser,
  ]);
  const [isAdminStoreReady, setIsAdminStoreReady] = useState(false);
  const effectiveAdminToken = admin_token || getPersistedAdminToken();

  const getInitialTab = (): TabKey => {
    const tabFromUrl = searchParams.get("tab") as TabKey;
    if (
      tabFromUrl &&
      ["mcp-services", "mcp-flowise", "user-management", "revenue-management", "resource-group"].includes(
        tabFromUrl
      )
    ) {
      return tabFromUrl;
    }
    return TabKey.CONSOLE;
  };
  const activeTab = getInitialTab();
  const isSkipOnboarding =
    typeof window !== "undefined" &&
    localStorage.getItem("admin_onboarding_skip") === "1";
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [settingModalKeyword, setSettingModalKeyword] = useState<string>("");
  const sidebarItems: SidebarItem[] = [
    {
      key: TabKey.CONSOLE,
      icon: <Home size={18} />,
      label: t("Analytics"),
      description: t("Analyze platform usage and revenue"),
    },
    {
      key: TabKey.MCP_SERVICES,
      icon: <ServerIcon size={18} />,
      label: t("MCP (OpenAPI)"),
      description: t("Manage OpenAPI-based MCP services"),
    },
    {
      key: TabKey.MCP_FLOWISE,
      icon: <ServerIcon size={18} />,
      label: t("MCP (Flowise)"),
      description: t("Register Flowise chatflows as MCP services"),
    },
    {
      key: TabKey.USER_MANAGEMENT,
      icon: <Users size={18} />,
      label: t("User"),
      description: t("Manage registered users"),
    },
    {
      key: TabKey.RESOURCE_GROUP,
      icon: <Boxes size={18} />,
      label: t("Resource Group"),
      description: t("Manage resource groups"),
    },
    {
      key: TabKey.REVENUE_MANAGEMENT,
      icon: <DollarSign size={18} />,
      label: t("Revenue"),
      description: t("View user recharge history"),
    },
  ];

  useEffect(() => {
    initializeAdminStore();

    if (!useAdminStore.persist) {
      setIsAdminStoreReady(true);
      return;
    }

    if (useAdminStore.persist.hasHydrated()) {
      setIsAdminStoreReady(true);
      return;
    }

    const unsubscribe = useAdminStore.persist.onFinishHydration(() => {
      setIsAdminStoreReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // If admin is not logged in, redirect to admin login page
  useEffect(() => {
    if (!isAdminStoreReady) {
      return;
    }
    if (!effectiveAdminToken) {
      window.location.href =
        process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || "/admin";
    }
  }, [effectiveAdminToken, isAdminStoreReady]);

  const handleTabNavigate = (tab: TabKey | string, _subTab?: string) => {
    if (tab === TabKey.CONSOLE) {
      router.replace("/admin/console", { scroll: false });
    } else {
      const params = new URLSearchParams();
      params.set("tab", tab);
      router.replace(`/admin/console?${params.toString()}`, { scroll: false });
    }
  };

  const { adminLogout } = useAdminLogin();

  const handleLogout = () => {
    // use admin logout method
    adminLogout();
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleSettingsModalClose = () => {
    setIsSettingsModalOpen(false);
    setSettingModalKeyword("");
  };
  const initOnboarding = async () => {
    const res = await getAdminUser();
    if (!res.success) {
      adminLogout();
      return;
    }
    try {
      const completedTasks: string[] = (res.data.onboarding_tasks || [])
        .filter(
          (task: TaskItem) => task.task_status === TaskStatusEnum.COMPLETED
        )
        .map((task: TaskItem) => task.task_id);
      setCompletedTasks(completedTasks);
      setShowOnboarding(completedTasks.length !== REQUIRED_TASK_KEYS.length);
    } catch (e) {
      // Fallback to show onboarding if localStorage not available
      setShowOnboarding(false);
    }
  };
  //todo: onboarding
  // Initialize onboarding state from localStorage
  useEffect(() => {
    if (activeTab !== TabKey.CONSOLE) {
      setShowOnboarding(false);
      return;
    }
    if (isSkipOnboarding) {
      setShowOnboarding(false);
      return;
    }
    initOnboarding();
  }, [activeTab]);

  const handleSkipOnboarding = () => {
    localStorage.setItem("admin_onboarding_skip", "1");
    setShowOnboarding(false);
  };

  const markTaskAsCompleted = async (taskKey: OnboardingTaskKey) => {
    // Mark task as completed
    const next = Array.from(new Set([...completedTasks, taskKey]));
    setCompletedTasks(next);
    const result = await updateAdminOnboardingTasks({
      task_id: taskKey,
      task_status: TaskStatusEnum.COMPLETED,
    });
    if (!result) return;

    if (next.length === REQUIRED_TASK_KEYS.length) {
      localStorage.setItem("admin_onboarding_skip", "1");
      setShowOnboarding(false);
    }
  };

  const handleTaskClick = async (taskKey: OnboardingTaskKey) => {
    switch (taskKey) {
      case OnboardingTaskKey.PLATFORM_SETUP:
        setIsSettingsModalOpen(true);
        await markTaskAsCompleted(taskKey);
        break;
      case OnboardingTaskKey.MCP_SERVICES:
        setShowOnboarding(false);
        handleTabNavigate(TabKey.MCP_SERVICES);
        void markTaskAsCompleted(taskKey);
        break;
      case OnboardingTaskKey.REVENUE_MANAGEMENT:
        setShowOnboarding(false);
        setSettingModalKeyword("Payment");
        setIsSettingsModalOpen(true);
        void markTaskAsCompleted(taskKey);
        break;
      case OnboardingTaskKey.SHARE_PLATFORM:
        setIsShareModalOpen(true);
        // 不在这里标记完成，等待实际分享后再标记
        break;
    }
  };

  const handleShareComplete = async () => {
    await markTaskAsCompleted(OnboardingTaskKey.SHARE_PLATFORM);
  };

  const handleShareModalClose = () => {
    setIsShareModalOpen(false);
  };

  // render different content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case TabKey.MCP_SERVICES:
        return <MCPServicesManagement key={TabKey.MCP_SERVICES} serviceType="openapi" />;
      case TabKey.MCP_FLOWISE:
        return <MCPServicesManagement key={TabKey.MCP_FLOWISE} serviceType="flowise" />;
      case TabKey.USER_MANAGEMENT:
        return (
          <div className="h-full overflow-auto">
            <UserManagement />
          </div>
        );
      case TabKey.REVENUE_MANAGEMENT:
        return (
          <div className="h-full overflow-auto">
            <RevenueManagement />
          </div>
        );
      case TabKey.RESOURCE_GROUP:
        return (
          <div className="h-full overflow-auto">
            <ResourceGroupManagement />
          </div>
        );
      default:
        return showOnboarding ? (
          <OnboardingWelcome
            onSkipOnboarding={handleSkipOnboarding}
            onTaskClick={handleTaskClick}
            completedTasks={completedTasks}
          />
        ) : (
          <DashboardDemoContent
            title={
              <div className="flex items-center gap-2">
                <span>{t("Analytics")}</span>
                <span className="text-primary text-lg font-medium">
                  {t("(30 days)")}
                </span>
              </div>
            }
            description={t("Analyze platform usage and revenue")}
          >
            <ConsoleStats />
          </DashboardDemoContent>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <ConsoleSidebar
          activeTab={activeTab}
          onTabNavigate={handleTabNavigate}
          onLogout={handleLogout}
          sidebarItems={sidebarItems}
          onSettingsClick={handleSettingsClick}
        />

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-y-auto">{renderContent()}</div>
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SystemSettingsModal
          isOpen={true}
          onClose={handleSettingsModalClose}
          keyword={settingModalKeyword}
        />
      )}

      {/* Share Platform Modal */}
      {isShareModalOpen && (
        <SharePlatformModal
          isOpen={true}
          onClose={handleShareModalClose}
          onShareComplete={handleShareComplete}
        />
      )}
    </div>
  );
};

const ConsoleMain: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          {t("Loading...")}
        </div>
      }
    >
      <ConsoleContent />
    </Suspense>
  );
};

// Export the base component for direct use
export { ConsoleMain as ConsoleMainBase };

// Export with component injection support
export default withComponentInjection("console/Main", ConsoleMain);
