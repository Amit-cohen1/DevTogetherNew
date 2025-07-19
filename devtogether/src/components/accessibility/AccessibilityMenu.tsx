import React from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { cn } from '../../utils/cn'
import { Accessibility as AccessibilityIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export const AccessibilityMenu: React.FC = () => {
    const {
        menuOpen,
        setMenuOpen,
        fontScale,
        setFontScale,
        highContrast,
        toggleHighContrast,
        grayscale,
        toggleGrayscale,
        reduceMotion,
        toggleReduceMotion,
        dyslexiaFont,
        toggleDyslexiaFont,
        triggerHidden,
        toggleTriggerHidden,
        resetSettings
    } = useAccessibility()

    const fontPercent = Math.round(fontScale * 100)

    const Button: React.FC<{ onClick: () => void; label: string; active?: boolean }> = ({ onClick, label, active }) => (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-4 py-2 rounded hover:bg-primary-100 dark:hover:bg-secondary-700',
                active ? 'bg-primary-100 dark:bg-secondary-700 font-semibold' : ''
            )}
        >
            {label}
        </button>
    )

    return (
        <>
            {/* Trigger Button or Hidden Tab */}
            {!triggerHidden ? (
                <div className="fixed bottom-4 right-4 z-50">
                    <button
                        aria-label="Accessibility menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="relative rounded-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white w-14 h-14 flex items-center justify-center shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-300 transition-transform active:scale-95"
                    >
                        <AccessibilityIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                    {/* hide arrow - separate button */}
                    <button
                        aria-label="Hide accessibility button"
                        onClick={toggleTriggerHidden}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 w-5 h-5 flex items-center justify-center rounded-full shadow z-10"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={toggleTriggerHidden}
                    aria-label="Show accessibility menu"
                    className="fixed bottom-4 right-0 z-50 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 text-white px-2 py-4 rounded-l-lg shadow-xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary-300"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Menu */}
            {menuOpen && (
                <div
                    className="fixed bottom-24 right-4 z-50 w-80 bg-white/95 dark:bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="pb-3 flex justify-between items-center border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Accessibility Settings</h2>
                        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="text-2xl leading-none hover:text-red-500">×</button>
                    </div>
                    <div className="py-4 space-y-1">
                        <div className="px-2 flex items-center justify-between">
                            <span>Font size ({fontPercent}%)</span>
                            <div className="flex gap-2">
                                <button
                                    className="px-2 py-1 border rounded hover:bg-gray-100"
                                    onClick={() => setFontScale(fontScale - 0.1)}
                                    aria-label="Decrease font size"
                                >
                                    A-
                                </button>
                                <button
                                    className="px-2 py-1 border rounded hover:bg-gray-100"
                                    onClick={() => setFontScale(fontScale + 0.1)}
                                    aria-label="Increase font size"
                                >
                                    A+
                                </button>
                            </div>
                        </div>
                        <Button onClick={toggleHighContrast} label="High contrast" active={highContrast} />
                        <Button onClick={toggleGrayscale} label="Grayscale" active={grayscale} />
                        <Button onClick={toggleReduceMotion} label="Reduce motion" active={reduceMotion} />
                        <Button onClick={toggleDyslexiaFont} label="Dyslexia-friendly font" active={dyslexiaFont} />
                        <Button onClick={toggleTriggerHidden} label={triggerHidden ? 'Show floating button' : 'Hide floating button'} />
                        <Button onClick={resetSettings} label="Reset to defaults" />
                        <a
                            href="/accessibility"
                            className="block text-center text-primary-600 mt-3 hover:underline"
                        >
                            Accessibility statement
                        </a>
                    </div>
                </div>
            )}
        </>
    )
} 