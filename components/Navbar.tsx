import { Box } from 'lucide-react'
import { Button } from './ui/Button'

export const Navbar = () => {
	const isSignedIn = false
	const username = 'HEXVEL'

	const handleAuthClick = () => {}

	return (
		<header className="navbar">
			<nav className="inner">
				<div className="left">
					<div className="brand">
						<Box className="logo" />
						<span className="name">VizAX</span>
					</div>
					<ul className="links">
						<a href="#">Products</a>
						<a href="#">Pricing</a>
						<a href="#">Community</a>
						<a href="#">Enterprice</a>
					</ul>
				</div>

				<div className="actions">
					{isSignedIn ? (
						<>
							<span className="greeting">
								{username ? `Hi, ${username}` : 'Signed in'}
							</span>
							<Button
								size="sm"
								onClick={handleAuthClick}
								className="btn"
							>
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Button
								onClick={handleAuthClick}
								size="sm"
								variant="ghost"
							>
								Log In
							</Button>
							<a
								href="#upload"
								className="cta"
							>
								Get Started
							</a>
						</>
					)}
				</div>
			</nav>
		</header>
	)
}
