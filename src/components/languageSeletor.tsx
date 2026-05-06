import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="dropdown dropdown-end">
      {/* Trigger */}
      <label tabIndex={0} className="flex">
        <Languages className="h-4 w-4 mr-2" />
        Language
      </label>

      {/* Menu */}
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li className="menu-title">
          <span>Select Language</span>
        </li>

        <li>
          <button onClick={() => changeLanguage("en")}>
            🇺🇸 English
          </button>
        </li>

        <li>
          <button onClick={() => changeLanguage("fr")}>
            🇫🇷 Français
          </button>
        </li>
      </ul>
    </div>
  )
}