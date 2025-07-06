import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop resets the window scroll position to the top on every
 * navigation change. It renders nothing.
 */
export const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}
