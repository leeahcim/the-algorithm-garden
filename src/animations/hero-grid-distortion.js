const createGridDistortion = (surface, canvas, waveRings = []) => {
	const context = canvas?.getContext('2d');
	if (!surface || !canvas || !context) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
	const pointer = { x: 0, y: 0, active: false };
	const influenceRadius = 150;
	const displacement = 30;
	const waveDisplacement = 22;

	let width = 0;
	let height = 0;
	let columns = 0;
	let rows = 0;
	let points = [];
	let animationFrame;
	let isVisible = false;

	const getRingWaves = () => {
		const surfaceBounds = surface.getBoundingClientRect();
		const band = Math.max(50, Math.min(76, width * 0.045));

		return waveRings.flatMap((ring) => {
			const ringBounds = ring.getBoundingClientRect();
			const restingDiameter = ring.offsetWidth;

			if (!restingDiameter || !ringBounds.width) return [];

			const scale = ringBounds.width / restingDiameter;
			const progress = Math.max(0, Math.min(1, (scale - 0.55) / 1.2));

			return {
				x: ringBounds.left - surfaceBounds.left + ringBounds.width / 2,
				y: ringBounds.top - surfaceBounds.top + ringBounds.height / 2,
				radius: ringBounds.width / 2,
				strength: (1 - progress) ** 0.7,
				band,
			};
		});
	};

	const draw = () => {
		context.clearRect(0, 0, width, height);
		context.beginPath();

		for (let row = 0; row < rows; row += 1) {
			for (let column = 0; column < columns; column += 1) {
				const index = row * columns + column;
				const point = points[index];

				if (column < columns - 1) {
					const right = points[index + 1];
					context.moveTo(point.x, point.y);
					context.lineTo(right.x, right.y);
				}

				if (row < rows - 1) {
					const below = points[index + columns];
					context.moveTo(point.x, point.y);
					context.lineTo(below.x, below.y);
				}
			}
		}

		context.strokeStyle = 'rgba(241, 239, 229, 0.08)';
		context.lineWidth = 1;
		context.stroke();

		context.fillStyle = 'rgba(200, 255, 90, 0.15)';
		for (const point of points) {
			context.beginPath();
			context.arc(point.x, point.y, 1.15, 0, Math.PI * 2);
			context.fill();
		}
	};

	const update = () => {
		const ringWaves = getRingWaves();

		for (const point of points) {
			let targetX = point.originX;
			let targetY = point.originY;

			if (pointer.active) {
				const differenceX = pointer.x - point.originX;
				const differenceY = pointer.y - point.originY;
				const distance = Math.hypot(differenceX, differenceY);

				if (distance < influenceRadius) {
					const force = (1 - distance / influenceRadius) ** 2;
					const safeDistance = Math.max(distance, 0.01);
					targetX -= (differenceX / safeDistance) * force * displacement;
					targetY -= (differenceY / safeDistance) * force * displacement;
				}
			}

			for (const ringWave of ringWaves) {
				const differenceX = point.originX - ringWave.x;
				const differenceY = point.originY - ringWave.y;
				const distance = Math.hypot(differenceX, differenceY);
				const distanceFromWave = Math.abs(distance - ringWave.radius);

				if (distanceFromWave < ringWave.band) {
					const edgeForce = (1 - distanceFromWave / ringWave.band) ** 2;
					const safeDistance = Math.max(distance, 0.01);
					const force = edgeForce * ringWave.strength * waveDisplacement;

					targetX += (differenceX / safeDistance) * force;
					targetY += (differenceY / safeDistance) * force;
				}
			}

			point.x += (targetX - point.x) * 0.13;
			point.y += (targetY - point.y) * 0.13;
		}
	};

	const animate = () => {
		if (!isVisible) return;
		update();
		draw();
		animationFrame = window.requestAnimationFrame(animate);
	};

	const resize = () => {
		const bounds = surface.getBoundingClientRect();
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		const spacing = Math.max(48, Math.min(72, bounds.width / 23));

		width = Math.max(1, bounds.width);
		height = Math.max(1, bounds.height);
		canvas.width = Math.round(width * pixelRatio);
		canvas.height = Math.round(height * pixelRatio);
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

		columns = Math.ceil(width / spacing) + 3;
		rows = Math.ceil(height / spacing) + 3;

		const offsetX = (width - (columns - 1) * spacing) / 2;
		const offsetY = (height - (rows - 1) * spacing) / 2;

		points = Array.from({ length: columns * rows }, (_, index) => {
			const originX = offsetX + (index % columns) * spacing;
			const originY = offsetY + Math.floor(index / columns) * spacing;

			return { x: originX, y: originY, originX, originY };
		});

		draw();
	};

	const setPointer = (event) => {
		const bounds = surface.getBoundingClientRect();
		pointer.x = event.clientX - bounds.left;
		pointer.y = event.clientY - bounds.top;
		pointer.active = true;
	};

	const clearPointer = () => {
		pointer.active = false;
	};

	const visibilityObserver = new IntersectionObserver(([entry]) => {
		isVisible = entry.isIntersecting;
		window.cancelAnimationFrame(animationFrame);

		if (isVisible && !reducedMotion) {
			animate();
		}
	});

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(surface);
	visibilityObserver.observe(surface);
	resize();

	if (!reducedMotion && !coarsePointer) {
		surface.addEventListener('pointermove', setPointer);
		surface.addEventListener('pointerleave', clearPointer);
	}
};

const hero = document.querySelector('.hero');
createGridDistortion(
	hero,
	hero?.querySelector('.hero-grid-canvas'),
	hero ? [...hero.querySelectorAll('.hero-ring-pulse')] : [],
);

const garden = document.querySelector('.garden');
createGridDistortion(garden, garden?.querySelector('.garden-grid-canvas'));
