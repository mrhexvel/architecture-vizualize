import {
	MAX_FILE_SIZE,
	PROGRESS_INTERVAL_MS,
	PROGRESS_STEP,
	REDIRECT_DELAY_MS
} from 'lib/constants'
import { CheckCircleIcon, ImageIcon, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'

type UploadProps = {
	onComplete?: (base64: string) => void
}

export const Upload = ({ onComplete }: UploadProps) => {
	const [file, setFile] = useState<File | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [progress, setProgress] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isMountedRef = useRef(true)

	const { isSignedIn } = useOutletContext<AuthContext>()

	useEffect(() => {
		isMountedRef.current = true
		return () => {
			isMountedRef.current = false
			if (intervalRef.current) clearInterval(intervalRef.current)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const processFile = useCallback(
		(selectedFile: File) => {
			if (!isSignedIn) return

			if (intervalRef.current) clearInterval(intervalRef.current)
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			intervalRef.current = null
			timeoutRef.current = null

			setFile(selectedFile)
			setProgress(0)

			const reader = new FileReader()

			reader.onerror = () => {
				setFile(null)
				setProgress(0)
			}

			reader.onload = () => {
				const base64 = (reader.result as string) ?? ''

				intervalRef.current = setInterval(() => {
					if (!isMountedRef.current) {
						if (intervalRef.current) clearInterval(intervalRef.current)
						return
					}
					setProgress(prev => {
						if (prev >= 100) {
							if (intervalRef.current) {
								clearInterval(intervalRef.current)
								intervalRef.current = null
							}
							timeoutRef.current = setTimeout(() => {
								timeoutRef.current = null
								if (isMountedRef.current) onComplete?.(base64)
							}, REDIRECT_DELAY_MS)
							return 100
						}
						return Math.min(prev + PROGRESS_STEP, 100)
					})
				}, PROGRESS_INTERVAL_MS)
			}
			reader.readAsDataURL(selectedFile)
		},
		[isSignedIn, onComplete]
	)

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isSignedIn) return
		const files = e.target.files
		if (files?.length) processFile(files[0])
	}

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)

		if (!isSignedIn) return
		const droppedFile = e.dataTransfer.files[0]

		const allowedTypes = ['image/jpeg', 'image/png']
		if (!allowedTypes.includes(droppedFile.type)) return

		if (droppedFile.size > MAX_FILE_SIZE) return

		processFile(droppedFile)
	}

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		if (!isSignedIn) return
		setIsDragging(true)
	}

	const onDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}

	return (
		<div className="upload">
			{!file ? (
				<div
					className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
				>
					<input
						ref={inputRef}
						type="file"
						className="drop-input"
						accept=".jpg,.jpeg,.png"
						disabled={!isSignedIn}
						onChange={onChange}
					/>

					<div className="drop-content">
						<div className="drop-icon">
							<UploadIcon size={20} />
						</div>
						<p>
							{isSignedIn
								? 'Click to upload or just drag and drop'
								: 'Sign in to upload your floor plan'}
						</p>
						<p className="help">Maximum file size 50MB</p>
					</div>
				</div>
			) : (
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{progress === 100 ? (
								<CheckCircleIcon className="check" />
							) : (
								<ImageIcon className="image" />
							)}
						</div>
						<h3>{file.name}</h3>

						<div className="progress">
							<div
								className="bar"
								style={{ width: `${progress}%` }}
							/>
							<p className="status-text">
								{progress < 100 ? 'Analyzing...' : 'Uploading...'}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
