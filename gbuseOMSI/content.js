// Constants and Configuration
const CONFIG = {
    MAX_TABLE_WIDTH: 144,
    TABLE_HEIGHT: 20,
    GBUSE_THRESHOLD: 600,
    PIXEL_THRESHOLD: 150,
    RANDOM_MODIFICATIONS: 10
};

// DOM Elements Cache
const elements = {
    init() {
        this.vstupCanvas = document.getElementById('VSTUPCANVAS');
        this.vstupCtx = this.vstupCanvas.getContext('2d');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.table = document.querySelector('#panel-table tbody');
        this.output = document.getElementById('vystupOMSI');
        this.fileInput = document.getElementById('input');
    }
};

// Panel State Management
const panelState = {
    dimensions: { width: 0, height: 0 },
    
    getDimensions() {
        let width = 0, height = 0;
        while (document.getElementById(`0x${width}`)) width++;
        while (document.getElementById(`${height}x0`)) height++;
        this.dimensions = { width, height };
        return this.dimensions;
    },

    modifyRandomDots(count, forceOff = false) {
        const { width, height } = this.getDimensions();
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const element = document.getElementById(`${y}x${x}`);
            
            if (element) {
                const newState = forceOff ? false : Math.random() < 0.5;
                element.checked = newState;
                element.parentNode.className = newState ? 'vybrano' : '';
            }
        }
        updateOutput();
    }
};

