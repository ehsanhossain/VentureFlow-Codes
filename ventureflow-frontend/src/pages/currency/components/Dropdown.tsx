import { useState, useRef, useEffect } from "react";
import { SearchIcon } from "lucide-react";

export interface Country {
  id: number;
  name: string;
  flagSrc: string;
  status: "registered" | "unregistered";
}

type DropdownProps = {
  countries: Country[];
  selected?: Country | null;
  onSelect: (country: Country) => void;
};

export const Dropdown = ({
  countries,
  selected,
  onSelect,
}: DropdownProps): JSX.Element => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    selected ?? null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCountry(selected ?? null);
  }, [selected]);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onSelect?.(country);
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

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full h-10 items-center gap-2 px-4 sm:px-5 py-2 rounded-md border border-slate-300 bg-white focus:outline-none"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCountry?.flagSrc ? (
              <img
                className="w-6 h-6 sm:w-[26px] sm:h-[26px]"
                alt="Selected country flag"
                src={selectedCountry.flagSrc}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
              >
                <path
                  d="M23.4361 8.74582C23.9713 10.0573 24.2667 11.493 24.2667 13H26C26 11.2647 25.6595 9.60673 25.0409 8.0909L23.4361 8.74582ZM24.2667 13C24.2667 13.8005 24.1834 14.5806 24.0252 15.3324L25.7213 15.6893C25.9041 14.8208 26 13.9212 26 13H24.2667ZM24.0252 15.3324C23.1098 19.6822 19.6823 23.1098 15.3324 24.0252L15.6893 25.7213C20.7116 24.6645 24.6645 20.7116 25.7213 15.6893L24.0252 15.3324ZM15.3324 24.0252C14.5806 24.1834 13.8005 24.2667 13 24.2667V26C13.9212 26 14.8208 25.9041 15.6893 25.7213L15.3324 24.0252ZM13 24.2667C12.1994 24.2667 11.4194 24.1834 10.6676 24.0252L10.3107 25.7213C11.1791 25.9041 12.0788 26 13 26V24.2667ZM1.73333 13C1.73333 11.4919 2.02917 10.0551 2.56517 8.74275L0.960521 8.08735C0.341004 9.60413 0 11.2633 0 13H1.73333ZM10.6676 24.0252C6.3177 23.1098 2.89018 19.6822 1.97488 15.3324L0.278689 15.6893C1.33549 20.7116 5.28837 24.6645 10.3107 25.7213L10.6676 24.0252ZM1.97488 15.3324C1.81668 14.5806 1.73333 13.8005 1.73333 13H0C0 13.9212 0.0959458 14.8208 0.278689 15.6893L1.97488 15.3324ZM2.56517 8.74275C3.96017 5.3273 6.98396 2.74999 10.6676 1.97488L10.3107 0.278689C6.05548 1.17407 2.5696 4.14776 0.960521 8.08735L2.56517 8.74275ZM10.6676 1.97488C11.4194 1.81668 12.1994 1.73333 13 1.73333V0C12.0788 0 11.1791 0.0959458 10.3107 0.278689L10.6676 1.97488ZM13 1.73333C13.8005 1.73333 14.5806 1.81668 15.3324 1.97488L15.6893 0.27869C14.8208 0.0959469 13.9212 0 13 0V1.73333ZM15.3324 1.97488C19.0171 2.75022 22.0416 5.32884 23.4361 8.74582L25.0409 8.0909C23.4325 4.14955 19.9458 1.17433 15.6893 0.27869L15.3324 1.97488ZM14.6853 1.39024C15.0201 2.43984 16.2604 6.47829 16.7688 10.1899L18.4861 9.95466C17.9562 6.0859 16.6762 1.92787 16.3366 0.863339L14.6853 1.39024ZM16.7688 10.1899C16.9052 11.1849 16.9867 12.1412 16.9867 13H18.72C18.72 12.0387 18.6293 10.9997 18.4861 9.95466L16.7688 10.1899ZM23.8879 7.62946C22.5555 8.03356 20.0527 8.7434 17.4703 9.22002L17.7848 10.9246C20.4586 10.4311 23.0313 9.70058 24.391 9.28818L23.8879 7.62946ZM17.4703 9.22002C15.9038 9.50911 14.338 9.70667 13 9.70667V11.44C14.4877 11.44 16.1697 11.2226 17.7848 10.9246L17.4703 9.22002ZM16.9867 13C16.9867 14.2722 16.808 15.7511 16.5414 17.242L18.2477 17.5471C18.5232 16.0066 18.72 14.4158 18.72 13H16.9867ZM16.5414 17.242C15.9572 20.5102 14.9757 23.6996 14.6853 24.6098L16.3366 25.1367C16.6342 24.2038 17.6431 20.9286 18.2477 17.5471L16.5414 17.242ZM24.6098 14.6853C23.6996 14.9757 20.5102 15.9572 17.242 16.5414L17.5471 18.2477C20.9286 17.6431 24.2038 16.6342 25.1367 16.3366L24.6098 14.6853ZM17.242 16.5414C15.7511 16.808 14.2722 16.9867 13 16.9867V18.72C14.4158 18.72 16.0066 18.5232 17.5471 18.2477L17.242 16.5414ZM13 16.9867C11.7278 16.9867 10.2489 16.808 8.75792 16.5414L8.45284 18.2477C9.99333 18.5232 11.5842 18.72 13 18.72V16.9867ZM8.75792 16.5414C5.48977 15.9572 2.30032 14.9757 1.39024 14.6853L0.863339 16.3366C1.79616 16.6342 5.07142 17.6431 8.45284 18.2477L8.75792 16.5414ZM7.28 13C7.28 14.4158 7.47681 16.0066 7.75224 17.5471L9.45852 17.242C9.19194 15.7511 9.01333 14.2722 9.01333 13H7.28ZM7.75224 17.5471C8.35684 20.9286 9.36582 24.2038 9.66346 25.1367L11.3147 24.6098C11.0243 23.6996 10.0429 20.5102 9.45852 17.242L7.75224 17.5471ZM9.66346 0.863339C9.3238 1.92787 8.04382 6.0859 7.51383 9.95466L9.23111 10.1899C9.73959 6.47829 10.9799 2.43984 11.3147 1.39024L9.66346 0.863339ZM7.51383 9.95466C7.37067 10.9997 7.28 12.0387 7.28 13H9.01333C9.01333 12.1412 9.09482 11.1849 9.23111 10.1899L7.51383 9.95466ZM13 9.70667C11.662 9.70667 10.0962 9.50911 8.52976 9.22002L8.21518 10.9246C9.83028 11.2226 11.5123 11.44 13 11.44V9.70667ZM8.52976 9.22002C5.94633 8.74322 3.44264 8.03305 2.1107 7.62904L1.60756 9.28774C2.96689 9.70006 5.54039 10.4309 8.21518 10.9246L8.52976 9.22002ZM23.8391 7.6492C23.8529 7.64204 23.8697 7.63498 23.8879 7.62946L24.391 9.28818C24.4781 9.26176 24.5601 9.22791 24.6378 9.18752L23.8391 7.6492ZM1.31069 9.15442C1.40194 9.21022 1.50093 9.2554 1.60756 9.28774L2.1107 7.62904C2.14914 7.6407 2.18455 7.65706 2.215 7.67569L1.31069 9.15442Z"
                  fill="#727272"
                />
              </svg>
            )}
            <span className="font-medium text-[#30313d] text-sm sm:text-base leading-5 truncate max-w-[150px] sm:max-w-none">
              {selectedCountry?.name || "Select a country"}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transform transition-transform ${
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
        </div>
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
                placeholder="Search Here"
              />
            </div>

      
            <div className="w-full max-h-[60vh] overflow-y-auto pr-1.5">
              <div className="flex flex-col w-full items-start gap-3">
                {filteredCountries.map((country) => (
                  <button
                    key={country.id.toString()}
                    className="flex items-center justify-between w-full hover:bg-gray-100 px-2 py-2 rounded-md transition text-left"
                    onClick={() => handleSelect(country)}
                  >
                    <div className="flex items-center gap-2.5">
                      {country.name === "European Union" ? (
                        <div className="relative w-6 h-6 bg-[url(/vector.svg)] bg-cover">
                          <div className="relative h-full">
                            <img
                              className="absolute w-[25px] h-[25px] top-0 left-0"
                              alt="EU flag"
                              src="/group-2.png"
                            />
                            <img
                              className="absolute w-6 h-6 top-0 left-0"
                              alt="EU flag"
                              src="/group-3.png"
                            />
                          </div>
                        </div>
                      ) : (
                        <img
                          className="w-6 h-6"
                          alt={`${country.name} flag`}
                          src={country.flagSrc}
                        />
                      )}
                      <span className="text-[#30313d] text-sm sm:text-base">
                        {country.name}
                      </span>
                    </div>

                    {country.status === "registered" ? (
                      <div className="flex items-center gap-2 px-3 py-0.5 bg-[#e8f4ff] text-[#064771] rounded-full border border-[#064771] text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                        >
                          <circle
                            cx="6.26953"
                            cy="6.5"
                            r="5.5"
                            stroke="#064771"
                          />
                          <path
                            d="M3.87305 7.01204L5.22305 8.29775L9.27305 4.69775"
                            stroke="#064771"
                            strokeLinecap="square"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Registered
                      </div>
                    ) : (
                      <div className="px-3 py-0.5 bg-[#f7f7f7] text-[#717171] rounded-full border border-[#717171] text-xs">
                        Unregistered
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
