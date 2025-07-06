import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilitySettings {
    fontScale: number
    highContrast: boolean
    grayscale: boolean
    reduceMotion: boolean
    dyslexiaFont: boolean
}

interface AccessibilityContextValue extends AccessibilitySettings {
    setFontScale: (scale: number) => void
    toggleHighContrast: () => void
    toggleGrayscale: () => void
    toggleReduceMotion: () => void
    toggleDyslexiaFont: () => void
    /**
     * Whether the accessibility menu is currently open
     */
    menuOpen: boolean
    setMenuOpen: (open: boolean) => void

    triggerHidden: boolean
    toggleTriggerHidden: () => void
    resetSettings: () => void
}

const defaultSettings: AccessibilitySettings = {
    fontScale: 1,
    highContrast: false,
    grayscale: false,
    reduceMotion: false,
    dyslexiaFont: false
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

export const useAccessibility = (): AccessibilityContextValue => {
    const ctx = useContext(AccessibilityContext)
    if (!ctx) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider')
    }
    return ctx
}

const LOCAL_STORAGE_KEY = 'dt-accessibility'

function applySettings(settings: AccessibilitySettings) {
    const root = document.documentElement

    // Font scale via CSS var
    root.style.setProperty('--dt-font-scale', String(settings.fontScale))

    // toggle classes
    const classList = root.classList
    settings.highContrast ? classList.add('dt-high-contrast') : classList.remove('dt-high-contrast')
    settings.grayscale ? classList.add('dt-grayscale') : classList.remove('dt-grayscale')
    settings.reduceMotion ? classList.add('dt-reduce-motion') : classList.remove('dt-reduce-motion')
    settings.dyslexiaFont ? classList.add('dt-dyslexia') : classList.remove('dt-dyslexia')
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        if (typeof window === 'undefined') return defaultSettings
        try {
            const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
        } catch {
            return defaultSettings
        }
    })

    const [menuOpen, setMenuOpen] = useState(false)

    const [triggerHidden, setTriggerHidden] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false
        try {
            const stored = window.localStorage.getItem('dt-accessibility-trigger')
            return stored ? JSON.parse(stored) : false
        } catch {
            return false
        }
    })

    // Apply settings on mount & whenever they change
    useEffect(() => {
        applySettings(settings)
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
        } catch {
            // ignore
        }
    }, [settings])

    // Persist triggerHidden
    useEffect(() => {
        try {
            window.localStorage.setItem('dt-accessibility-trigger', JSON.stringify(triggerHidden))
        } catch {}
    }, [triggerHidden])

    // Keyboard shortcut Alt+0 to toggle menu
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.altKey && e.key === '0') {
                e.preventDefault()
                setMenuOpen(prev => !prev)
            }
            // Alt+1 shortcut removed (skip link no longer present)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const value: AccessibilityContextValue = {
        ...settings,
        setFontScale: (scale) => setSettings(s => ({ ...s, fontScale: Math.max(0.8, Math.min(scale, 2)) })),
        toggleHighContrast: () => setSettings(s => ({ ...s, highContrast: !s.highContrast })),
        toggleGrayscale: () => setSettings(s => ({ ...s, grayscale: !s.grayscale })),
        toggleReduceMotion: () => setSettings(s => ({ ...s, reduceMotion: !s.reduceMotion })),
        toggleDyslexiaFont: () => setSettings(s => ({ ...s, dyslexiaFont: !s.dyslexiaFont })),
        menuOpen,
        setMenuOpen,

        triggerHidden,
        toggleTriggerHidden: () => setTriggerHidden(prev => !prev),
        resetSettings: () => {
            setSettings(defaultSettings)
            setMenuOpen(false)
        }
    }

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    )
} 