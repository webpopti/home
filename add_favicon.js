const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/zenpai/Desktop/webp';
const faviconTag = '<link rel="icon" type="image/svg+xml" href="logo.svg">';

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

                // Check if favicon already exists
                if (!data.includes('rel="icon"')) {
                    // Insert before </head>
                    const result = data.replace('</head>', `    ${faviconTag}\n</head>`);

                    fs.writeFile(filePath, result, 'utf8', (err) => {
                        if (err) return console.log(err);
                        console.log(`Added favicon to ${file}`);
                    });
                } else {
                    console.log(`Favicon already exists in ${file}`);
                }
            });
        }
    });
});
