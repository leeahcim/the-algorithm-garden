import { gsap, ScrollTrigger } from '../lib/gsap.js';

const section = document.querySelector('.interruption');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (section && !reducedMotion) {
	const lines = section.querySelectorAll('.interruption-line');
	const rootDiagram = section.querySelector('.root-diagram');
	const rootPaths = rootDiagram.querySelectorAll('path');
	const rootNodes = rootDiagram.querySelectorAll('circle');

	gsap.set(rootPaths, { drawSVG: '0%' });
	gsap.set(rootNodes, {
		scale: 0,
		transformOrigin: '50% 50%',
	});

	gsap.to(rootNodes, {
		attr: {
			r: (_index, node) => Number(node.getAttribute('r')) * 1.28,
		},
		duration: 1.8,
		ease: 'sine.inOut',
		stagger: {
			each: 0.14,
			repeat: -1,
			yoyo: true,
		},
	});

	const reveal = gsap.timeline({
		defaults: { ease: 'none' },
		scrollTrigger: {
			trigger: section,
			start: 'top 72%',
			end: 'bottom 62%',
			scrub: 0.7,
		},
	});

	reveal
		.from(
			section.querySelector('.eyebrow'),
			{
				y: 24,
				opacity: 0,
				duration: 0.12,
			},
			0,
		)
		.from(
			lines,
			{
				yPercent: 70,
				opacity: 0,
				stagger: 0.1,
				duration: 0.22,
			},
			0.05,
		)
		.fromTo(
			section.querySelector('.interruption-stamp'),
			{
				xPercent: 18,
				rotation: -14,
				opacity: 0,
			},
			{
				xPercent: -4,
				rotation: -8,
				opacity: 1,
				duration: 0.46,
				immediateRender: false,
			},
			0.08,
		)
		.from(
			section.querySelector('.interruption-note'),
			{
				x: 56,
				opacity: 0,
				duration: 0.2,
			},
			0.3,
		);

	const rootReveal = gsap.timeline({
		defaults: { ease: 'none' },
		scrollTrigger: {
			trigger: rootDiagram,
			start: 'top 90%',
			end: 'bottom 55%',
			scrub: 0.7,
		},
	});

	rootReveal
		.to(
			rootPaths,
			{
				drawSVG: '100%',
				stagger: 0.012,
				duration: 0.24,
			},
			0,
		)
		.to(
			rootNodes,
			{
				scale: 1,
				stagger: 0.04,
				duration: 0.12,
				ease: 'back.out(2)',
			},
			0.3,
		);

	if (document.fonts?.ready) {
		document.fonts.ready.then(() => ScrollTrigger.refresh());
	}
}
