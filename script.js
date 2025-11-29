document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const editorSection = document.getElementById('editorSection');
    const batchSection = document.getElementById('batchSection');
    const batchList = document.getElementById('batchList');

    // Single Mode Elements
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const compressedInfo = document.getElementById('compressedInfo');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Batch Mode Elements
    const batchQualitySlider = document.getElementById('batchQualitySlider');
    const batchQualityValue = document.getElementById('batchQualityValue');
    const batchDownloadAllBtn = document.getElementById('batchDownloadAllBtn');
    const batchClearBtn = document.getElementById('batchClearBtn');

    let currentFile = null;
    let originalImage = null;
    let batchFiles = [];

    // Configuration
    const config = window.conversionConfig || {
        targetFormat: 'image/webp',
        extension: 'webp',
        label: 'WebP'
    };

    // Update UI labels based on config
    const compressedLabel = document.querySelector('.image-wrapper .label:nth-of-type(1)');
    if (document.getElementById('compressedPreview') && document.getElementById('compressedPreview').previousElementSibling) {
        document.getElementById('compressedPreview').previousElementSibling.textContent = `Compressed (${config.label})`;
    }
    if (downloadBtn) downloadBtn.textContent = `Download ${config.label}`;

    // Hide quality slider for lossless formats (PNG, GIF)
    const qualityControlGroup = document.querySelector('.control-group');
    const isLossless = config.targetFormat === 'image/png' || config.targetFormat === 'image/gif';

    if (isLossless) {
        if (qualityControlGroup) qualityControlGroup.style.display = 'none';
        if (batchQualitySlider && batchQualitySlider.parentElement) batchQualitySlider.parentElement.style.display = 'none';
    } else {
        if (qualityControlGroup) qualityControlGroup.style.display = 'block';
        if (batchQualitySlider && batchQualitySlider.parentElement) batchQualitySlider.parentElement.style.display = 'block';
    }

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Browse Button
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;

        if (files.length === 1) {
            // Single File Mode
            const file = files[0];
            if (file.type.startsWith('image/')) {
                currentFile = file;
                processFile(file);
            } else {
                alert('Please upload a valid image file.');
            }
        } else {
            // Batch Mode
            const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            if (validFiles.length > 0) {
                batchFiles = validFiles;
                processBatch(validFiles);
            } else {
                alert('Please upload valid image files.');
            }
        }
    }

    // --- Single File Logic ---

    function processFile(file) {
        dropZone.classList.add('hidden');
        if (batchSection) batchSection.classList.add('hidden');
        editorSection.classList.remove('hidden');

        originalInfo.textContent = `Size: ${formatBytes(file.size)}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                originalPreview.src = originalImage.src;
                compressImage();
            };
        };
        reader.readAsDataURL(file);
    }

    function compressImage() {
        if (!originalImage) return;

        const quality = parseInt(qualitySlider.value) / 100;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = originalImage.width;
        canvas.height = originalImage.height;

        if (config.targetFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(originalImage, 0, 0);

        const convertedDataUrl = canvas.toDataURL(config.targetFormat, quality);
        compressedPreview.src = convertedDataUrl;

        const head = `data:${config.targetFormat};base64,`;
        const sizeInBytes = Math.round((convertedDataUrl.length - head.length) * 3 / 4);
        compressedInfo.textContent = `Size: ${formatBytes(sizeInBytes)} (Saved ${calculateSavings(currentFile.size, sizeInBytes)})`;
    }

    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        compressImage();
    });

    downloadBtn.addEventListener('click', () => {
        if (!compressedPreview.src) return;
        downloadImage(compressedPreview.src, currentFile.name);
    });

    resetBtn.addEventListener('click', () => {
        resetUI();
    });

    // --- Batch Mode Logic ---

    function processBatch(files) {
        dropZone.classList.add('hidden');
        editorSection.classList.add('hidden');
        if (batchSection) {
            batchSection.classList.remove('hidden');
            batchList.innerHTML = ''; // Clear previous

            files.forEach(file => {
                createBatchItem(file);
            });
        }
    }

    function createBatchItem(file) {
        const item = document.createElement('div');
        item.className = 'batch-item';

        // Structure: Thumb | Info (Name, Orig Size) | Status (New Size) | Actions
        item.innerHTML = `
            <img class="batch-thumb" src="" alt="Thumbnail">
            <div class="batch-info">
                <h4>${file.name}</h4>
                <div class="batch-meta">
                    <span>Original: ${formatBytes(file.size)}</span>
                </div>
            </div>
            <div class="batch-status">Processing...</div>
            <div class="batch-actions">
                <button class="btn-primary btn-sm batch-download-btn" disabled>Download</button>
            </div>
        `;

        batchList.appendChild(item);

        const thumb = item.querySelector('.batch-thumb');
        const status = item.querySelector('.batch-status');
        const downloadBtn = item.querySelector('.batch-download-btn');

        // Read and Compress
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                thumb.src = img.src;
                // Store img on item for re-compression
                item.originalImageObj = img;
                compressBatchItem(item, file, img);
            };
        };
        reader.readAsDataURL(file);
    }

    function compressBatchItem(item, file, img) {
        const status = item.querySelector('.batch-status');
        const downloadBtn = item.querySelector('.batch-download-btn');
        const quality = parseInt(batchQualitySlider.value) / 100;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        if (config.targetFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        const convertedDataUrl = canvas.toDataURL(config.targetFormat, quality);

        const head = `data:${config.targetFormat};base64,`;
        const sizeInBytes = Math.round((convertedDataUrl.length - head.length) * 3 / 4);
        const savings = calculateSavings(file.size, sizeInBytes);

        status.textContent = `${formatBytes(sizeInBytes)} (${savings})`;

        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            downloadImage(convertedDataUrl, file.name);
        };

        // Store data url for "Download All"
        item.convertedDataUrl = convertedDataUrl;
        item.fileName = file.name;
    }

    if (batchQualitySlider) {
        batchQualitySlider.addEventListener('input', (e) => {
            if (batchQualityValue) batchQualityValue.textContent = `${e.target.value}%`;
            // Re-compress all items
            const items = batchList.querySelectorAll('.batch-item');
            items.forEach((item, index) => {
                if (item.originalImageObj) {
                    compressBatchItem(item, batchFiles[index], item.originalImageObj);
                }
            });
        });
    }

    if (batchDownloadAllBtn) {
        batchDownloadAllBtn.addEventListener('click', () => {
            const items = batchList.querySelectorAll('.batch-item');
            items.forEach(item => {
                if (item.convertedDataUrl) {
                    downloadImage(item.convertedDataUrl, item.fileName);
                }
            });
        });
    }

    if (batchClearBtn) {
        batchClearBtn.addEventListener('click', () => {
            resetUI();
        });
    }

    // --- Shared Utilities ---

    function downloadImage(dataUrl, originalName) {
        const link = document.createElement('a');
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        link.download = `${nameWithoutExt}_converted.${config.extension}`;
        link.href = dataUrl;
        link.click();
    }

    function resetUI() {
        currentFile = null;
        originalImage = null;
        batchFiles = [];
        fileInput.value = '';

        dropZone.classList.remove('hidden');
        editorSection.classList.add('hidden');
        if (batchSection) batchSection.classList.add('hidden');

        originalPreview.src = '';
        compressedPreview.src = '';
        if (batchList) batchList.innerHTML = '';
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function calculateSavings(original, compressed) {
        const savings = ((original - compressed) / original) * 100;
        return savings > 0 ? `${savings.toFixed(1)}%` : '0%';
    }

    // Overlay Menu Logic
    const moreBtn = document.getElementById('moreBtn');
    const closeOverlay = document.getElementById('closeOverlay');
    const overlayMenu = document.getElementById('overlayMenu');

    if (moreBtn && overlayMenu && closeOverlay) {
        moreBtn.addEventListener('click', () => {
            overlayMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        closeOverlay.addEventListener('click', () => {
            overlayMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        overlayMenu.addEventListener('click', (e) => {
            if (e.target === overlayMenu) {
                overlayMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
