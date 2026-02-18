import { Button } from 'components/ui/Button'
import { generate3DView } from 'lib/ai.action'
import { Box, RefreshCcw, Share, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

export default function VizualizerId() {
	const navigate = useNavigate()
	const location = useLocation()

	const { initialImage, initialRender, name } = location.state || {}
	const hasInitialGenerated = useRef(false)

	const [isProcessing, setIsProcessing] = useState(false)
	const [currentImage, setCurrentImage] = useState<string | null>(
		initialRender || null
	)

	const handleBack = () => navigate('/')

	const runGeneration = async () => {
		if (!initialImage) return

		try {
			setIsProcessing(true)
			const result = await generate3DView({ sourceImage: initialImage })

			if (result.renderedImage) {
				setCurrentImage(result.renderedImage)
			}
		} catch (e) {
			console.error('Generatin failed', e)
		} finally {
			setIsProcessing(false)
		}
	}

	useEffect(() => {
		if (!initialImage || hasInitialGenerated.current) return

		if (initialRender) {
			setCurrentImage(initialRender)
			hasInitialGenerated.current = true
			return
		}

		runGeneration()
	}, [initialImage, initialRender])

	return (
		<div className="visualizer">
			<nav className="topbar">
				<div className="brand">
					<Box className="logo" />
					<span className="name"></span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleBack}
					className="exit"
				>
					<X className="icon" />
					Exit editor
				</Button>
			</nav>
			<section className="content">
				<div className="panel">
					<div className="panel-header">
						<div className="panel-meta">
							<p>Project</p>
							<h2>{'Untitled Project'}</h2>
							<p className="note">Created by You</p>
						</div>
						<div className="panel-actions">
							<Button
								size="sm"
								className="export"
								disabled={!currentImage}
							>
								Export
							</Button>
							<Button
								size="sm"
								className="share"
								disabled={!currentImage}
							>
								<Share className="h-4 w-4 mr-2" />
								Share
							</Button>
						</div>
					</div>
					<div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
						{currentImage ? (
							<img
								src={currentImage}
								alt="3D Render"
								className="render-img"
							/>
						) : (
							<div className="render-placeholder">
								{initialImage && (
									<img
										src={initialImage}
										alt="Source Image"
										className="render-fallback"
									/>
								)}
							</div>
						)}

						{isProcessing && (
							<div className="render-overlay">
								<div className="rendering-card">
									<RefreshCcw className="spinner" />
									<span className="title">Rendering...</span>
									<span className="subtitle">
										This may take a few minutes...
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}
