import puter from '@heyputer/puter.js'
import { VIZAX_RENDER_PROMPT } from './constants'

export async function fetchAsDataUrl(url: string): Promise<string> {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(
			`Failed to fetch image: ${response.status} ${response.statusText}`
		)
	}

	const blob = await response.blob()

	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result
			if (typeof result === 'string') {
				resolve(result)
			} else {
				reject(new Error('Failed to read blob as data URL'))
			}
		}
		reader.onerror = () =>
			reject(reader.error ?? new Error('FileReader failed'))
		reader.readAsDataURL(blob)
	})
}

export const generate3DView = async ({
	sourceImage,
	projectId
}: Generate3DViewParams) => {
	const dataUrl = sourceImage.startsWith('data:')
		? sourceImage
		: await fetchAsDataUrl(sourceImage)

	const base64 = dataUrl.split(',')[1]
	const mimeType = dataUrl.split(';')[0].split(':')[1]

	if (!base64 || !mimeType) throw new Error('Invalid source image')

	const response = await puter.ai.txt2img(VIZAX_RENDER_PROMPT, {
		provider: 'gemini',
		model: 'gemini-2.5-flash-image-preview',
		input_image: base64,
		input_image_mime_type: mimeType,
		ratio: { w: 1024, h: 1024 }
	})

	const rawImageUrl = (response as HTMLImageElement).src ?? null

	if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined }

	const renderedImage = rawImageUrl.startsWith('data:')
		? rawImageUrl
		: await fetchAsDataUrl(rawImageUrl)

	return { renderedImage, renderedPath: undefined }
}
