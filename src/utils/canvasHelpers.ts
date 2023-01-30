import {CanvasRenderingContext2D} from "canvas";

export const ColorPalette = {
    background: '#2f2f2f',
    primary: '#98DDCA',
    secondary: '#D5ECC2',
    progress: '#FFD3B4',
    red: '#FFAAA7'
}

export function roundedRectanglePath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

export function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.save()
    roundedRectanglePath(ctx, x, y, width, height, radius)
    ctx.clip()
    ctx.fillRect(x, y, width, height)
    ctx.restore()
}

export function circlePath(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.closePath()
}

export function drawProgressBar(ctx: CanvasRenderingContext2D, progress: number) {
    ctx.save()
    progress = Math.min(progress, 100)
    const width = 600
    const height = 40
    const x = 10
    const y = 150
    const radius = 20

    ctx.fillStyle = ColorPalette.secondary
    fillRoundedRect(ctx, x, y, width, height, radius)

    ctx.fillStyle = ColorPalette.primary
    fillRoundedRect(ctx, x, y, width*progress/100, height, radius)

    ctx.restore()
}