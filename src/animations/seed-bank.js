import { Draggable, ScrollTrigger, gsap } from '../lib/gsap.js';

const seedBank = document.querySelector('.seed-bank');
const cards = gsap.utils.toArray('[data-seed-card]');
const counter = document.querySelector('[data-seed-count]');
const continueLink = document.querySelector('.seed-continue');
const progressMarkers = gsap.utils.toArray('.seed-progress-track i');
const garden = document.querySelector('.garden');
const scrollGate = document.querySelector('[data-seed-scroll-gate]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let plantedCount = 0;
let scrollLocked = Boolean(seedBank && garden);
let gateMessageTimer;

const revealScrollGate = () => {
	if (!scrollGate || scrollGate.classList.contains('is-visible')) return;
	scrollGate.classList.add('is-visible');
};

const handleScroll = () => {
	if (!scrollLocked || !seedBank) return;

	const seedBankBottom = seedBank.getBoundingClientRect().bottom;
	if (seedBankBottom <= window.innerHeight + 2) revealScrollGate();
};

const releaseScrollGate = () => {
	if (!scrollLocked) return;
	scrollLocked = false;

	window.removeEventListener('scroll', handleScroll);
	document.body.classList.remove('is-garden-locked');
	window.requestAnimationFrame(() => ScrollTrigger.refresh());

	if (!scrollGate?.classList.contains('is-visible')) return;

	scrollGate.classList.add('is-unlocked');
	const message = scrollGate.querySelector('strong');
	if (message) message.textContent = 'Your garden is ready';

	window.clearTimeout(gateMessageTimer);
	gateMessageTimer = window.setTimeout(() => {
		scrollGate.classList.remove('is-visible');
	}, reducedMotion ? 0 : 900);
};

if (scrollLocked) {
	document.body.classList.add('is-garden-locked');
	window.addEventListener('scroll', handleScroll, { passive: true });
}

if (!reducedMotion) {
	const seedVisibilityObserver = new IntersectionObserver(
		(entries, observer) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-in-view');
				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.9 },
	);

	cards.forEach((card) => seedVisibilityObserver.observe(card));
}

