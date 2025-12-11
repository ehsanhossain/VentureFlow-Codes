import CartIcon from "./svg/CartIcon";
import InterestedIcon from "./svg/InterestedIcon";
import NotInterestedIcon from "./svg/NotInterestedIcon";
import ClosedDealsIcon from "./svg/ClosedDealsIcon";
import DraftsIcon from "./svg/DraftsIcon";
import FromPartnersIcon from "./svg/FromPartnersIcon";

export const getTabsData = ({
  sellersCount = 0,
  interestedCount = 0,
  notInterestedCount = 0,
}) => [
  {
    id: "all-sellers",
    label: "All Sellers",
    count: sellersCount,
    activeIcon: <CartIcon isActive={true} />,
    inactiveIcon: <CartIcon isActive={false} />,
  },
  {
    id: "interested",
    label: "Interested",
    count: interestedCount,
    activeIcon: <InterestedIcon isActive={true} />,
    inactiveIcon: <InterestedIcon isActive={false} />,
  },
  {
    id: "not-interested",
    label: "Not Interested",
    count: notInterestedCount,
    activeIcon: <NotInterestedIcon isActive={true} />,
    inactiveIcon: <NotInterestedIcon isActive={false} />,
  },
  {
    id: "closed-deals",
    label: "Closed Deals",
    activeIcon: <FromPartnersIcon isActive={true} />,
    inactiveIcon: <FromPartnersIcon isActive={false} />,
  },
  {
    id: "drafts",
    label: "Drafts",
    activeIcon: <DraftsIcon isActive={true} />,
    inactiveIcon: <DraftsIcon isActive={false} />,
  },
  {
    id: "from-partners",
    label: "From Partners",
    activeIcon: <ClosedDealsIcon isActive={true} />,
    inactiveIcon: <ClosedDealsIcon isActive={false} />,
  },
];
