import { useCallback } from "react"
import { useTranslation } from "react-i18next"


export function useLanguage() {
  const { i18n } = useTranslation()

  const changeLanguage = useCallback(async (lang: string) => {
    await i18n.changeLanguage(lang)
  }, [i18n])

  return {
    currentLanguage: i18n.language?.slice(0, 2),
    changeLanguage,
  }
}