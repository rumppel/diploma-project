import React from 'react';
import { useEffect } from 'react';
const Sitemap = () => {
    const xmlData = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        <url>
        <loc>http://16.171.126.4/map</loc>
        <lastmod>2024-07-10T19:48:39+00:00</lastmod>
        </url>
        <url>
        <loc>http://16.171.126.4/</loc>
        <lastmod>2024-07-10T19:47:40+00:00</lastmod>
        </url>
        <url>
        <loc>http://16.171.126.4/statistics</loc>
        <lastmod>2024-07-10T19:47:40+00:00</lastmod>
        </url>
    </urlset>
    `;

return (
    <div>
        <pre>{xmlData}</pre>
    </div>
);
}

export default Sitemap;