const updateProgress = () => {
	plantedCount += 1;

	if (counter) {
		counter.textContent = `${String(plantedCount).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
	}

	seedBank?.setAttribute('data-planted-count', String(plantedCount));
	progressMarkers[plantedCount - 1]?.classList.add('is-planted');

	if (plantedCount === 1 && continueLink) {
		releaseScrollGate();
		continueLink.classList.add('is-ready');
		continueLink.setAttribute('aria-hidden', 'false');
		continueLink.setAttribute('tabindex', '0');

		gsap.fromTo(
			continueLink,
			{ y: 12, opacity: 0 },
			{
				y: 0,
				opacity: 1,
				duration: reducedMotion ? 0 : 0.55,
				ease: 'power3.out',
			},
		);
	}
};

cards.forEach((card) => {
	const pod = card.querySelector('[data-seed-pod]');
	const target = card.querySelector('[data-plant-target]');
	const sprout = card.querySelector('.target-sprout');
	const status = card.querySelector('[data-seed-status]');
	const lifecycle = card.querySelector('[data-seed-lifecycle]');
	const art = card.querySelector('.seed-art');
	const seedIndex = Number(card.dataset.seedIndex);
	let draggable;
	let planted = false;

	if (!pod || !target || !art) return;

	const plantSeed = () => {
		if (planted) return;

		planted = true;
		draggable?.disable();
		card.classList.remove('is-dragging');
		target.classList.remove('is-near');
		pod.setAttribute('aria-pressed', 'true');
		pod.setAttribute('disabled', '');

		const podRect = pod.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		const deltaX = targetRect.left + targetRect.width / 2 - (podRect.left + podRect.width / 2);
		const deltaY = targetRect.top + targetRect.height / 2 - (podRect.top + podRect.height / 2);
		const currentX = Number(gsap.getProperty(pod, 'x')) || 0;
		const currentY = Number(gsap.getProperty(pod, 'y')) || 0;

		const timeline = gsap.timeline({
			onComplete: () => {
				card.classList.add('is-planted');
				if (status) status.textContent = 'Planted';
				if (lifecycle) lifecycle.textContent = 'Chosen by you';
				updateProgress();
				navigator.vibrate?.(12);
				document.dispatchEvent(
					new CustomEvent('algorithm-garden:seed-planted', {
						detail: {
							index: seedIndex,
							name: card.dataset.seedName,
							count: plantedCount,
						},
					}),
				);
			},
		});

		timeline
			.to(pod, {
				x: currentX + deltaX,
				y: currentY + deltaY,
				rotation: 90,
				scale: 0.16,
				opacity: 0,
				duration: reducedMotion ? 0 : 0.52,
				ease: 'power3.in',
			})
			.fromTo(
				sprout,
				{ scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
				{
					scaleY: 1,
					opacity: 1,
					duration: reducedMotion ? 0 : 0.62,
					ease: 'back.out(1.8)',
				},
				reducedMotion ? 0 : 0.34,
			)
			.fromTo(
				card.querySelectorAll('.target-leaf'),
				{ scale: 0, transformOrigin: '50% 100%' },
				{
					scale: 1,
					stagger: 0.08,
					duration: reducedMotion ? 0 : 0.38,
					ease: 'back.out(2)',
				},
				reducedMotion ? 0 : 0.58,
			);
	};

	pod.addEventListener('click', (event) => {
		if (reducedMotion || event.detail === 0) plantSeed();
	});

	if (reducedMotion) return;

	card.addEventListener('pointerenter', () => {
		if (planted || card.classList.contains('is-dragging')) return;

		gsap.to(pod, {
			y: 28,
			rotation: 42,
			scale: 0.84,
			duration: 0.38,
			ease: 'power2.out',
			overwrite: 'auto',
		});
	});

	card.addEventListener('pointerleave', () => {
		if (planted || card.classList.contains('is-dragging')) return;

		gsap.to(pod, {
			y: 0,
			rotation: 27,
			scale: 1,
			duration: 0.42,
			ease: 'power2.out',
			overwrite: 'auto',
		});
	});

	[draggable] = Draggable.create(pod, {
		type: 'x,y',
		bounds: art,
		inertia: true,
		edgeResistance: 0.82,
		dragResistance: 0.05,
		minimumMovement: 4,
		dragClickables: true,
		activeCursor: 'grabbing',
		onClick: plantSeed,
		onPress() {
			card.classList.add('is-dragging');
			gsap.to(pod, {
				scale: 1.08,
				duration: 0.18,
				ease: 'power2.out',
			});
		},
		onDrag() {
			target.classList.toggle('is-near', Draggable.hitTest(pod, target, '24%'));
		},
		onRelease() {
			if (Draggable.hitTest(pod, target, '24%')) {
				plantSeed();
				return;
			}

			card.classList.remove('is-dragging');
			target.classList.remove('is-near');

			if (!this.tween) {
				gsap.to(pod, {
					x: 0,
					y: 0,
					rotation: 27,
					scale: 1,
					duration: 0.65,
					ease: 'elastic.out(1, 0.55)',
				});
			}
		},
		onThrowUpdate() {
			target.classList.toggle('is-near', Draggable.hitTest(pod, target, '24%'));
		},
		onThrowComplete() {
			if (Draggable.hitTest(pod, target, '24%')) {
				plantSeed();
				return;
			}

			card.classList.remove('is-dragging');
			target.classList.remove('is-near');
			gsap.to(pod, {
				x: 0,
				y: 0,
				rotation: 27,
				scale: 1,
				duration: 0.65,
				ease: 'elastic.out(1, 0.55)',
			});
		},
	});
});
