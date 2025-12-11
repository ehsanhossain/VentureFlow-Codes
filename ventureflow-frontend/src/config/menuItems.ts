import {
  DashboardIcon,
  SellerIcon,
  BuyerIcon,
  BuyerPartnerIcon,

  CatalystIcon,
  MatchIcon,
  EmployeeIcon,
  CountryIcon,
  IndustryIcon,
  CurrencyIcon,
  SettingsIcon,
} from "../assets/icons";
import React from 'react';

export interface MenuItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  path?: string;
}

export const menuItems: MenuItem[] = [
  { icon: DashboardIcon, label: "Dashboard", path: "/" },
  { icon: SellerIcon, label: "Seller", path: "/seller-portal" },
  { icon: BuyerIcon, label: "Buyer", path: "/buyer-portal" },
  { icon: BuyerPartnerIcon, label: "Partner", path: "/partner-portal" },
  { icon: CatalystIcon, label: "Catalyst", path: "/catalyst" },
  { icon: MatchIcon, label: "Valuation", path: "/match" },
  { icon: EmployeeIcon, label: "Employee", path: "/employee" },
  { icon: CountryIcon, label: "Country Book", path: "/country" },
  { icon: IndustryIcon, label: "Industry Book", path: "/industry" },
  { icon: CurrencyIcon, label: "Currency", path: "/currency" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
];
