const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';
const baseUrl = 'https://webpoptimizer.com'; // Placeholder domain
const languages = ['es', 'fr', 'de', 'ar'];

const getHtmlFiles = (dir, urlPrefix = '') => {
    let files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (languages.includes(item)) {
                files = files.concat(getHtmlFiles(fullPath, `${urlPrefix}/${item}`));
            }
        } else if (path.extname(item) === '.html') {
            let urlPath = item === 'index.html' ? '' : item;
            // Ensure we don't end up with trailing slash for root index if we don't want to, 
            // but usually / is better than /index.html

            let finalUrl = `${baseUrl}${urlPrefix}/${urlPath}`;

            // Clean up: if it ends in /, it's the index. 
            // If urlPath is empty, we have base + prefix + /.
            // If urlPath is file.html, we have base + prefix + / + file.html.

            // Actually, let's keep it simple:
            // root/index.html -> https://webpoptimizer.com/
            // root/file.html -> https://webpoptimizer.com/file.html
            // es/index.html -> https://webpoptimizer.com/es/
            // es/file.html -> https://webpoptimizer.com/es/file.html

            if (item === 'index.html') {
                finalUrl = `${baseUrl}${urlPrefix}/`;
            } else {
                finalUrl = `${baseUrl}${urlPrefix}/${item}`;
            }

            files.push({
                loc: finalUrl,
                lastmod: new Date().toISOString().split('T')[0],
                priority: item === 'index.html' ? '1.0' : '0.8'
            });
        }
    });
    return files;
};

const generateSitemap = () => {
    const urls = getHtmlFiles(directoryPath);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${url.loc}</loc>\n`;
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    fs.writeFileSync(path.join(directoryPath, 'sitemap.xml'), xml);
    console.log(`Sitemap generated with ${urls.length} URLs.`);
};

generateSitemap();
