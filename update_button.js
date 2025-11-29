const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';

// New More Button HTML (Icon Only)
const newMoreButtonHtml = `
            <button class="more-btn" id="moreBtn" aria-label="More Tools">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>`;

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(directoryPath, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.log(err);
                }

                let result = data;

                // Replace the old More button with the new icon-only one
                // Regex to match the button regardless of whitespace or specific SVG content
                const buttonRegex = /<button class="more-btn" id="moreBtn">[\s\S]*?<\/button>/;

                if (buttonRegex.test(result)) {
                    result = result.replace(buttonRegex, newMoreButtonHtml);

                    fs.writeFile(filePath, result, 'utf8', (err) => {
                        if (err) return console.log(err);
                        console.log(`Updated More button in ${file}`);
                    });
                } else {
                    console.log(`More button not found in ${file}`);
                }
            });
        }
    });
});
