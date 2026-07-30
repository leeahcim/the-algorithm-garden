import { gsap } from '../lib/gsap.js';

const closing = document.querySelector('[data-closing]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chosenSeeds = new Map();

if (closing) {
	const petals = gsap.utils.toArray('.closing-flower path');
	const countElement = closing.querySelector('[data-closing-count]');
	const messageElement = closing.querySelector('[data-closing-message]');
	const ctaCopy = closing.querySelector('[data-closing-cta]');
	const listFormatter = new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction',
	});

	document.addEventListener('algorithm-garden:seed-planted', (event) => {
		const index = Number(event.detail?.index);
		const name = event.detail?.name;

		if (!Number.isFinite(index) || !name) return;
		chosenSeeds.set(index, name);
		petals[index]?.classList.add('is-chosen');

		const names = [...chosenSeeds.values()];
		const count = names.length;

		if (countElement) {
			countElement.textContent = String(count).padStart(2, '0');
		}

		if (messageElement) {
			const chosenActions = names.map((name) => name.toLowerCase());
			messageElement.textContent =
				count === 1
					? `You chose to ${chosenActions[0]}. One deliberate choice is enough to change what grows next.`
					: `You chose to ${listFormatter.format(chosenActions)}. A feed predicts your interests. A garden reflects your choices.`;
		}

		if (ctaCopy) {
			ctaCopy.textContent =
				count < petals.length ? 'Choose another seed' : 'Return to the seed bank';
		}

	});
}

if (closing && !reducedMotion) {
	const rings = closing.querySelector('.closing-rings');
	const pulseRings = gsap.utils.toArray('.closing-ring-pulse');
	const flower = closing.querySelector('.closing-flower');
	const petals = gsap.utils.toArray('.closing-flower path');
	const flowerCenter = closing.querySelector('.closing-flower circle');
	const eyebrow = closing.querySelector('.eyebrow');
	const statementLines = gsap.utils.toArray('.closing h2 > span');
	const summary = closing.querySelector('.closing-summary');
	const cta = closing.querySelector('.closing-cta');
	const footer = closing.querySelector('footer');

	gsap.set(closing, { clipPath: 'inset(8% 0 0 0)' });
	gsap.set(rings, {
		scale: 0.72,
		rotation: -18,
		opacity: 0,
		transformOrigin: '50% 50%',
	});
	gsap.set(pulseRings, {
		scale: 0.55,
		opacity: 1,
		borderColor: 'rgba(75, 118, 33, 0.1)',
		backgroundColor: 'rgba(200, 255, 90, 0.025)',
	});
	gsap.set(flower, { rotation: -30, transformOrigin: '50% 50%' });
	gsap.set(petals, { scale: 0, transformOrigin: '50% 50%' });
	gsap.set(flowerCenter, { scale: 0, transformOrigin: '50% 50%' });
	gsap.set(eyebrow, { y: 18, opacity: 0 });
	gsap.set(statementLines, { yPercent: 115, opacity: 0 });
	gsap.set(summary, { y: 20, opacity: 0 });
	gsap.set(cta, { y: 26, scale: 0.92, opacity: 0 });
	gsap.set(footer, { y: 18, opacity: 0 });

	const ringPulse = gsap.to(pulseRings, {
		scale: 1.75,
		borderColor: 'rgba(75, 118, 33, 0)',
		backgroundColor: 'rgba(200, 255, 90, 0)',
		duration: 22.5,
		ease: 'power1.out',
		stagger: {
			each: 4.5,
			repeat: -1,
		},
	});

	ringPulse.time(22.5);

	const reveal = gsap.timeline({
		defaults: { ease: 'none' },
		scrollTrigger: {
			trigger: closing,
			start: 'top 82%',
			end: 'top 18%',
			scrub: 0.75,
		},
	});

	reveal
		.to(closing, {
			clipPath: 'inset(0% 0 0 0)',
			duration: 0.48,
			ease: 'power2.out',
		})
		.to(rings, {
			scale: 1,
			rotation: 0,
			opacity: 1,
			duration: 0.7,
			ease: 'power3.out',
		}, 0.05)
		.to(
			flower,
			{
				rotation: 0,
				duration: 0.56,
				ease: 'power2.out',
			},
			0.18,
		)
		.to(
			petals,
			{
				scale: 1,
				stagger: 0.06,
				duration: 0.42,
				ease: 'back.out(1.8)',
			},
			0.22,
		)
		.to(
			flowerCenter,
			{
				scale: 1,
				duration: 0.3,
				ease: 'back.out(2)',
			},
			0.46,
		)
		.to(
			eyebrow,
			{
				y: 0,
				opacity: 1,
				duration: 0.34,
				ease: 'power2.out',
			},
			0.44,
		)
		.to(
			statementLines,
			{
				yPercent: 0,
				opacity: 1,
				stagger: 0.08,
				duration: 0.5,
				ease: 'power3.out',
			},
			0.55,
		)
		.to(
			summary,
			{
				y: 0,
				opacity: 1,
				duration: 0.4,
				ease: 'power2.out',
			},
			0.76,
		)
		.to(
			cta,
			{
				y: 0,
				scale: 1,
				opacity: 1,
				duration: 0.38,
				ease: 'back.out(1.4)',
			},
			0.9,
		)
		.to(
			footer,
			{
				y: 0,
				opacity: 1,
				duration: 0.34,
				ease: 'power2.out',
			},
			1,
		);

	if (cta && window.matchMedia('(pointer: fine)').matches) {
		const arrow = cta.querySelector('svg');
		const moveCtaX = gsap.quickTo(cta, 'x', { duration: 0.35, ease: 'power3.out' });
		const moveCtaY = gsap.quickTo(cta, 'y', { duration: 0.35, ease: 'power3.out' });
		const moveArrowX = gsap.quickTo(arrow, 'x', { duration: 0.3, ease: 'power3.out' });
		const moveArrowY = gsap.quickTo(arrow, 'y', { duration: 0.3, ease: 'power3.out' });

		cta.addEventListener('pointermove', (event) => {
			const bounds = cta.getBoundingClientRect();
			const x = event.clientX - (bounds.left + bounds.width / 2);
			const y = event.clientY - (bounds.top + bounds.height / 2);

			moveCtaX(x * 0.1);
			moveCtaY(y * 0.16);
			moveArrowX(x * 0.18);
			moveArrowY(y * 0.24);
		});

		cta.addEventListener('pointerleave', () => {
			moveCtaX(0);
			moveCtaY(0);
			moveArrowX(0);
			moveArrowY(0);
		});
	}
}
