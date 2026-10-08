// Shrinks large phone photos before upload (saves mobile data). Falls back to the original file on any problem.
export async function compressImage(file, { maxSize = 1600, quality = 0.8 } = {}) {
  try {
    if (!file.type.startsWith('image/') || file.size < 300 * 1024) return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  } catch { return file; }
}
