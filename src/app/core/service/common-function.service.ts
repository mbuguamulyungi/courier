import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionService {

  constructor(private sanitizer: DomSanitizer) { }

  async convertBase64ToSafeUrl(base64Url: string): Promise<SafeUrl> {
    // Remove the prefix (e.g., data:image/jpeg;base64,) from the Base64 URL
    const base64Data = base64Url.replace(/^data:image\/(png|jpeg|jpg|gif|bmp|tiff|tif|webp|svg\+xml);base64,/, '');

    // Convert the Base64 data to a Blob
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });

    // Create a Blob URL from the Blob object
    const blobUrl = URL.createObjectURL(blob);

    // Convert Blob URL to Base64 URL
    const base64UrlResult: SafeUrl = await this.convertBlobToBase64(blobUrl);
    return base64UrlResult;
}

// Function to convert Blob URL to Base64 URL
async convertBlobToBase64(blobUrl: string): Promise<SafeUrl> {
    return new Promise<SafeUrl>((resolve, reject) => {
        fetch(blobUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64DataUrl: string = reader.result as string;
                    // Sanitize the base64 URL before using it
                    const safeBase64Url: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(base64DataUrl);
                    // Now you can use safeBase64Url as your converted base64 URL
                    resolve(safeBase64Url);
                };
            })
            .catch(error => reject(error));
    });
}
}
