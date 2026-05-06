"use client"

import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Languages className="h-4 w-4 mr-2" />
          Language
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={i18n.language}
          onValueChange={(value) => i18n.changeLanguage(value)}
        >
          <DropdownMenuRadioItem value="en">🇺🇸 English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fr">🇫🇷 Français</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="es">🇪🇸 Español</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="de">🇩🇪 Deutsch</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ja">🇯🇵 日本語</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="zh">🇨🇳 中文</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}