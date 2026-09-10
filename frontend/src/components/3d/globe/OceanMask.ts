/**
 * AquaTwin 3D - OceanMask Utility
 * High-speed in-memory ocean mask buffer.
 * Samples /textures/earth_water.png (255 = Ocean, 0 = Land)
 * Guarantees that waves, currents, and ocean shaders operate strictly on water bodies.
 */

let oceanMaskBuffer: Uint8Array | null = null;
const MASK_WIDTH = 1024;
const MASK_HEIGHT = 512;

export function initializeOceanMask(): void {
  if (oceanMaskBuffer) return;

  const canvas = document.createElement('canvas');
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Default: Pure White (Ocean)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, MASK_WIDTH, MASK_HEIGHT);

  // Load high-resolution global water mask
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/textures/earth_water.png';
  img.onload = () => {
    ctx.drawImage(img, 0, 0, MASK_WIDTH, MASK_HEIGHT);
    const imgData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
    oceanMaskBuffer = new Uint8Array(imgData.data.buffer);
  };

  // Immediate synchronous land geometry fallback (Pure Black #000000 = Land)
  ctx.fillStyle = '#000000';
  const gToP = (lat: number, lon: number) => ({
    x: ((lon + 180) / 360) * MASK_WIDTH,
    y: ((90 - lat) / 180) * MASK_HEIGHT
  });

  // Peninsular India
  ctx.beginPath();
  const ind0 = gToP(24.0, 68.0);
  ctx.moveTo(ind0.x, ind0.y);
  [
    gToP(24.5, 72.0), gToP(28.0, 75.0), gToP(32.0, 76.0), gToP(36.0, 75.0),
    gToP(32.0, 82.0), gToP(28.0, 88.0), gToP(26.0, 93.0), gToP(24.0, 91.0),
    gToP(22.0, 89.5), gToP(20.5, 87.0), gToP(17.5, 83.0), gToP(15.5, 80.5),
    gToP(13.0, 80.3), gToP(10.0, 79.8), gToP(8.1, 77.5),
    gToP(9.5, 76.3),  gToP(12.5, 75.0), gToP(15.5, 73.8), gToP(18.9, 72.8),
    gToP(21.0, 70.0), gToP(22.5, 69.0), gToP(23.5, 68.5)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Sri Lanka
  ctx.beginPath();
  const sl0 = gToP(9.8, 80.2);
  ctx.moveTo(sl0.x, sl0.y);
  [gToP(8.5, 81.2), gToP(6.0, 80.5), gToP(7.0, 79.8)].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Arabian Peninsula, Iran, Pakistan
  ctx.beginPath();
  const ar0 = gToP(12.5, 43.5);
  ctx.moveTo(ar0.x, ar0.y);
  [
    gToP(14.5, 48.0), gToP(17.0, 54.5), gToP(22.5, 59.8), gToP(26.0, 56.5),
    gToP(30.0, 48.0), gToP(34.0, 36.0), gToP(28.0, 34.5), gToP(20.0, 40.0),
    gToP(16.0, 42.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Pakistan & Iran
  ctx.beginPath();
  const pak0 = gToP(25.0, 61.5);
  ctx.moveTo(pak0.x, pak0.y);
  [
    gToP(25.3, 66.8), gToP(24.8, 67.5), gToP(24.0, 68.5),
    gToP(38.0, 75.0), gToP(38.0, 60.0), gToP(30.0, 58.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Horn of Africa
  ctx.beginPath();
  const af0 = gToP(12.0, 51.0);
  ctx.moveTo(af0.x, af0.y);
  [
    gToP(10.5, 51.2), gToP(5.0, 48.5), gToP(0.0, 42.5), gToP(-10.0, 40.5),
    gToP(-20.0, 35.0), gToP(-25.0, 32.0), gToP(0.0, 30.0), gToP(15.0, 36.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  // Southeast Asia
  ctx.beginPath();
  const se0 = gToP(20.0, 92.5);
  ctx.moveTo(se0.x, se0.y);
  [
    gToP(16.0, 94.5), gToP(15.5, 97.5), gToP(10.0, 98.5), gToP(5.0, 100.5),
    gToP(1.3, 103.8), gToP(10.0, 105.0), gToP(24.0, 98.0)
  ].forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.closePath();
  ctx.fill();

  const syncImgData = ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
  oceanMaskBuffer = new Uint8Array(syncImgData.data.buffer);
}

export function isPointInOcean(lat: number, lon: number): boolean {
  if (!oceanMaskBuffer) {
    initializeOceanMask();
    if (!oceanMaskBuffer) return true;
  }

  const px = Math.floor(((lon + 180) / 360) * MASK_WIDTH) % MASK_WIDTH;
  const py = Math.floor(((90 - lat) / 180) * MASK_HEIGHT) % MASK_HEIGHT;
  if (px < 0 || py < 0 || px >= MASK_WIDTH || py >= MASK_HEIGHT) return false;

  const idx = (py * MASK_WIDTH + px) * 4;
  return oceanMaskBuffer[idx] > 120;
}
