import { gsap, ScrollTrigger } from '../lib/gsap.js';

const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && !reducedMotion) {
	hero.classList.add('is-animating');

	gsap.set('.feed-device', {
		opacity: 1,
		filter: 'saturate(1) brightness(1)',
	});
	gsap.set(['.feed-card-image', '.feed-card-copy', '.device-top'], {
		opacity: 1,
	});
	gsap.set('.hero h1 span', {
		xPercent: 0,
		yPercent: 0,
		opacity: 1,
	});
	gsap.set('.hero-index', { y: 0, opacity: 0.55 });
	gsap.set(['.hero-aside', '.hero-footnote'], { y: 0, opacity: 1 });
	gsap.set('.hero-ring-pulse', {
		scale: 0.55,
		opacity: 1,
		borderColor: 'rgba(200, 255, 90, 0.05)',
		backgroundColor: 'rgba(200, 255, 90, 0.05)',
	});

	const ringPulse = gsap.to('.hero-ring-pulse', {
		scale: 1.75,
		borderColor: 'rgba(200, 255, 90, 0)',
		backgroundColor: 'rgba(200, 255, 90, 0)',
		duration: 22.5,
		ease: 'power1.out',
		stagger: {
			each: 4.5,
			repeat: -1,
		},
	});

	ringPulse.time(22.5);

	gsap.to('.feed-orbit', {
		rotation: '+=360',
		duration: 54,
		ease: 'none',
		repeat: -1,
	});

	const intro = gsap.timeline({
		defaults: {
			duration: 0.9,
			ease: 'power3.out',
		},
		onComplete: () => hero.classList.remove('is-animating'),
	});

	intro
		.from('.site-header', {
			yPercent: -100,
			opacity: 0,
			duration: 0.65,
		})
		.from(
			'.hero-kicker',
			{
				y: 16,
				opacity: 0,
				duration: 0.6,
			},
			0.18,
		);

	const interruption = gsap.timeline({
		defaults: { ease: 'none' },
		scrollTrigger: {
			trigger: hero,
			start: 'top top',
			end: '+=140%',
			scrub: 0.7,
			pin: true,
			anticipatePin: 1,
		},
	});

	interruption
    .to(
      '.feed-device',
      {
        rotation: -2,
        xPercent: 2,
        scale: 1.04,
        filter: 'saturate(0.55) brightness(0.72)',
        duration: 0.22,
      },
      0,
    )
		.to(
			'.feed-shapes',
			{
				rotation: -55,
				scale: 1.18,
				duration: 0.24,
			},
			0,
		)
		.to(
			'.feed-shape-coral',
			{
				xPercent: 24,
				yPercent: 12,
				scale: 0.72,
				duration: 0.24,
			},
			0,
		)
		.to(
			'.feed-shape-violet',
			{
				xPercent: -12,
				yPercent: -8,
				scale: 1.16,
				duration: 0.24,
			},
			0,
		)
		.to(
			'.feed-shape-core',
			{
				xPercent: 18,
				yPercent: -18,
				scale: 1.35,
				duration: 0.24,
			},
			0,
		)
		.to(
			'.feed-orbit-motion',
			{
				scale: 1.12,
				duration: 0.24,
			},
			0,
		)
    .to(
      [
        '.feed-card-image',
        '.feed-card-copy',
        '.device-top',
        '.device-bottom',
      ],
      {
        opacity: 0,
        duration: 0.2,
      },
      0.08,
    )
		.fromTo(
			'.hero h1 span:first-child',
			{
				xPercent: 0,
				opacity: 1,
			},
			{
				xPercent: -16,
				opacity: 0.18,
				duration: 0.22,
				immediateRender: false,
			},
			0.08,
		)
		.fromTo(
			'.hero h1 span:last-child',
			{
				xPercent: 0,
				opacity: 1,
			},
			{
				xPercent: 16,
				opacity: 0.18,
				duration: 0.22,
				immediateRender: false,
			},
			0.08,
		)
		.to(
			'.hero h1 span:first-child',
			{
				xPercent: -32,
				opacity: 0,
				duration: 0.2,
			},
			0.3,
		)
		.to(
			'.hero h1 span:last-child',
			{
				xPercent: 32,
				opacity: 0,
				duration: 0.2,
			},
			0.3,
		)
		.to(
			['.hero-aside', '.hero-index', '.hero-footnote'],
			{
				opacity: 0,
				y: -14,
				duration: 0.16,
			},
			0.12,
		)
		.to(
			'.hero-grid',
			{
				scale: 1.16,
				opacity: 0.08,
				duration: 0.24,
			},
			0.12,
		)
		.to(
			'.hero-video-layer',
			{
				scale: 1.08,
				opacity: 0.08,
				duration: 0.3,
			},
			0.12,
		)
		.to(
			'.hero-override',
			{
				clipPath: 'circle(150% at 73% 52%)',
				duration: 0.42,
				ease: 'power3.inOut',
			},
			0.3,
		)
		.from(
			'.hero-override strong',
			{
				scale: 0.72,
				opacity: 0,
				duration: 0.22,
				ease: 'power2.out',
			},
			0.48,
		)
		.from(
			['.hero-override span', '.hero-override small'],
			{
				y: 12,
				opacity: 0,
				stagger: 0.04,
				duration: 0.14,
				ease: 'power2.out',
			},
			0.52,
		);

	if (document.fonts?.ready) {
		document.fonts.ready.then(() => ScrollTrigger.refresh());
	}
}
