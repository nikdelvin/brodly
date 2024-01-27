/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: false,
    env: {
        GOOGLE_APPLICATION_CREDENTIALS: './credentials.json',
    }
}

module.exports = nextConfig
