import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, CheckIcon, XIcon } from "lucide-react";

export interface Industry {
  id: number;
  name: string;
}

type DropdownProps = {
  industries: Industry[];
  selected?: Industry | Industry[] | null;
  onSelect: (industry: Industry | Industry[]) => void;
  multiSelect?: boolean;
};

export const IndustryDropdown = ({
  industries,
  selected,
  onSelect,
  multiSelect = false,
}: DropdownProps): JSX.Element => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<Industry[]>(() => {
    if (Array.isArray(selected)) {
      return selected.filter((item): item is Industry => item !== null && item !== undefined);
    }
    return selected ? [selected] : [];
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      if (Array.isArray(selected)) {
        setSelectedIndustries(selected.filter((item): item is Industry => item !== null && item !== undefined));
      } else {
        setSelectedIndustries([selected]);
      }
    } else {
      setSelectedIndustries([]);
    }
  }, [selected]);

  const filteredIndustries = industries
    .filter((industry): industry is Industry =>
      industry !== null &&
      industry !== undefined &&
      typeof industry.name === 'string'
    )
    .filter((industry) =>
      industry.name.toLowerCase().includes(search.toLowerCase())
    );

  const handleSelect = (industry: Industry) => {
    if (multiSelect) {
      const exists = selectedIndustries.some((i) => i.id === industry.id);
      const newSelected = exists
        ? selectedIndustries.filter((i) => i.id !== industry.id)
        : [...selectedIndustries, industry];
      setSelectedIndustries(newSelected);
      onSelect(newSelected);
    } else {
      setSelectedIndustries([industry]);
      setIsOpen(false);
      onSelect(industry);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSelected = (industry: Industry) =>
    selectedIndustries.some((i) => i.id === industry.id);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full min-h-10 items-center gap-2 px-4 py-2 rounded-md border border-slate-300 bg-white focus:outline-none flex-wrap overflow-hidden"
      >
        {selectedIndustries.length > 0 ? (
          multiSelect ? (
            <div className="flex flex-wrap gap-2 items-center overflow-hidden">
              {selectedIndustries.map((industry) => (
                <span
                  key={industry.id.toString()}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-[#30313d] max-w-full truncate"
                >
                  <span className="truncate">{industry.name}</span>
                  <XIcon
                    className="w-3 h-3 ml-1 cursor-pointer shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(industry);
                    }}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-[#30313d] truncate">
              {selectedIndustries[0]?.name}
            </span>
          )
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {multiSelect ? "Select industries" : "Select an industry"}
          </div>
        )}
        <svg
          className={`w-4 h-4 ml-auto text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-[80vh] rounded-md border border-t-0 border-slate-300 bg-white overflow-hidden shadow-lg">
          <div className="flex flex-col w-full items-start gap-4 px-4 py-3">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-10 pr-3 py-2 rounded-full border border-[#828282] text-sm placeholder:text-[#828282] focus:outline-none"
                placeholder="Search industry..."
              />
            </div>

            <div className="flex flex-col w-full max-h-60 overflow-y-auto">
              {filteredIndustries.map((industry) => (
                <button
                  key={industry.id.toString()}
                  type="button"
                  onClick={() => handleSelect(industry)}
                  className="flex items-center w-full justify-start gap-3 py-2 px-2 hover:bg-gray-100 rounded-md transition"
                >
                  {multiSelect && (
                    <div
                      className={`w-5 h-5 flex items-center justify-center border rounded mr-3 flex-shrink-0 ${
                        isSelected(industry)
                          ? "bg-[#064771] border-[#064771] text-white"
                          : "border-gray-400"
                      }`}
                    >
                      {isSelected(industry) && (
                        <CheckIcon className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  <span className="text-sm text-[#30313d] truncate">
                    {industry.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};