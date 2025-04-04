const canvas = document.getElementById('color-wheel');
const ctx = canvas.getContext('2d');
const indicator = document.getElementById('color-indicator');
const details = document.getElementById('color-details');
const colorBox = document.getElementById('selected-color-box');
const colorInput = document.getElementById('color-input');
const harmonySelect = document.getElementById('harmony-select');
const palette = document.getElementById('palette');
const toast = document.getElementById('toast');
const downloadBtn = document.getElementById('download-btn');
const customPalette = document.getElementById('custom-palette');
const resetButton = document.getElementById('reset-btn');
let customColors = [];

const radius = canvas.width / 2;
const centerX = radius;
const centerY = radius;

let isDragging = false;
let selectedHue = Math.random();

function drawColorWheel() {
    const numColors = 10000;
    for (let i = 0; i < numColors; i++) {
        const hue = i / numColors;
        const color = hsvToRgb(hue, 1, 1);
        const angle = hue * 2 * Math.PI;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgb(255,255,255)`);
        gradient.addColorStop(1, `rgb(${color.r}, ${color.g}, ${color.b})`);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        ctx.arc(centerX, centerY, radius, angle, angle + (2 * Math.PI / numColors));
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}
function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, l: l };
}

function rgbToHsv(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

function getHueFromClick(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    let hue = (angle / (2 * Math.PI) + 1) % 1;
    return hue;
}

function updateIndicator(x, y) {
    indicator.style.left = `${x - 6}px`;
    indicator.style.top = `${y - 6}px`;
    indicator.style.display = 'block';
}

function generateHarmony(hue) {
    const harmonyType = harmonySelect.value;
    let harmonyColors = [];

    switch (harmonyType) {
        case 'monochromatic':
            harmonyColors = [
                { h: hue, s: 1, v: 1 },
                { h: hue, s: 0.7, v: 0.85 },
                { h: hue, s: 0.5, v: 0.7 },
            ];
            break;
        case 'analogous':
            harmonyColors = [
                { h: (hue - 1 / 12 + 1) % 1, s: 1, v: 1 },
                { h: hue, s: 1, v: 1 },
                { h: (hue + 1 / 12) % 1, s: 1, v: 1 },
            ];
            break;
        case 'complementary':
            harmonyColors = [
                { h: hue, s: 1, v: 1 },
                { h: (hue + 0.5) % 1, s: 1, v: 1 },
            ];
            break;
        case 'split-complementary':
            harmonyColors = [
                { h: hue, s: 1, v: 1 },
                { h: (hue + 0.45) % 1, s: 1, v: 1 },
                { h: (hue + 0.55) % 1, s: 1, v: 1 },
            ];
            break;
        case 'triadic':
            harmonyColors = [
                { h: hue, s: 1, v: 1 },
                { h: (hue + 1 / 3) % 1, s: 1, v: 1 },
                { h: (hue + 2 / 3) % 1, s: 1, v: 1 },
            ];
            break;
        case 'tetradic':
            harmonyColors = [
                { h: hue, s: 1, v: 1 },
                { h: (hue + 1 / 4) % 1, s: 1, v: 1 },
                { h: (hue + 2 / 4) % 1, s: 1, v: 1 },
                { h: (hue + 3 / 4) % 1, s: 1, v: 1 },
            ];
            break;
        default:
            harmonyColors = [{ h: hue, s: 1, v: 1 }];
    }

    return harmonyColors.map(color => {
        color.h = color.h < 0 ? color.h + 1 : color.h;
        return color;
    });
}

function displayPalette(hue) {
    const harmonyColors = generateHarmony(hue);
    palette.innerHTML = '';
    harmonyColors.forEach(color => {
        const rgb = hsvToRgb(color.h, color.s, color.v);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const paletteColor = document.createElement('div');
        paletteColor.classList.add('palette-color');
        paletteColor.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const hexDisplay = document.createElement('div');
        hexDisplay.classList.add('palette-hex');
        hexDisplay.textContent = hex;
        paletteColor.appendChild(hexDisplay);
        palette.appendChild(paletteColor);

        const addToCustomBtn = document.createElement('button');
        addToCustomBtn.textContent = '+';
        addToCustomBtn.classList.add('add-to-custom-btn');
        addToCustomBtn.style.padding = '5px';
        addToCustomBtn.style.marginLeft = '5px';
        paletteColor.appendChild(addToCustomBtn);

        addToCustomBtn.addEventListener('click', () => {
            if (!customColors.includes(hex)) {
                customColors.push(hex);
                const customColorDiv = document.createElement('div');
                customColorDiv.classList.add('custom-color');
                customColorDiv.style.backgroundColor = hex;
                customPalette.appendChild(customColorDiv);

                customColorDiv.addEventListener('click', () => {
                    navigator.clipboard.writeText(hex).then(() => {
                        showToast(`Copied: ${hex}`);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                });
            }
        });

        paletteColor.addEventListener('click', (event) => {
            if (event.target !== addToCustomBtn) {
                navigator.clipboard.writeText(hex).then(() => {
                    showToast(`Copied: ${hex}`);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    });
}

function updateColorDetails(hue) {
    const color = hsvToRgb(hue, 1, 1);
    const hex = rgbToHex(color.r, color.g, color.b);
    const hsl = rgbToHsl(color.r, color.g, color.b);
    const hsv = rgbToHsv(color.r, color.g, color.b);

    details.innerHTML = `
        HEX: ${hex}<br>
        RGB: rgb(${color.r}, ${color.g}, ${color.b})<br>
        HSL: hsl(${(hsl.h * 360).toFixed(0)}, ${(hsl.s * 100).toFixed(0)}%, ${(hsl.l * 100).toFixed(0)}%)<br>
        HSV: hsv(${(hsv.h * 360).toFixed(0)}, ${(hsv.s * 100).toFixed(0)}%, ${(hsv.v * 100).toFixed(0)}%)
    `;
    indicator.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    colorInput.value = hex;
    colorInput.style.display = 'block';
    displayPalette(hue);
    showToast(hex);
}

function showToast(hex) {
    toast.textContent = hex;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) <= radius) {
        isDragging = true;
        selectedHue = getHueFromClick(x, y);
        updateIndicator(x, y);
        updateColorDetails(selectedHue);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) <= radius) {
            selectedHue = getHueFromClick(x, y);
            updateIndicator(x, y);
            updateColorDetails(selectedHue);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

harmonySelect.addEventListener('change', () => {
    if (isDragging) {
        updateColorDetails(selectedHue);
    } else {
        displayPalette(selectedHue);
    }
});

colorInput.addEventListener('input', () => {
    const hex = colorInput.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const hsv = rgbToHsv(r, g, b);
    selectedHue = hsv.h;
    updateColorDetails(selectedHue);
    updateIndicator(centerX + radius * Math.cos(selectedHue * 2 * Math.PI), centerY + radius * Math.sin(selectedHue * 2 * Math.PI));
});

drawColorWheel();
updateColorDetails(selectedHue);
updateIndicator(centerX + radius * Math.cos(selectedHue * 2 * Math.PI), centerY + radius * Math.sin(selectedHue * 2 * Math.PI));

downloadBtn.addEventListener('click', () => {
    const paletteContainer = document.getElementById('custom-palette');
    const colorBoxes = paletteContainer.querySelectorAll('.custom-color');

    if (colorBoxes.length === 0) {
        alert("No colors in custom palette to download.");
        return;
    }

    const boxWidth = 150;
    const boxHeight = 80;
    const textHeight = 20;
    const canvasHeight = boxHeight + textHeight;

    const canvas = document.createElement('canvas');
    canvas.width = colorBoxes.length * boxWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    colorBoxes.forEach((box, index) => {
        const bgColor = window.getComputedStyle(box).backgroundColor;
        const hex = rgbToHex(...bgColor.match(/\d+/g).map(Number));

        ctx.fillStyle = bgColor;
        ctx.fillRect(index * boxWidth, 0, boxWidth, boxHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hex, (index + 0.5) * boxWidth, boxHeight + textHeight - 5);
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'custom-color-palette.png';
    link.click();
});

resetButton.addEventListener('click', () => {
    customPalette.innerHTML = "";
    customColors = [];
});