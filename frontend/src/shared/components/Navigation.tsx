"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { useAuth } from "@/shared/lib/useAuth";
import { ArrowRightIcon, ShieldCheck, UserRound } from "lucide-react";
import { DynamicLogo } from "@/shared/components/DynamicLogo";
import Link from "next/link";
import { useSharedStore } from "../store/share";
import { useGlobalStore } from "../store/global";
import { fetchServices } from "@/services/marketplaceService";
import { ServiceData } from "@/shared/types/marketplace";
export type NavigationItem = {
  label: string;
  href: string;
  target?: string;
};

interface NavigationProps {
  items?: NavigationItem[];
  langNode?: React.ReactNode;
  navbarBrand?: React.ReactNode;
  onLogin?: () => void;
  classNames?: {
    logo?: string;
  };
  signinText?: string;
}

// Client-side wrapper for interactive functionality
function NavigationClient({
  items = [],
  langNode,
  navbarBrand,
  onLogin,
  classNames,
  signinText = "Get Started",
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { handleLogin, handleLogout } = useAuth();
  const getUser = useGlobalStore((state) => state.getUser);
  const [userToken, user] = useSharedStore((state) => [
    state.user_token,
    state.user,
  ]);
  const [accessibleServices, setAccessibleServices] = useState<ServiceData[]>([]);
  const [isAccessMenuLoading, setIsAccessMenuLoading] = useState(false);

  const displayName = user?.nick_name || user?.user_name || user?.user_email;
  const permissionSummary = user?.allow_all
    ? t("All published services")
    : t("{{count}} services", { count: accessibleServices.length });

  useEffect(() => {
    if (userToken && !user) {
      getUser();
    }
  }, [getUser, user, userToken]);

  useEffect(() => {
    const loadAccessibleServices = async () => {
      if (!userToken || !user) {
        setAccessibleServices([]);
        return;
      }

      setIsAccessMenuLoading(true);
      try {
        const response = await fetchServices({ page: 1, page_size: 200 });
        const services = response.data?.services || [];

        const filteredServices = user.allow_all
          ? services
          : services.filter((service) =>
              user.service_ids?.includes(service.service_id || service.id)
            );

        setAccessibleServices(filteredServices);
      } catch (error) {
        console.error("Failed to load accessible services:", error);
        setAccessibleServices([]);
      } finally {
        setIsAccessMenuLoading(false);
      }
    };

    loadAccessibleServices();
  }, [user, userToken]);

  const handleNavigateToDashboard = () => {
    window.location.href = "/console";
  };

  const handleNavigateToService = (serviceId?: string) => {
    if (!serviceId) {
      return;
    }
    window.location.href = `/server/${serviceId}`;
  };

  const handleUserLogout = () => {
    handleLogout();
    window.location.href = "/";
  };

  const accessMenuItems = isAccessMenuLoading
    ? [
        <DropdownItem key="loading" isReadOnly textValue="loading">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span>{t("Loading accessible services")}</span>
          </div>
        </DropdownItem>,
      ]
    : accessibleServices.length > 0
      ? accessibleServices.slice(0, 10).map((service) => (
          <DropdownItem
            key={service.service_id || service.id}
            onPress={() =>
              handleNavigateToService(service.service_id || service.id)
            }
          >
            {service.name}
          </DropdownItem>
        ))
      : [
          <DropdownItem key="no-access" isReadOnly textValue="no-access">
            {t("No accessible services")}
          </DropdownItem>,
        ];

  return (
    <>
      {/* Main Navigation */}
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="full"
        /*
         * Rounded-pill navigation container with subtle border & backdrop blur
         * Matches the reference design that features a floating white bar with full-round corners.
         */
        className="mt-2 sm:mt-5 rounded-full bg-background/50 backdrop-blur-[10px] border-1 border-gray-100 top-2 sm:top-5 max-w-7xl mx-auto"
        height="66px"
        isBordered={false}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <div className="flex items-center gap-2 justify-start bg-transparent w-max">
            {/* Logo using dynamic platform config */}
            <Link href="/" prefetch>
              <DynamicLogo
                alt="Platform Logo"
                className={classNames?.logo || "h-[32px]"}
              />
            </Link>
            {navbarBrand}
          </div>
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2 justify-center">
            {items?.map((item) => (
              <NavbarItem key={item.href}>
                <Link
                  color="foreground"
                  href={item.href}
                  className="font-medium text-foreground-600 hover:text-foreground transition-colors px-2 py-1"
                  target={item?.target || "_self"}
                  prefetch={!item.target}
                >
                  {t(item.label)}
                </Link>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        {/* Right Side Actions */}
        <NavbarContent justify="end" className="items-center gap-2 sm:gap-4">
          {langNode ? (
            langNode
          ) : (
            <>
              {!userToken && (
                <>
                  <Button onPress={handleLogin} variant="light">
                    <b className="text-md"> {t("Sign In")}</b>
                  </Button>
                </>
              )}
            </>
          )}

          {userToken && user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="hidden md:flex items-center gap-3 px-3 h-[45px]"
                >
                  <Avatar
                    isBordered
                    size="sm"
                    src={user.avatar || ""}
                    name={displayName || "User"}
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs text-default-500">{t("Signed in")}</span>
                    <span className="max-w-[180px] truncate font-medium text-sm">
                      {displayName}
                    </span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User access menu">
                <DropdownItem
                  key="current-user"
                  isReadOnly
                  startContent={<UserRound size={16} />}
                  className="opacity-100"
                  textValue={displayName || "User"}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{displayName}</span>
                    <span className="text-xs text-default-500">
                      {user.user_email}
                    </span>
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="permission-summary"
                  isReadOnly
                  startContent={<ShieldCheck size={16} />}
                  className="opacity-100"
                  textValue={permissionSummary}
                >
                  {permissionSummary}
                </DropdownItem>
                <DropdownItem key="dashboard" onPress={handleNavigateToDashboard}>
                  {t("Dashboard")}
                </DropdownItem>
                <>{accessMenuItems}</>
                <DropdownItem key="logout" color="danger" onPress={handleUserLogout}>
                  {t("Log Out")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : null}

          {/* Desktop Auth Button */}
          <div className="hidden sm:block">
            <Button
              color="primary"
              className="bg-black flex items-center justify-center gap-4 pr-1 h-[45px]"
              radius="full"
              onPress={onLogin || handleLogin}
            >
              <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#9ab0f2] flex items-center justify-center rounded-full">
                <ArrowRightIcon
                  size={16}
                  className="transition-transform duration-200 ease-in-out group-hover:translate-x-[3px]"
                />
              </div>
            </Button>
          </div>

          {/* Mobile Auth Button */}
          {!langNode && (
            <div className="sm:hidden">
              <Button
                color="primary"
                onPress={onLogin || handleLogin}
                size="sm"
              >
                <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              </Button>
            </div>
          )}
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6 pb-6">
          {userToken && user ? (
            <NavbarMenuItem className="pb-2 border-b border-divider mb-2">
              <div className="flex items-center gap-3 py-2">
                <Avatar
                  isBordered
                  size="sm"
                  src={user.avatar || ""}
                  name={displayName || "User"}
                />
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-default-500">{permissionSummary}</p>
                </div>
              </div>
            </NavbarMenuItem>
          ) : null}
          {items?.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <Link
                color="foreground"
                href={item.href}
                className="w-full py-2 font-medium text-sm"
                target={item?.target || "_self"}
                prefetch={!item.target}
              >
                {t(item.label)}
              </Link>
            </NavbarMenuItem>
          ))}
          {userToken && accessibleServices.slice(0, 5).map((service) => (
            <NavbarMenuItem key={`service-${service.service_id || service.id}`}>
              <Link
                color="foreground"
                href={`/server/${service.service_id || service.id}`}
                className="w-full py-2 font-medium text-sm"
                prefetch
              >
                {service.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="mt-4">
            <Button
              color="primary"
              className="w-full bg-black flex items-center justify-between gap-4 pr-1 h-[45px]"
              radius="full"
              onPress={onLogin || handleLogin}
            >
              <b className="text-md"> {userToken ? t("Dashboard") : t(signinText) }</b>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-[#9ab0f2] flex items-center justify-center rounded-full">
                <ArrowRightIcon
                  size={16}
                  className="transition-transform duration-200 ease-in-out group-hover:translate-x-[3px]"
                />
              </div>
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}

// Export the client component
export function Navigation(props: NavigationProps) {
  return <NavigationClient {...props} />;
}
