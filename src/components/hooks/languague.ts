// import { useApolloClient } from "@apollo/client/react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"


export function useLanguage() {
  const { i18n } = useTranslation()
  // const apollo = useApolloClient()

  const changeLanguage = useCallback(async (lang: string) => {
    // 1. Changer la langue i18next immédiatement (UI réactive)
    await i18n.changeLanguage(lang)

    // 2. Vider le cache Apollo → les prochaines requêtes
    //    partiront avec le nouvel Accept-Language (injecté par authLink)
    // await apollo.resetStore()
  }, [i18n])

  return {
    currentLanguage: i18n.language?.slice(0, 2),
    changeLanguage,
  }
}