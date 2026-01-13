import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/editor/'],
        },
        sitemap: 'https://3dreadyrender.com/sitemap.xml',
    }
}
