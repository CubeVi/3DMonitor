// Convert hex color value to RGB
const hexToRgb = (hex:string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

export const calcColor = (startColor:string, endColor:string, progress:number) =>{
    console.log('[ calcColor----endColor ] >', endColor,progress)
    // Get RGB values of start and end colors
    const startRgb = hexToRgb(startColor);
    const endRgb = hexToRgb(endColor);
    // Calculate transition value for each color channel
    const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * (progress / 100));
    const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * (progress / 100));
    const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * (progress / 100));
    // Return the transition color as an RGB string
    return `rgb(${r},${g},${b})`;
}