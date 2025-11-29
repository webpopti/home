const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';
const languages = ['es', 'fr', 'de', 'ar'];

// Helper to clean up the footer text
const cleanFooterText = (html) => {
    // Fix the specific messed up credit text
    return html.replace(
        /<p>&copy; 2025 WebP Convertercopy; 2025 WebpOptimizercopy; 2025 WebpOptimizer\. All rights reserved\.<\/p>/g,
        '<p>&copy; 2025 WebpOptimizer. All rights reserved.</p>'
    ).replace(
        /<p>&copy; 2025 WebP Convertercopy; 2025 WebpOptimizercopy; 2025 WebpOptimizer\. Todos los derechos reservados\.<\/p>/g,
        '<p>&copy; 2025 WebpOptimizer. Todos los derechos reservados.</p>'
    ).replace(
        /<p>&copy; 2025 WebP Convertercopy; 2025 WebpOptimizercopy; 2025 WebpOptimizer\. Tous droits réservés\.<\/p>/g,
        '<p>&copy; 2025 WebpOptimizer. Tous droits réservés.</p>'
    ).replace(
        /<p>&copy; 2025 WebP Convertercopy; 2025 WebpOptimizercopy; 2025 WebpOptimizer\. Alle Rechte vorbehalten\.<\/p>/g,
        '<p>&copy; 2025 WebpOptimizer. Alle Rechte vorbehalten.</p>'
    ).replace(
        /<p>&copy; 2025 WebP Convertercopy; 2025 WebpOptimizercopy; 2025 WebpOptimizer\. جميع الحقوق محفوظة\.<\/p>/g,
        '<p>&copy; 2025 WebpOptimizer. جميع الحقوق محفوظة.</p>'
    );
};

// Helper to remove language switcher from navbar
const removeNavbarSwitcher = (html) => {
    // Regex to match the div with class lang-switcher in the navbar
    // It might have different content depending on the file
    const regex = /<div class="lang-switcher"[\s\S]*?<\/select>\s*<\/div>/;
    return html.replace(regex, '');
};

// Helper to add language switcher to footer
const addFooterSwitcher = (html, isRoot, currentLang) => {
    // Define the switcher HTML based on location
    let options = '';

    if (isRoot) {
        options = `
                    <option value="index.html" ${!currentLang ? 'selected' : ''}>English</option>
                    <option value="es/index.html">Español</option>
                    <option value="fr/index.html">Français</option>
                    <option value="de/index.html">Deutsch</option>
                    <option value="ar/index.html">العربية</option>`;
    } else {
        options = `
                    <option value="../index.html">English</option>
                    <option value="../es/index.html" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
                    <option value="../fr/index.html" ${currentLang === 'fr' ? 'selected' : ''}>Français</option>
                    <option value="../de/index.html" ${currentLang === 'de' ? 'selected' : ''}>Deutsch</option>
                    <option value="../ar/index.html" ${currentLang === 'ar' ? 'selected' : ''}>العربية</option>`;
    }

    const switcherHtml = `
            <div class="lang-switcher-footer" style="margin-top: 1rem;">
                <select onchange="location = this.value;" style="background: var(--glass-bg); color: var(--text-secondary); border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">
                    ${options}
                </select>
            </div>`;

    // Insert into footer. 
    // We look for the closing footer tag or the paragraph with copyright.
    // Let's insert it before the copyright paragraph.

    // Find the copyright paragraph
    const copyrightRegex = /<p>&copy; 2025 WebpOptimizer.*?<\/p>/;
    const match = html.match(copyrightRegex);

    if (match) {
        return html.replace(match[0], `${switcherHtml}\n            ${match[0]}`);
    } else {
        // Fallback: append to footer-links
        return html.replace('</div>', `</div>\n            ${switcherHtml}`);
    }
};

// Process Main Index
const mainIndexPath = path.join(directoryPath, 'index.html');
fs.readFile(mainIndexPath, 'utf8', (err, data) => {
    if (err) return console.log(err);

    let result = cleanFooterText(data);
    result = removeNavbarSwitcher(result);

    // Check if footer switcher already exists to avoid duplication
    if (!result.includes('class="lang-switcher-footer"')) {
        result = addFooterSwitcher(result, true, null);
    }

    fs.writeFile(mainIndexPath, result, 'utf8', (err) => {
        if (err) console.log(err);
        console.log('Updated main index.html');
    });
});

// Process Localized Indexes
languages.forEach(lang => {
    const langPath = path.join(directoryPath, lang, 'index.html');
    if (fs.existsSync(langPath)) {
        fs.readFile(langPath, 'utf8', (err, data) => {
            if (err) return console.log(err);

            let result = cleanFooterText(data);
            result = removeNavbarSwitcher(result);

            if (!result.includes('class="lang-switcher-footer"')) {
                result = addFooterSwitcher(result, false, lang);
            }

            fs.writeFile(langPath, result, 'utf8', (err) => {
                if (err) console.log(err);
                console.log(`Updated ${lang}/index.html`);
            });
        });
    }
});
