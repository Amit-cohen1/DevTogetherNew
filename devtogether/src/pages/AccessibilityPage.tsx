import React from 'react'
import { Layout } from '../components/layout/Layout'

const AccessibilityPage: React.FC = () => {
    return (
        <Layout showNavbar showFooter>
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
                <h1 className="text-3xl font-bold mb-4">Accessibility Statement</h1>
                <p>
                    DevTogether is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>
                <h2 className="text-2xl font-semibold mt-6">Compliance Status</h2>
                <p>
                    The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. DevTogether aims to conform with WCAG 2.1 level AA and Israeli Standard 5568.
                </p>
                <h2 className="text-2xl font-semibold mt-6">Feedback</h2>
                <p>
                    We welcome your feedback on the accessibility of DevTogether. Please let us know if you encounter accessibility barriers:
                </p>
                <ul className="list-disc list-inside">
                    <li>Email: <a className="text-primary-600 hover:underline" href="mailto:devtogther@gmail.com">devtogther@gmail.com</a></li>
                </ul>
                <div dir="ltr">
                    <h2 className="text-2xl font-semibold mt-6">ברוכים הבאים – הצהרת נגישות</h2>
                    <p>
                        אתר DevTogether מחויב לאפשר שימוש נוח ונגיש לכלל האוכלוסייה, לרבות אנשים עם מוגבלות, בהתאם לתקנות נגישות השירות ותקן ישראלי 5568 (WCAG 2.0 AA).
                    </p>
                    <p>
                        במידה ונתקלתם בבעיה או ליקוי בנושא נגישות באתר, נשמח אם תעדכנו אותנו ונפעל לתקן זאת בהקדם:
                    </p>
                    <ul className="list-disc list-inside">
                        <li>דוא"ל: <a className="text-primary-600 hover:underline" href="mailto:devtogther@gmail.com">devtogther@gmail.com</a></li>
                    </ul>
                </div>
            </div>
        </Layout>
    )
}

export default AccessibilityPage 