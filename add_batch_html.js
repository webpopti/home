const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';

const batchHtml = `
        <!-- Batch Section -->
        <div id="batchSection" class="batch-section hidden">
            <div class="batch-header">
                <h2>Batch Conversion</h2>
                <div class="batch-controls">
                    <button id="batchDownloadAllBtn" class="btn-primary btn-sm">Download All</button>
                    <button id="batchClearBtn" class="btn-secondary btn-sm">Clear All</button>
                </div>
            </div>
            <div id="batchList" class="batch-list">
                <!-- Batch Items will be added here -->
            </div>
        </div>`;

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

                // Insert after editor-section
                if (data.includes('id="editorSection"') && !data.includes('id="batchSection"')) {
                    const result = data.replace('</section>', '</section>' + batchHtml);
                    // Note: This might replace the wrong closing tag if not careful.
                    // editorSection ends with </section>.
                    // Let's be more specific.

                    const regex = /<section id="editorSection"[\s\S]*?<\/section>/;
                    const match = data.match(regex);

                    if (match) {
                        const newContent = data.replace(match[0], match[0] + batchHtml);
                        fs.writeFile(filePath, newContent, 'utf8', (err) => {
                            if (err) return console.log(err);
                            console.log(`Added batch section to ${file}`);
                        });
                    }
                }
            });
        }
    });
});
