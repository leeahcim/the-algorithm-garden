import { ScrollTrigger, gsap } from '../lib/gsap.js';

const garden = document.querySelector('.garden');
const gardenStage = document.querySelector('.garden-stage');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chosenSignal = document.querySelector('[data-signal-kind="chosen"]');
const animatedPlants = gsap.utils.toArray('.plant');
const plantMotionConfigs = [
	{ right: 1.25, left: -1.05, head: -1.8, sway: 4.9, return: 4.6, breath: 1.025 },
	{ right: 1.65, left: -1.3, head: -2.8, sway: 5.6, return: 5.1, breath: 1.04 },
	{ right: 1.6, left: -1.35, head: -2.4, sway: 4.6, return: 4.4, breath: 1.035 },
	{ right: 1.1, left: -1.45, head: -2.1, sway: 5.2, return: 4.7, breath: 1.03 },
	{ right: 1.8, left: -1.15, head: -3.2, sway: 4.7, return: 5.3, breath: 1.045 },
	{ right: 1.4, left: -1.7, head: -2.7, sway: 5.8, return: 4.9, breath: 1.04 },
	{ right: 1.2, left: -1.25, head: -1.9, sway: 5.4, return: 5.1, breath: 1.028 },
];
const plantMotions = new Map();
let growth;

const createPlantMotion = (plant) => {
	if (reducedMotion || !plant) return;
	if (plantMotions.has(plant)) return plantMotions.get(plant);

	const plantIndex = animatedPlants.indexOf(plant);
	const config = plantMotionConfigs[plantIndex] ?? plantMotionConfigs[0];
	const flowerHead = plant.querySelector('.flower-head');
	const petalMotions = gsap.utils.toArray(
		plant.querySelectorAll('.petal-motion'),
	);
	if (!flowerHead) return;

	const motions = [];
	const plantSway = gsap.timeline({
		paused: true,
		repeat: -1,
		defaults: { ease: 'sine.inOut' },
	});

	plantSway
		.to(plant, {
			rotation: config.right,
			duration: config.sway,
			transformOrigin: '50% 100%',
		})
		.to(plant, {
			rotation: config.left,
			duration: config.sway + 0.6,
			transformOrigin: '50% 100%',
		})
		.to(plant, {
			rotation: 0,
			duration: config.return,
			transformOrigin: '50% 100%',
		});
	motions.push(plantSway);

	const headFollow = gsap.to(flowerHead, {
		paused: true,
		rotation: config.head,
		duration: config.sway + 0.8,
		ease: 'sine.inOut',
		yoyo: true,
		repeat: -1,
		transformOrigin: '56% 78%',
	});
	motions.push(headFollow);

	const headBreath = gsap.to(flowerHead, {
		paused: true,
		scale: config.breath,
		duration: 3.5 + plantIndex * 0.3,
		ease: 'sine.inOut',
		yoyo: true,
		repeat: -1,
		transformOrigin: '56% 78%',
	});
	motions.push(headBreath);

	if (petalMotions.length) {
		const petalDrift = gsap.to(petalMotions, {
			paused: true,
			rotation: (index) => [-1.1, 1.35, -0.75, 0.95, -0.9][index % 5],
			duration: 4.2,
			ease: 'sine.inOut',
			stagger: 0.22,
			yoyo: true,
			repeat: -1,
			transformOrigin: '50% 70%',
		});
		motions.push(petalDrift);
	}

	plantMotions.set(plant, motions);
	return motions;
};

const playPlantMotion = (plant) => {
	if (!plant?.classList.contains('is-chosen')) return;
	createPlantMotion(plant)?.forEach((motion) => motion.play());
};

const playChosenPlantMotions = () => {
	animatedPlants.forEach(playPlantMotion);
};

const pausePlantMotions = () => {
	plantMotions.forEach((motions) => {
		motions.forEach((motion) => motion.pause());
	});
};

const illuminateSpecimen = (index) => {
	if (!Number.isFinite(index)) return;

	const specimen = document.querySelector(`[data-garden-growth="${index}"]`);
	const label = document.querySelector(`[data-garden-label="${index}"]`);
	const grassTuft = document.querySelector(`[data-grass-growth="${index}"]`);

	if (!specimen) return;
	garden?.classList.add('has-selection');
	specimen.classList.add('is-chosen');
	label?.classList.add('is-chosen');
	grassTuft?.classList.add('is-chosen');

	const gardenIsVisible = garden && garden.getBoundingClientRect().top < window.innerHeight * 0.85;
	if (specimen.classList.contains('plant') && gardenIsVisible) {
		playPlantMotion(specimen);
	}

	if (!reducedMotion && (garden?.classList.contains('has-grown') || gardenIsVisible)) {
		gsap.fromTo(
			specimen,
			{ scale: 0.94 },
			{
				scale: 1,
				duration: 0.7,
				ease: 'elastic.out(1, 0.45)',
				transformOrigin: '50% 100%',
			},
		);
	}
};

