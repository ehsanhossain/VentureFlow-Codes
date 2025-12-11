import {
  DashboardIcon,
  SellerIcon,
  BuyerIcon,
  BuyerPartnerIcon,
  ProspectsIcon,
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
  subItems?: { label: string; path: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }[];
}

export const menuItems: MenuItem[] = [
  { icon: DashboardIcon, label: "Dashboard", path: "/" },
  {
    icon: ProspectsIcon,
    label: "Prospects",
    path: "/prospects",
    subItems: [
      { label: "Seller Register", path: "/seller-portal/add", icon: SellerIcon },
      { label: "Buyer Register", path: "/buyer-portal/create", icon: BuyerIcon },
    ],
  },
  { icon: CatalystIcon, label: "Deal Pipeline", path: "/deal-pipeline" },
  { icon: BuyerPartnerIcon, label: "Partner", path: "/partner-portal" },
  { icon: MatchIcon, label: "Valuation", path: "/match" },
  { icon: EmployeeIcon, label: "Employee", path: "/employee" },
  { icon: CountryIcon, label: "Country Book", path: "/country" },
  { icon: IndustryIcon, label: "Industry Book", path: "/industry" },
  { icon: CurrencyIcon, label: "Currency", path: "/currency" },
  { icon: SettingsIcon, label: "Settings", path: "/settings" },
];
