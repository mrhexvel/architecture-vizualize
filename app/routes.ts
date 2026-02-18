import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
	index('routes/home.tsx'),
	route('vizualizer/:id', 'routes/vizualizer.$id.tsx')
] satisfies RouteConfig
