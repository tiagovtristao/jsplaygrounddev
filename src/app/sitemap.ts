import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.jsplayground.dev',
      lastModified: new Date(),
    },
  ];
}
