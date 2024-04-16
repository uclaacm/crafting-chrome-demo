const timer = {
	pomodoro: 0.5,
	shortBreak: 5,
	longBreak: 15,
	longBreakInterval: 4,
	sessions: 0
};

let interval;

const buttonSound = new Audio('./assets/button-sound.mp3');
const mainButton = document.getElementById('start-btn');
const pomodoroButton = document.getElementById('pomodoro-btn');
const longBreakButton = document.getElementById('long-break-btn');
const shortBreakButton = document.getElementById('short-break-btn');
mainButton.addEventListener('click', () => {
	buttonSound.play();

	chrome.action.setBadgeText({ text: 'ON' });

	const { action } = mainButton.dataset;
	if (action === 'start') {
		startTimer();
	} else {
		stopTimer();
	}
});
pomodoroButton.addEventListener('click', () => {
	buttonSound.play();
});
longBreakButton.addEventListener('click', () => {
	buttonSound.play();
});
shortBreakButton.addEventListener('click', () => {
	buttonSound.play();
});

const modeButtons = document.querySelector('#mode-buttons');
modeButtons.addEventListener('click', handleMode);

function getRemainingTime(endTime) {
	const currentTime = Date.parse(new Date());
	const difference = endTime - currentTime;
	const total = Number.parseInt(difference / 1000, 10);
	const minutes = Number.parseInt((total / 60) % 60, 10);
	const seconds = Number.parseInt(total % 60, 10);

	return { total, minutes, seconds };
}

function startTimer() {
	chrome.alarms.clearAll();

	let { total } = timer.remainingTime;
	const endTime = Date.parse(new Date()) + total * 1000;

	if (timer.mode === 'pomodoro') timer.sessions++;

	if (timer.mode === 'pomodoro') {
		chrome.alarms.create({ delayInMinutes: timer.pomodoro });
		chrome.storage.sync.set({
            mode: 'pomodoro',
			lastTimer: timer.pomodoro,
			sessions: timer.sessions,
			currentMin: 25,
			currentSec: 0
		});
	} else if (timer.mode === 'shortBreak') {
		chrome.alarms.create({ delayInMinutes: timer.shortBreak });
		chrome.storage.sync.set({
            mode: 'shortBreak',
			lastTimer: timer.shortBreak,
			sessions: timer.sessions,
			currentMin: 5,
			currentSec: 0
		});
	} else if (timer.mode === 'longBreak') {
		chrome.alarms.create({ delayInMinutes: timer.longBreak });
		chrome.storage.sync.set({
            mode: 'longBreak',
			lastTimer: timer.longBreak,
			sessions: timer.sessions,
			currentMin: 15,
			currentSec: 0
		});
	}

	mainButton.dataset.action = 'stop';
	mainButton.textContent = 'Stop';
	mainButton.classList.add('active');

	interval = setInterval(function () {
		timer.remainingTime = getRemainingTime(endTime);
		updateClock();

		total = timer.remainingTime.total;
		if (total <= 0) {
			clearInterval(interval);

			switch (timer.mode) {
				case 'pomodoro':
					if (timer.sessions % timer.longBreakInterval === 0) {
						switchMode('longBreak');
					} else {
						switchMode('shortBreak');
					}
					break;
				default:
					switchMode('pomodoro');
			}

			if (Notification.permission === 'granted') {
				const text =
					timer.mode === 'pomodoro' ? `Time to start cookin'!` : 'Take a break!';
				new Notification(text);
			}

			document.querySelector(`[data-sound="${timer.mode}"]`).play();

			startTimer();
		}
	}, 1000);
}

function stopTimer() {
	chrome.alarms.clearAll();
	clearInterval(interval);
	mainButton.dataset.action = 'start';
	mainButton.textContent = 'Start';
	mainButton.classList.remove('active');
}

function updateClock() {
    console.log(timer);
	const { remainingTime } = timer;
	const minutes = `${remainingTime.minutes}`.padStart(2, '0');
	const seconds = `${remainingTime.seconds}`.padStart(2, '0');

	chrome.storage.sync.set({
		currentMin: remainingTime.minutes,
		currentSec: remainingTime.seconds
	});

	const min = document.getElementById('js-minutes');
	const sec = document.getElementById('js-seconds');
	min.textContent = minutes;
	sec.textContent = seconds;

	const text =
		timer.mode === 'pomodoro' ? `Time to start cookin'!` : 'Take a break!';
	document.title = `${minutes}:${seconds} — ${text}`;

	const progress = document.getElementById('js-progress');

    if (timer.mode === undefined) {
        chrome.storage.sync.get(['mode']).then((result) => {
            timer.mode = result.mode;
            progress.max = timer[timer.mode] * 60; 
        });
    }

    if (timer.mode !== undefined) {
        progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
    }
}

function switchMode(mode) {
	chrome.alarms.clearAll();
	timer.mode = mode;
	timer.remainingTime = {
		total: timer[mode] * 60,
		minutes: timer[mode],
		seconds: 0
	};

	document
		.querySelectorAll('button[data-mode]')
		.forEach((e) => e.classList.remove('active'));
	document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
	document.body.style.backgroundColor = `var(--${mode})`;
	document
		.getElementById('js-progress')
		.setAttribute('max', timer.remainingTime.total);

	updateClock();
}

function handleMode(event) {
	const { mode } = event.target.dataset;
	if (!mode) return;
	switchMode(mode);
	stopTimer();
}

document.addEventListener('DOMContentLoaded', async () => {
	const { currentMin, currentSec } = await chrome.storage.sync.get([
	    'currentMin',
	    'currentSec'
	]);

	if (currentMin !== undefined && currentSec !== undefined) {
	    timer.remainingTime = {
	        total: (currentMin * 60) + currentSec,
	        minutes: currentMin,
	        seconds: currentSec
	    };
        updateClock();
        startTimer();
	}

	if ('Notification' in window) {
		if (
			Notification.permission !== 'granted' &&
			Notification.permission !== 'denied'
		) {
			Notification.requestPermission().then(function (permission) {
				if (permission === 'granted') {
					new Notification(
						'Awesome! You will be notified at the start of each session'
					);
				}
			});
		}
	}
	// switchMode('pomodoro');
});
