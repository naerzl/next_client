/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(pdf|svg|docx|doc|xlsx)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "pdfs/[name].[ext]",
          },
        },
      ],
    })

    config.resolve.alias.canvas = false
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx", ".d.ts"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    }
    return config
  },
  transpilePackages: ["@zctc/edms-lrs-oauth1.0", "@zctc/edms-oauth2.0-npm"],
}

module.exports = nextConfig