document.addEventListener('algorithm-garden:seed-planted', (event) => {
	illuminateSpecimen(Number(event.detail?.index));

	const count = Number(event.detail?.count);
	if (!Number.isFinite(count) || !chosenSignal) return;

	const formattedCount = String(count).padStart(2, '0');
	chosenSignal.dataset.signalValue = formattedCount;

	if (reducedMotion || (growth && growth.progress() > 0.8)) {
		chosenSignal.textContent = formattedCount;

		if (!reducedMotion) {
			gsap.fromTo(
				chosenSignal,
				{ scale: 0.88 },
				{ scale: 1, duration: 0.45, ease: 'back.out(2)' },
			);
		}
	}
});

if (garden && !reducedMotion) {
	const skyCopy = gsap.utils.toArray('.garden-sky > *');
	const stems = gsap.utils.toArray('.plant .stem');
	const leaves = gsap.utils.toArray('.plant .leaf');
	const blooms = gsap.utils.toArray(
		'.plant .bloom, .plant .bloom-center, .plant .flower-star, .plant .petal',
	);
	const isDelayedPlantPart = (element) =>
		Boolean(element.closest('.plant-four, .plant-five, .plant-six, .plant-seven'));
	const originalStems = stems.filter((stem) => !isDelayedPlantPart(stem));
	const delayedStems = stems.filter(isDelayedPlantPart);
	const originalLeaves = leaves.filter((leaf) => !isDelayedPlantPart(leaf));
	const delayedLeaves = leaves.filter(isDelayedPlantPart);
	const originalBlooms = blooms.filter((bloom) => !isDelayedPlantPart(bloom));
	const delayedBlooms = blooms.filter(isDelayedPlantPart);
	const grassTufts = gsap.utils.toArray('.grass-tuft');
	const grassGrowthMasks = gsap.utils.toArray('.grass-tuft-size');
	const grassBlades = gsap.utils.toArray('.grass-blade');
	const labels = gsap.utils.toArray('.garden-label');
	const originalLabels = labels.filter(
		(label) => Number(label.dataset.gardenLabel) < 4,
	);
	const delayedLabels = labels.filter(
		(label) => Number(label.dataset.gardenLabel) >= 4,
	);
	const signals = gsap.utils.toArray('[data-signal]');
	const grassMotions = grassTufts.map((tuft, index) =>
		gsap.to(tuft, {
			paused: true,
			rotation: index % 2 === 0 ? 2.6 : -2.1,
			duration: 3.2 + (index % 7) * 0.32,
			delay: (index % 9) * 0.09,
			ease: 'sine.inOut',
			yoyo: true,
			repeat: -1,
			transformOrigin: '50% 100%',
		}),
	);
	const grassBladeMotions = grassTufts.map((tuft, tuftIndex) =>
		gsap.to(tuft.querySelectorAll('.grass-blade'), {
			paused: true,
			rotation: (bladeIndex) =>
				(bladeIndex + tuftIndex) % 2 === 0 ? 0.8 : -0.65,
			duration: 4 + tuftIndex * 0.25,
			stagger: 0.018,
			ease: 'sine.inOut',
			yoyo: true,
			repeat: -1,
			transformOrigin: '50% 100%',
		}),
	);
	const playGrassMotion = () => {
		grassTufts.forEach((tuft, index) => {
			const isChosen = tuft.closest('[data-grass-growth]')?.classList.contains('is-chosen');
			if (!isChosen) return;

			grassMotions[index]?.play();
			grassBladeMotions[index]?.play();
		});
	};
	const pauseGrassMotion = () => {
		grassMotions.forEach((motion) => motion.pause());
		grassBladeMotions.forEach((motion) => motion.pause());
	};

	gsap.set(garden, { clipPath: 'inset(6% 0 0 0)' });
	gsap.set(skyCopy, { y: 48, opacity: 0 });
	gsap.set('.sun-disc', { scale: 0, transformOrigin: '50% 50%' });
	gsap.set('.garden-ground', { yPercent: 72 });
	gsap.set(stems, { drawSVG: '0%' });
	gsap.set(leaves, { scale: 0, transformOrigin: '50% 100%' });
	gsap.set(blooms, { scale: 0, transformOrigin: '50% 50%' });
	gsap.set(grassGrowthMasks, { clipPath: 'inset(100% 0 0 0)' });
	gsap.set(labels, { y: 20, opacity: 0 });
	gsap.set(signals, { y: 28, opacity: 0 });

	growth = gsap.timeline({
		defaults: { ease: 'none' },
		scrollTrigger: {
			trigger: gardenStage,
			start: 'top 60%',
			end: 'bottom 50%',
			scrub: 0.8,
			onEnter: () => {
				const chosenPlants = gsap.utils.toArray('.plant.is-chosen');
				playGrassMotion();
				if (!chosenPlants.length) return;

				playChosenPlantMotions();
				gsap.fromTo(
					chosenPlants,
					{ scale: 0.88 },
					{
						scale: 1,
						duration: 0.9,
						stagger: 0.12,
						ease: 'back.out(1.8)',
						transformOrigin: '50% 100%',
					},
				);
			},
			onLeave: () => {
				garden.classList.add('has-grown');
				pausePlantMotions();
				pauseGrassMotion();
			},
			onEnterBack: () => {
				garden.classList.remove('has-grown');
				playChosenPlantMotions();
				playGrassMotion();
			},
			onLeaveBack: () => {
				pausePlantMotions();
				pauseGrassMotion();
			},
		},
	});

	growth
		.to(garden, {
			clipPath: 'inset(0% 0 0 0)',
			duration: 0.48,
			ease: 'power2.out',
		})
		.to(skyCopy, {
			y: 0,
			opacity: 1,
			stagger: 0.08,
			duration: 0.42,
			ease: 'power3.out',
		}, 0.08)
		.to(
			'.sun-disc',
			{
				scale: 1,
				duration: 0.65,
				ease: 'back.out(1.35)',
			},
			0.28,
		)
		.to(
			'.garden-ground',
			{
				yPercent: 0,
				duration: 0.52,
				ease: 'power2.out',
			},
			0.46,
		)
		.to(
			originalStems,
			{
				drawSVG: '100%',
				stagger: 0.12,
				duration: 0.76,
				ease: 'power1.inOut',
			},
      1.6,
		)
		.to(
			originalLeaves,
			{
				scale: 1,
				stagger: {
					each: 0.055,
					from: 'end',
				},
				duration: 0.42,
				ease: 'back.out(1.55)',
			},
      2.25,
		)
		.to(
			originalBlooms,
			{
				scale: 1,
				stagger: 0.07,
				duration: 0.45,
				ease: 'back.out(1.8)',
			},
      2.65,
		)
		.to(
			originalLabels,
			{
				y: 0,
				opacity: 1,
				stagger: 0.1,
				duration: 0.32,
				ease: 'power2.out',
			},
      3.45,
		)
		.to(
			signals,
			{
				y: 0,
				opacity: 1,
				stagger: 0.08,
				duration: 0.36,
				ease: 'power2.out',
			},
      7.2,
		)
		.to(
			delayedStems,
			{
				drawSVG: '100%',
				stagger: 0.1,
				duration: 0.78,
				ease: 'power1.inOut',
			},
      3.8,
		)
		.to(
			delayedLeaves,
			{
				scale: 1,
				stagger: {
					each: 0.07,
					from: 'end',
				},
				duration: 0.46,
				ease: 'back.out(1.55)',
			},
      4.45,
		)
		.to(
			delayedBlooms,
			{
				scale: 1,
				stagger: 0.04,
				duration: 0.48,
				ease: 'back.out(1.8)',
			},
      4.85,
		)
		.to(
			delayedLabels,
			{
				y: 0,
				opacity: 1,
				stagger: 0.1,
				duration: 0.34,
				ease: 'power2.out',
			},
      5.9,
		)
		.to(
			grassGrowthMasks,
			{
				clipPath: 'inset(0% 0 0 0)',
				stagger: {
					each: 0.07,
					from: 'start',
				},
				duration: 0.6,
				ease: 'back.out(1.4)',
			},
      4.95,
		);

	signals.forEach((signal, index) => {
		const valueElement = signal.querySelector('[data-signal-value]');
		const initialTargetValue = Number(valueElement?.dataset.signalValue);
		const isChosenSignal = valueElement?.dataset.signalKind === 'chosen';

		if (!valueElement || !Number.isFinite(initialTargetValue)) return;

		const state = { progress: 0 };
		const digits = String(valueElement.dataset.signalValue).length;
		valueElement.textContent = '0'.padStart(digits, '0');

		growth.to(
			state,
			{
				progress: 1,
				duration: 0.62,
				ease: 'power2.out',
				onUpdate: () => {
					const targetValue = isChosenSignal
						? Number(valueElement.dataset.signalValue)
						: initialTargetValue;

					valueElement.textContent = String(
						Math.round(targetValue * state.progress),
					).padStart(digits, '0');
				},
			},
        7.3 + index * 0.05,
		);
	});

	if (document.fonts?.ready) {
		document.fonts.ready.then(() => ScrollTrigger.refresh());
	}
}
