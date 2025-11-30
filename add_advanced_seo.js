const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';
const baseUrl = 'https://webpoptimizer.com';
const languages = ['es', 'fr', 'de', 'ar'];

const walk = (dir, callback) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && path.extname(file) === '.html') {
            callback(filepath);
        }
    });
};

walk(directoryPath, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine the relative path from the root
    // e.g. "index.html", "es/index.html", "jpg-to-webp.html"
    let relativePath = path.relative(directoryPath, filePath);

    // Determine the filename (e.g. "index.html", "jpg-to-webp.html")
    const fileName = path.basename(relativePath);

    // Determine the current language based on directory
    // If it's in root, lang is 'en'. If in 'es/', lang is 'es'.
    const pathParts = relativePath.split(path.sep);
    const currentLang = languages.includes(pathParts[0]) ? pathParts[0] : 'en';

    // Construct Canonical URL
    // If index.html, end with /
    // If other file, end with .html
    let canonicalPath = relativePath.split(path.sep).join('/');
    if (fileName === 'index.html') {
        // Remove index.html from end
        canonicalPath = canonicalPath.replace('index.html', '');
    }
    const canonicalUrl = `${baseUrl}/${canonicalPath}`;

    // Construct Hreflang Tags
    // We need tags for en, es, fr, de, ar, and x-default (en)
    let hreflangTags = '';

    // EN (x-default)
    let enPath = fileName === 'index.html' ? '' : fileName;
    hreflangTags += `    <link rel="alternate" hreflang="en" href="${baseUrl}/${enPath}" />\n`;
    hreflangTags += `    <link rel="alternate" hreflang="x-default" href="${baseUrl}/${enPath}" />\n`;

    // Other Langs
    languages.forEach(lang => {
        let langPath = fileName === 'index.html' ? `${lang}/` : `${lang}/${fileName}`;
        hreflangTags += `    <link rel="alternate" hreflang="${lang}" href="${baseUrl}/${langPath}" />\n`;
    });

    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;

    // Combine
    const seoTags = `
    ${canonicalTag}
${hreflangTags}`;

    // Insert before </head>
    // Check if tags already exist to avoid duplication (simple check)
    if (!content.includes('rel="canonical"')) {
        const updatedContent = content.replace('</head>', `${seoTags}</head>`);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Added SEO tags to ${relativePath}`);
    } else {
        console.log(`SEO tags already exist in ${relativePath}`);
    }
});
