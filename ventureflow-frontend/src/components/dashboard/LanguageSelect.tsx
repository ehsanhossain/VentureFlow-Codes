import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const languages = [
  { code: "EN", name: "English", flag: "https://c.animaapp.com/WGSaaZmB/img/group@2x.png" },
  // { code: "JP", name: "日本語", flag: "https://c.animaapp.com/WGSaaZmB/img/japan-flag.svg" },
  // { code: "TH", name: "ไทย", flag: "https://c.animaapp.com/WGSaaZmB/img/thailand-flag.svg" },
  // { code: "CN", name: "中文", flag: "https://c.animaapp.com/WGSaaZmB/img/china-flag.svg" },
  // { code: "VN", name: "Tiếng Việt", flag: "https://c.animaapp.com/WGSaaZmB/img/vietnam-flag.svg" },
  // { code: "ID", name: "Bahasa", flag: "https://c.animaapp.com/WGSaaZmB/img/indonesia-flag.svg" }
];

export const LanguageSelect: React.FC = () => { 
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  
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
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Language Selector */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-[#033351] rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img className="w-6 h-6" src={selectedLanguage.flag} alt={selectedLanguage.name} />
        <span className="text-white text-sm font-medium">{selectedLanguage.code}</span>
        <ChevronDown className="text-white w-4 h-4" />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 bg-[#F7F7F7] rounded-b-[8.433px] shadow-lg overflow-y-auto scrollbar-custom"
          style={{
            minWidth: "150px",
            maxHeight: "220px",
            padding: "18.553px 7.59px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderRadius: "0px 0px 8.433px 8.433px",
            background: "#F7F7F7"
          }}
        >
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                setSelectedLanguage(lang);
                setIsOpen(false);
              }}
            >
              <img className="w-6 h-6" src={lang.flag} alt={lang.name} />
              <span className="text-[#30313D] text-sm font-medium">{lang.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Custom Scrollbar CSS */}
      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LanguageSelect;
