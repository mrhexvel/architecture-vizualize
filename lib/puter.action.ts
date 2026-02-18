import puter from '@heyputer/puter.js'
import { PUTER_WORKER_URL } from './constants'
import { getOrCreateHostingConfig, uploadImageToHosting } from './puter.hosting'
import { isHostedUrl } from './utils'

export const signIn = async () => await puter.auth.signIn()
export const signOut = async () => await puter.auth.signOut()

export const getCurrentUser = async () => {
	try {
		return await puter.auth.getUser()
	} catch {
		return null
	}
}

export const createProject = async ({
	item,
	visibility
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
	if (!PUTER_WORKER_URL) {
		console.warn('PUTER_WORKER_URL is not set')
		return null
	}
	const projectId = item.id

	const hosting = await getOrCreateHostingConfig()

	const hostedSource = projectId
		? await uploadImageToHosting({
				hosting,
				url: item.sourceImage,
				projectId,
				label: 'source'
			})
		: null

	const hostedRender =
		projectId && item.renderedImage
			? await uploadImageToHosting({
					hosting,
					url: item.renderedImage,
					projectId,
					label: 'rendered'
				})
			: null

	const resolvedSource =
		hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '')

	if (!resolvedSource) {
		console.warn('Failed to upload source image to hosting')
		return null
	}

	const resolvedRender = hostedRender?.url
		? hostedRender?.url
		: item.renderedImage && isHostedUrl(item.renderedImage)
			? item.renderedImage
			: undefined

	const {
		sourceImage: _sourceItem,
		renderedImage: _renderedItem,
		publicPath: _publicPath,
		...rest
	} = item

	const payload = {
		...rest,
		sourceImage: resolvedSource,
		renderedImage: resolvedRender
	}

	try {
		const respones = await puter.workers.exec(
			`${PUTER_WORKER_URL}/api/projects/save`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: payload, visibility })
			}
		)

		if (!respones.ok) {
			console.error(`Failed to create project: ${respones.statusText}`)
			return null
		}

		const data = (await respones.json()) as { project: DesignItem | null }

		return data?.project || null
	} catch (e) {
		console.error(`Failed to create project: ${e}`)
		return null
	}
}

export const getProjects = async () => {
	if (!PUTER_WORKER_URL) {
		console.warn('PUTER_WORKER_URL is not set')
		return []
	}

	try {
		const respones = await puter.workers.exec(
			`${PUTER_WORKER_URL}/api/projects/list`,
			{ method: 'GET' }
		)

		if (!respones.ok) {
			console.error(`Failed to get projects: ${respones.statusText}`)
			return []
		}

		const data = (await respones.json()) as { projects: DesignItem[] | null }
		return Array.isArray(data?.projects) ? data?.projects : []
	} catch (e) {
		console.error(`Failed to get projects: ${e}`)
		return []
	}
}

export const getProjectById = async ({ id }: { id: string }) => {
	if (!PUTER_WORKER_URL) {
		console.warn('Missing VITE_PUTER_WORKER_URL; skipping project fetch.')
		return null
	}

	console.log('Fetching project with ID:', id)

	try {
		const response = await puter.workers.exec(
			`${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
			{ method: 'GET' }
		)

		console.log('Fetch project response:', response)

		if (!response.ok) {
			console.error('Failed to fetch project:', await response.text())
			return null
		}

		const data = (await response.json()) as {
			project?: DesignItem | null
		}

		console.log('Fetched project data:', data)

		return data?.project ?? null
	} catch (e) {
		console.error('Failed to fetch project:', e)
		return null
	}
}
