// import { Languages } from "lucide-react"
// import { useTranslation } from "react-i18next"

// export default function LanguageSwitcher() {
//   const { i18n } = useTranslation()

//   const changeLanguage = (lng: string) => {
//     i18n.changeLanguage(lng)
//   }

//   return (
//     <div className="dropdown dropdown-end">
//       {/* Trigger */}
//       <label tabIndex={0} className="flex">
//         <Languages className="h-4 w-4 mr-2" />
//         Language
//       </label>

//       {/* Menu */}
//       <ul
//         tabIndex={0}
//         className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
//       >
//         <li className="menu-title">
//           <span>Select Language</span>
//         </li>

//         <li>
//           <button onClick={() => changeLanguage("en")}>
//             🇺🇸 English
//           </button>
//         </li>

//         <li>
//           <button onClick={() => changeLanguage("fr")}>
//             🇫🇷 Français
//           </button>
//         </li>
//       </ul>
//     </div>
//   )
// }
import { Languages, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "./hooks/languague"


const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleChange = async (code: string) => {
    if (code === currentLanguage) return
    setLoading(true)
    try {
      await changeLanguage(code)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 cursor-pointer">
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Languages className="h-4 w-4" />
        }
        <span className="hidden sm:inline">
          {LANGUAGES.find((l) => l.code === currentLanguage)?.label ?? "Language"}
        </span>
      </label>

      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44 mt-1"
      >
        {LANGUAGES.map(({ code, label, flag }) => (
          <li key={code}>
            <button
              onClick={() => handleChange(code)}
              disabled={loading}
              className={currentLanguage === code ? "active" : ""}
            >
              <span>{flag}</span>
              <span>{label}</span>
              {currentLanguage === code && <Check className="h-3 w-3 ml-auto" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}