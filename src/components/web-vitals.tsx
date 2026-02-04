'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
    useReportWebVitals((metric) => {
        // Send to Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', metric.name, {
                event_category: 'Web Vitals',
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                event_label: metric.id,
                non_interaction: true,
            })
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(metric)
        }
    })

    return null
}

// Extend window type for gtag
declare global {
    interface Window {
        gtag: (...args: any[]) => void
    }
}