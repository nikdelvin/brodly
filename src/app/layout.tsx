/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Brodly Live Streaming',
    description: 'Stylish, modern, high-secure and fully anonymous live streaming platform for everyone',
    icons: [{ rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }]
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
