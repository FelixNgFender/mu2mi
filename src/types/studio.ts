import type { Route } from "next";
import type { StaticImageData } from "next/image";
import type { JSX } from "react";

export interface NavItem<T extends string = string> {
  title: string;
  description?: string;
  href?: T;
  external?: boolean;
  icon?: JSX.Element;
  label?: string;
}

export interface NavItemWithChildren extends NavItem<Route> {
  items: NavItemWithChildren[];
}

export interface MainNavItem extends NavItem<Route> {}

export interface SidebarNavItem extends NavItemWithChildren {}

export type Preset = {
  id: string;
  icon: StaticImageData;
  name: string;
  description: string;
  labels: string[];
  onClick: () => void;
};
