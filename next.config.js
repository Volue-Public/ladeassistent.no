/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    i18n: {
        locales: ['default', 'nb', 'en'],
        defaultLocale: 'default',
        localeDetection: false,
    },
    devIndicators: false,
}

module.exports = nextConfig