// Image Processing
const imageProcessor = {
    processGBuseScreenshot(imageData, canvas) {
        const pix = imageData.data;
        let height = 0, width = 0;
        
        // Find panel dimensions in screenshot
        for (let y = 100; y < canvas.height; y++) {
            if (pix[4 * y * canvas.width + 2 + canvas.width * 2] > 50) {
                height = (y - 102) / 4;
                break;
            }
        }
        
        for (let x = canvas.width / 2; x < canvas.width; x++) {
            if (pix[400 * canvas.width + 2 + x * 4] > 50) {
                width = (x - canvas.width / 2) / 2;
                break;
            }
        }
        
        return elements.vstupCtx.getImageData(
            (canvas.width - width * 4) / 2 - 2,
            100,
            width * 4 + 2,
            height * 4 + 2
        );
    },

    createTable(imageData) {
        const width = Math.min((imageData.width - 2) / 4, CONFIG.MAX_TABLE_WIDTH);
        elements.table.innerHTML = '';
        
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        
        for (let row = 0; row < CONFIG.TABLE_HEIGHT; row++) {
            const tr = document.createElement('tr');
            tr.style.height = '4px';
            
            for (let cell = 0; cell < width; cell++) {
                const td = document.createElement('td');
                td.style.width = '4px';
                td.style.height = '4px';
                td.style.padding = '0';
                td.style.backgroundColor = '#000';
                td.style.border = '0';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${row}x${cell}`;
                checkbox.name = checkbox.id;
                checkbox.disabled = true;
                checkbox.style.display = 'none'; // Hide checkbox completely
                
                td.appendChild(checkbox);
                td.addEventListener('click', (e) => {
                    const chk = e.currentTarget.querySelector('input');
                    if (chk) {
                        const newState = !chk.checked;
                        chk.checked = newState;
                        e.currentTarget.style.backgroundColor = newState ? '#ff8c00' : '#000';
                        updateOutput();
                    }
                });
                
                tr.appendChild(td);
            }
            elements.table.appendChild(tr);
        }
    },

    updateCheckboxes(imageData) {
        const pixels = imageData.data;
        const width = imageData.width;
        const actualWidth = Math.min(CONFIG.MAX_TABLE_WIDTH, width);
        
        // First pass: process all rows except the last one
        for (let y = 0; y < CONFIG.TABLE_HEIGHT - 1; y++) {
            for (let x = 0; x < actualWidth; x++) {
                const pixelValue = pixels[(x-1) * 16 + 24 + (y + 1) * 16 * width - 4 * width];
                const element = document.getElementById(`${y}x${x}`);
                
                if (element) {
                    const newState = pixelValue > CONFIG.PIXEL_THRESHOLD;
                    element.checked = newState;
                    element.parentNode.className = newState ? 'vybrano' : '';
                }
            }
        }

        // Count checked cells in pre-last row
        let checkedCount = 0;
        const preLastRow = CONFIG.TABLE_HEIGHT - 2;
        for (let x = 0; x < actualWidth; x++) {
            const element = document.getElementById(`${preLastRow}x${x}`);
            if (element?.checked) {
                checkedCount++;
            }
        }

        // Determine last row state based on pre-last row
        const shouldCheckLastRow = checkedCount > (actualWidth * 0.5);
        const lastRow = CONFIG.TABLE_HEIGHT - 1;
        
        // Apply state to last row
        for (let x = 0; x < actualWidth; x++) {
            const element = document.getElementById(`${lastRow}x${x}`);
            if (element) {
                element.checked = shouldCheckLastRow;
                element.parentNode.className = shouldCheckLastRow ? 'vybrano' : '';
            }
        }
    }
};

// Output Generation
function updateOutput() {
    const { width } = panelState.getDimensions();
    let output = '';
    
    for (let y = 0; y < CONFIG.TABLE_HEIGHT; y++) {
        output += '@';
        for (let x = 0; x < Math.min(CONFIG.MAX_TABLE_WIDTH, width); x++) {
            const element = document.getElementById(`${y}x${x}`);
            output += element?.checked ? '1' : '.';
        }
    }
    
    elements.output.value = output;
}

// Image Loading
function loadImage(source) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            elements.vstupCanvas.width = img.width;
            elements.vstupCanvas.height = img.height;
            elements.vstupCtx.drawImage(img, 0, 0);
            resolve(img);
        };
        img.src = source;
    });
}

// Process Image
async function processImage(source) {
    const img = await loadImage(source);
    window.img = img; // Keep reference for existing code
    
    let imageData;
    if (img.width > CONFIG.GBUSE_THRESHOLD) {
        console.log('Processing gBuse screenshot');
        imageData = imageProcessor.processGBuseScreenshot(
            elements.vstupCtx.getImageData(0, 0, img.width, img.height),
            elements.vstupCanvas
        );
    } else {
        console.log('Processing direct panel');
        imageData = elements.vstupCtx.getImageData(0, 0, img.width, img.height);
    }
    
    imageProcessor.createTable(imageData);
    imageProcessor.updateCheckboxes(imageData);
    updateOutput();
}

// Event Handlers
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImage(URL.createObjectURL(file));
    }
}

function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => processImage(e.target.result);
            reader.readAsDataURL(blob);
        }
    }
}

function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    for (const file of files) {
        if (file.type === 'image/png') {
            const reader = new FileReader();
            reader.onload = (e) => processImage(e.target.result);
            reader.readAsDataURL(file);
        }
    }
}

// Code Storage Management
const codeStorage = {
    cookiesAccepted: false,
    storageKey: 'omsiCodes',
    expiryKey: 'omsiCodesExpiry',

    init() {
        this.cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
        this.checkExpiry();
        if (this.cookiesAccepted) {
            this.showSavedCodes();
        } else {
            document.getElementById('cookieConsent').hidden = false;
        }
    },

    checkExpiry() {
        const expiry = localStorage.getItem(this.expiryKey);
        if (expiry && new Date().getTime() > parseInt(expiry)) {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.expiryKey);
        }
    },

    setExpiry() {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem(this.expiryKey, expiryDate.getTime().toString());
    },

    saveCode(name, code) {
        if (!this.cookiesAccepted) return;
        
        const codes = this.getCodes();
        codes[name] = code;
        localStorage.setItem(this.storageKey, JSON.stringify(codes));
        this.setExpiry();
        this.showSavedCodes();
    },

    getCodes() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    },

    deleteCode(name) {
        const codes = this.getCodes();
        delete codes[name];
        localStorage.setItem(this.storageKey, JSON.stringify(codes));
        this.showSavedCodes();
    },

    visualizeCode(code) {
            if (!code.startsWith('@')) {
                throw new Error('Neplatný formát kódu: musí začínat znakem @');
            }

            // Split code into rows (each starting with @)
            const rows = code.split('@').filter(row => row);
            if (rows.length === 0) {
                throw new Error('Neplatný formát kódu: nenalezeny žádné platné řádky');
            }

            const width = Math.max(...rows.map(row => row.length));
            if (width === 0) {
                throw new Error('Neplatný formát kódu: prázdné řádky');
            }
        
        // Create table with correct dimensions
        imageProcessor.createTable({ width: width * 4 + 2, height: rows.length * 4 });
        
        // Update each cell based on the code
        rows.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                const element = document.getElementById(`${y}x${x}`);
                if (element) {
                    const isOn = row[x] === '1';
                    element.checked = isOn;
                    element.parentNode.className = isOn ? 'vybrano' : '';
                }
            }
        });

        // Handle the last row based on pre-last row state
        if (rows.length > 1) {
            const preLastRow = rows[rows.length - 2];
            const checkedCount = (preLastRow.match(/1/g) || []).length;
            const shouldCheckLastRow = checkedCount > (preLastRow.length * 0.5);
            
            const lastRow = CONFIG.TABLE_HEIGHT - 1;
            for (let x = 0; x < width; x++) {
                const element = document.getElementById(`${lastRow}x${x}`);
                if (element) {
                    element.checked = shouldCheckLastRow;
                    element.parentNode.className = shouldCheckLastRow ? 'vybrano' : '';
                }
            }
        }
    },

    showSavedCodes() {
        const codesList = document.getElementById('savedCodesList');
        const codes = this.getCodes();
        const currentCode = elements.output.value;
        
        codesList.innerHTML = '';
        Object.entries(codes).forEach(([name, code]) => {
            const item = document.createElement('div');
            item.className = 'code-item' + (code === currentCode ? ' current' : '');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'code-name';
            nameSpan.textContent = name;
            
            const status = document.createElement('span');
            status.className = 'code-status';
            status.textContent = code === currentCode ? ' - You are here' : '';
            nameSpan.appendChild(status);
            
            const actions = document.createElement('div');
            actions.className = 'code-actions';
            
            const showBtn = document.createElement('button');
            showBtn.className = 'show-btn';
            showBtn.textContent = 'Show';
            const boundVisualizeCode = this.visualizeCode.bind(this);
            showBtn.onclick = () => {
                try {
                    elements.output.value = code;
                    boundVisualizeCode(code);
                    this.showSavedCodes(); // Refresh list to update current indicator
                } catch (error) {
                    console.error('Chyba při vizualizaci kódu:', error);
                    alert('Nepodařilo se načíst uložený kód. Formát může být neplatný.');
                }
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = () => this.deleteCode(name);
            
            actions.appendChild(showBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(nameSpan);
            item.appendChild(actions);
            codesList.appendChild(item);
        });
    }
};

// Initialize
window.onload = function() {
    elements.init();
    codeStorage.init();
    
    // Event Listeners
    document.addEventListener('drop', handleDrop, false);
    document.addEventListener('dragover', (e) => e.preventDefault(), false);
    document.addEventListener('paste', handlePaste);
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    document.getElementById('10dotek').addEventListener('click', () => 
        panelState.modifyRandomDots(CONFIG.RANDOM_MODIFICATIONS));
    
    document.getElementById('10ledek').addEventListener('click', () => 
        panelState.modifyRandomDots(CONFIG.RANDOM_MODIFICATIONS, true));

    // Cookie consent handlers
    document.getElementById('acceptCookies').addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        codeStorage.cookiesAccepted = true;
        document.getElementById('cookieConsent').hidden = true;
    });

    document.getElementById('declineCookies').addEventListener('click', () => {
        document.getElementById('cookieConsent').hidden = true;
    });

    // Save code handler
    document.getElementById('saveCode').addEventListener('click', () => {
        const name = document.getElementById('fileName').value.trim();
        const code = elements.output.value;
        
        if (name && code) {
            codeStorage.saveCode(name, code);
            document.getElementById('fileName').value = '';
        }
    });
};