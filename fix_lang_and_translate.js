const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';
const languages = ['es', 'fr', 'de', 'ar'];

// Helper to remove language switcher from footer (if it exists in the wrong place)
const removeFooterSwitcher = (html) => {
    const regex = /<div class="lang-switcher-footer"[\s\S]*?<\/select>\s*<\/div>/;
    return html.replace(regex, '');
};

// Helper to add language switcher beside "Contact Us" in footer links
const addSwitcherToLinks = (html, isRoot, currentLang) => {
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
                <div class="lang-switcher-inline" style="display: inline-block; margin-left: 1rem;">
                    <select onchange="location = this.value;" style="background: transparent; color: var(--text-secondary); border: none; font-size: 0.9rem; cursor: pointer;">
                        ${options}
                    </select>
                </div>`;

    // Insert into footer-links, after the last link (Contact Us)
    // We look for the closing div of footer-links
    return html.replace('</div>', `${switcherHtml}\n            </div>`);
};

// Helper to translate the missing section
const translateMissingSection = (html, lang) => {
    const translations = {
        'es': {
            'WebpOptimizer': 'WebpOptimizer',
            'Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.': 'Transforma tus imágenes al formato WebP altamente optimizado al instante. Seguro, desde el cliente y ultrarrápido.'
        },
        'fr': {
            'WebpOptimizer': 'WebpOptimizer',
            'Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.': 'Transformez vos images au format WebP hautement optimisé instantanément. Sécurisé, côté client et ultra-rapide.'
        },
        'de': {
            'WebpOptimizer': 'WebpOptimizer',
            'Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.': 'Verwandeln Sie Ihre Bilder sofort in das hochoptimierte WebP-Format. Sicher, clientseitig und blitzschnell.'
        },
        'ar': {
            'WebpOptimizer': 'WebpOptimizer',
            'Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.': 'حول صورك إلى تنسيق WebP عالي التحسين على الفور. آمن، من جانب العميل، وسريع للغاية.'
        }
    };

    if (translations[lang]) {
        let result = html;
        // The title might have a span, so we target the text parts or the whole block if possible.
        // The hero title is: <h1>Webp<span class="gradient-text">Optimizer</span></h1>
        // The description is: <p>Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.</p>

        // We already have a key for hero_desc in translations.json, but maybe it wasn't applied correctly or the source text didn't match exactly due to newlines/spaces.
        // Let's force replace the description paragraph content.

        const descRegex = /<p>Transform your images into highly optimized WebP format instantly\. Secure, client-side, and lightning\s*fast\.<\/p>/;
        const targetDesc = translations[lang]['Transform your images into highly optimized WebP format instantly. Secure, client-side, and lightning fast.'];

        if (descRegex.test(result)) {
            result = result.replace(descRegex, `<p>${targetDesc}</p>`);
        }

        return result;
    }
    return html;
};

// Process Main Index
const mainIndexPath = path.join(directoryPath, 'index.html');
fs.readFile(mainIndexPath, 'utf8', (err, data) => {
    if (err) return console.log(err);

    let result = removeFooterSwitcher(data);

    // Check if inline switcher already exists
    if (!result.includes('class="lang-switcher-inline"')) {
        result = addSwitcherToLinks(result, true, null);
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

            let result = removeFooterSwitcher(data);

            if (!result.includes('class="lang-switcher-inline"')) {
                result = addSwitcherToLinks(result, false, lang);
            }

            // Apply missing translation
            result = translateMissingSection(result, lang);

            fs.writeFile(langPath, result, 'utf8', (err) => {
                if (err) console.log(err);
                console.log(`Updated ${lang}/index.html`);
            });
        });
    }
});
