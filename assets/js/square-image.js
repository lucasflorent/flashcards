// Met une image au format carré en ajoutant des bandes blanches, et renvoie un Blob JPEG.
function imageToSquareJpeg(file, options) {
  options = options || {};
  const quality = options.quality || 0.92;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const taille = Math.max(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = taille;
      canvas.height = taille;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, taille, taille);
      const dx = (taille - img.naturalWidth) / 2;
      const dy = (taille - img.naturalHeight) / 2;
      ctx.drawImage(img, dx, dy);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Conversion impossible'));
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible'));
    };
    img.src = url;
  });
}
