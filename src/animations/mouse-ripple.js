const canvas = document.querySelector('.global-ripple-canvas');
const context = canvas?.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

if (canvas && context && !reducedMotion && !coarsePointer) {
	const ripples = [];
	const maxRadius = 110;
	const growthSpeed = 4.5;
	const startingOpacity = 0.28;
	const opacityStep = startingOpacity * growthSpeed / (maxRadius - 2) / 2;
	const maximumRipples = 72;

	let width = 0;
	let height = 0;
	let animationFrame;
	let isAnimating = false;

	const resize = () => {
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

		width = Math.max(1, window.innerWidth);
		height = Math.max(1, window.innerHeight);
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	};

	const getStrokeColor = (target) => {
		const section = target instanceof Element ? target.closest('section') : null;

		if (section?.classList.contains('hero') || section?.classList.contains('garden')) {
			return '241, 239, 229';
		}

		if (section?.classList.contains('interruption')) {
			return '23, 34, 25';
		}

		return '75, 118, 33';
	};

	const addRipple = (event) => {
		ripples.unshift({
			x: event.clientX,
			y: event.clientY,
			radius: 2,
			opacity: startingOpacity,
			color: getStrokeColor(event.target),
		});

		if (ripples.length > maximumRipples) {
			ripples.length = maximumRipples;
		}

		if (!isAnimating) {
			isAnimating = true;
			animate();
		}
	};

	const draw = () => {
		context.clearRect(0, 0, width, height);
		context.lineWidth = 1.15;

		for (let index = ripples.length - 1; index >= 0; index -= 1) {
			const ripple = ripples[index];
			ripple.radius += growthSpeed;
			ripple.opacity -= opacityStep;

			context.beginPath();
			context.strokeStyle = `rgba(${ripple.color}, ${Math.max(0, ripple.opacity)})`;
			context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
			context.stroke();

			if (ripple.opacity <= 0) {
				ripples.splice(index, 1);
			}
		}
	};

	const animate = () => {
		draw();

		if (ripples.length) {
			animationFrame = window.requestAnimationFrame(animate);
			return;
		}

		isAnimating = false;
		window.cancelAnimationFrame(animationFrame);
	};

	window.addEventListener('pointermove', addRipple, { passive: true });
	window.addEventListener('resize', resize);
	resize();
}
