/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://lavandacatering.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/api/*', '/maintenance', '/pesan/*', '/cek-pesanan/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/maintenance'],
      },
    ],
  },
}
