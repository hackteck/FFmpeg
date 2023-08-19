import type { Emscripten, readerResult } from './emscripten.d';

export function loadScript(src: string) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

export function createBlobFromSource(source: string | ArrayBufferLike, mimeType: string = 'application/javascript') {
    const blob = new Blob([source], { type: mimeType });
    return URL.createObjectURL(blob);
}

export async function fetchFile(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

export function writeFiles(files: readerResult[]) {
    return (Module: Emscripten) => {
        for (const { safeFilename, reader } of files) {
            if (reader.result instanceof ArrayBuffer) {
                Module.FS.writeFile(safeFilename, new Uint8Array(reader.result))
            }
        }
    }
}

export function readFile(Module: Emscripten, path: string, mimeType: string = "video/mp4") {
    return createBlobFromSource(Module.FS.readFile(path).buffer, mimeType);
}