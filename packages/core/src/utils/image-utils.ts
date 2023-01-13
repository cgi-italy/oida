export type ImageExportOptions = {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
};

let exportCanvas: HTMLCanvasElement | undefined;
let exportContext: CanvasRenderingContext2D | undefined;

const getOrCreateExportCanvas = () => {
    if (!exportCanvas) {
        exportCanvas = document.createElement('canvas');
        exportContext = exportCanvas.getContext('2d') || undefined;
    }
    return [exportCanvas, exportContext] as [HTMLCanvasElement, CanvasRenderingContext2D];
};

export const exportImage = (source: CanvasImageSource, options: ImageExportOptions) => {
    const [canvas, context] = getOrCreateExportCanvas();

    const srcWidth = source instanceof SVGImageElement ? source.width.baseVal.value : source.width;
    const srcHeight = source instanceof SVGImageElement ? source.height.baseVal.value : source.height;

    if (options.width) {
        canvas.width = options.width;
        canvas.height = options.height || options.width * (srcHeight / srcWidth);
    } else if (options.height) {
        canvas.height = options.height;
        canvas.width = options.height * (srcWidth / srcHeight);
    } else {
        canvas.width = srcWidth;
        canvas.height = srcHeight;
    }
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL(options.format, options.quality);
};
