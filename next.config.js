/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
        GOOGLE_APPLICATION_CREDENTIALS: './credentials.json',
    }
}

module.exports = nextConfig
