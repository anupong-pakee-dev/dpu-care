import { faFlag } from "@fortawesome/free-solid-svg-icons"

import LANGUAGES from "../Languages.json"

/**
 * Shared "something went wrong" toast: shows the generic error message,
 * lets the user flag a report of the raw error, and auto-hides after 10.5s.
 * Used by every failed API call across the app.
 */
export function useErrorToast(setToast, language) {
    return (err, userId) => {
        console.log(err)
        setToast({
            show: true,
            text: LANGUAGES.messages[language].error.mainerror,
            duration: 10000,
            status: "error",
            showIcon: true,
            icon: faFlag,
            flag: true,
            report: {
                "user_id": userId,
                "timestamp": Date(),
                "title": err.response?.statusText || err.message,
                "description": err.stack,
                "status": err.response?.status ?? err.status
            }
        })
        setTimeout(() => setToast({ "show": false }), 10500)
    }
}
