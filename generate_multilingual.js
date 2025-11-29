const fs = require('fs');
const path = require('path');

const translations = require('./translations.json');
const directoryPath = '/Users/zenpai/Desktop/webp';

// Map of HTML elements (selectors or content snippets) to translation keys
// This is a simplified approach. Ideally, we'd use data-i18n attributes, but we are working with existing HTML.
// We will perform string replacements on the HTML content.

const languages = ['es', 'fr', 'de', 'ar'];

languages.forEach(lang => {
    const langDir = path.join(directoryPath, lang);
    if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir);
    }

    // Read index.html as the base template
    const templatePath = path.join(directoryPath, 'index.html');
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) return console.log(err);

        let translatedHtml = data;
        const t = translations[lang];
        const en = translations['en'];

        // 1. Update HTML Lang Attribute and Direction
        if (lang === 'ar') {
            translatedHtml = translatedHtml.replace('<html lang="en">', `<html lang="${lang}" dir="rtl">`);
        } else {
            translatedHtml = translatedHtml.replace('<html lang="en">', `<html lang="${lang}">`);
        }

        // 2. Replace Text Content
        // We iterate through keys and replace the English text with the Target text.
        // Note: Order matters. Longer strings should be replaced first to avoid partial matches, 
        // but here we have specific keys.

        // Helper to replace safely
        const replaceText = (key) => {
            if (en[key] && t[key]) {
                // Escape special regex chars in source string
                const source = en[key].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(source, 'g');
                translatedHtml = translatedHtml.replace(regex, t[key]);
            }
        };

        Object.keys(en).forEach(key => {
            replaceText(key);
        });

        // 3. Fix Relative Paths
        // Since we are in a subdir, we need to update links to assets (css, js, images)
        // Simple heuristic: replace "style.css" with "../style.css", etc.
        const assets = ['style.css', 'script.js', 'logo.svg', 'favicon.ico', 'faq.webp', 'support-icon.webp'];
        assets.forEach(asset => {
            translatedHtml = translatedHtml.replace(new RegExp(`"${asset}"`, 'g'), `"../${asset}"`);
        });

        // Also fix links to other pages if they are not absolute
        // e.g. href="contact.html" -> href="../contact.html"
        // BUT, we might want to link to the localized version if it exists.
        // For now, let's link back to root for pages we haven't translated yet, 
        // OR generate localized versions of all pages.

        // Let's assume we only translate index.html for now as per the "create multi language" request usually implies the main entry.
        // If the user wants ALL pages, we should loop through all HTML files.

        // Fix nav links to point to root for now (or localized if we build them)
        // Let's build localized index.html first.

        const htmlFiles = ['jpg-to-webp.html', 'png-to-webp.html', 'gif-to-webp.html', 'contact.html', 'privacy.html', 'terms.html'];
        htmlFiles.forEach(file => {
            translatedHtml = translatedHtml.replace(new RegExp(`"${file}"`, 'g'), `"../${file}"`);
        });

        // 4. Add Language Switcher (Simple)
        // We'll inject it into the navbar
        const langSwitcherHtml = `
            <div class="lang-switcher" style="margin-left: 1rem; position: relative; display: inline-block;">
                <select onchange="location = this.value;" style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.5rem; border-radius: 8px;">
                    <option value="../index.html">English</option>
                    <option value="../es/index.html" ${lang === 'es' ? 'selected' : ''}>Español</option>
                    <option value="../fr/index.html" ${lang === 'fr' ? 'selected' : ''}>Français</option>
                    <option value="../de/index.html" ${lang === 'de' ? 'selected' : ''}>Deutsch</option>
                    <option value="../ar/index.html" ${lang === 'ar' ? 'selected' : ''}>العربية</option>
                </select>
            </div>
        `;

        // Insert before the More button container
        translatedHtml = translatedHtml.replace('<div class="nav-links">', `<div class="nav-links">${langSwitcherHtml}`);

        // Write the file
        fs.writeFile(path.join(langDir, 'index.html'), translatedHtml, 'utf8', (err) => {
            if (err) console.log(err);
            console.log(`Generated ${lang}/index.html`);
        });
    });
});

// Also update the main index.html to have the switcher
fs.readFile(path.join(directoryPath, 'index.html'), 'utf8', (err, data) => {
    if (err) return;

    if (!data.includes('class="lang-switcher"')) {
        const langSwitcherHtml = `
            <div class="lang-switcher" style="margin-left: 1rem; position: relative; display: inline-block;">
                <select onchange="location = this.value;" style="background: transparent; color: var(--text-primary); border: 1px solid var(--glass-border); padding: 0.5rem; border-radius: 8px;">
                    <option value="index.html" selected>English</option>
                    <option value="es/index.html">Español</option>
                    <option value="fr/index.html">Français</option>
                    <option value="de/index.html">Deutsch</option>
                    <option value="ar/index.html">العربية</option>
                </select>
            </div>
        `;
        const result = data.replace('<div class="nav-links">', `<div class="nav-links">${langSwitcherHtml}`);
        fs.writeFile(path.join(directoryPath, 'index.html'), result, 'utf8', (err) => {
            if (err) console.log(err);
            console.log('Updated main index.html with language switcher');
        });
    }
});
