/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    webpack: (config) => {
        config.resolve.extensionAlias = {
            ".js": [".ts", ".tsx", ".js", ".jsx", '.d.ts'],
            ".mjs": [".mts", ".mjs"],
            ".cjs": [".cts", ".cjs"],

        };
        return config;
    },
    transpilePackages: ['@zctc/edms-lrs-oauth1.0', '@zctc/edms-oauth2.0-npm']
}

module.exports = nextConfig
