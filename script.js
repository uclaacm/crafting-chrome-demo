// Gets the current alarm
function getAlarm() {
	return new Promise((resolve, reject) => {
		chrome.alarms.get(timer.current, (alarm) => {
			if (alarm) {
				resolve(alarm);
			} else {
				reject('Alarm not found!');
			}
		});
	});
}

// Function to calculate remaining time until the alarm goes off
function calculateRemainingTime(alarmInfo) {
	const currentTimestamp = Date.now();
	const alarmTimestamp = alarmInfo.scheduledTime;
	const delayInMilliseconds = alarmTimestamp - currentTimestamp;
	const remainingMinutes = Math.floor(delayInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes and round down
	const remainingSeconds = Math.floor(
		(delayInMilliseconds % (1000 * 60)) / 1000
	); // Convert remaining milliseconds to seconds and round down
	return { minutes: remainingMinutes, seconds: remainingSeconds };
}

// Function to log remaining time until the alarm goes off
async function logRemainingTime() {
	try {
		const alarm = await getAlarm();
		const { minutes, seconds } = calculateRemainingTime(alarm);
		console.log(
			'Remaining time until alarm goes off:',
			minutes,
			'minutes',
			seconds,
			'seconds'
		);
		return { minutes, seconds };
	} catch (error) {
		return null;
	}
}

async function updateHTMLClock() {
	let cur = await logRemainingTime();
	const minHTML = document.getElementById('js-minutes');
	const secHTML = document.getElementById('js-seconds');

	if (cur) {
		let { minutes, seconds } = cur;
		if (minutes !== null && seconds !== null) {
			minHTML.textContent = `${minutes}`.padStart(2, '0');
			secHTML.textContent = `${seconds}`.padStart(2, '0');
		}
	} else {
		minHTML.textContent = `${timer[timer.current]}`.padStart(2, '0');
		secHTML.textContent = '00';
	}
}

function switchMode(mode) {
	timer.current = mode;

	pomodoroButton.classList.remove('active');
	longBreakButton.classList.remove('active');
	shortBreakButton.classList.remove('active');

	if (mode === 'pomodoro') {
		pomodoroButton.classList.add('active');
	} else if (mode === 'longBreak') {
		longBreakButton.classList.add('active');
	} else if (mode === 'shortBreak') {
		shortBreakButton.classList.add('active');
	}
}

// Get the current mode from storage
async function getMode() {
	const mode = await chrome.storage.local.get('currentMode');
	if (mode) {
		timer.current = mode.currentMode;
	}
}

// Initializes non-clock elements if there is an active alarm
async function initializeAlarmValues() {
	try {
		// Get the current mode
		await getMode();
		const alarm = await getAlarm();

		// Alarm exists: set elements and mode
		if (alarm) {
			mainButton.classList.add('active');
			mainButton.textContent = 'Reset';
			mainButton.dataset.action = 'reset';

			currentMode = alarm.name;
			switchMode(currentMode);
		} else {
			// No alarm found
			switchMode('pomodoro');
		}
	} catch (error) {
		// No alarm found
		switchMode('pomodoro');
		return;
	}
}

// Connect elements to popup.html
const buttonSound = new Audio('./assets/button-sound.mp3');
const mainButton = document.getElementById('start-btn');
const pomodoroButton = document.getElementById('pomodoro-btn');
const longBreakButton = document.getElementById('long-break-btn');
const shortBreakButton = document.getElementById('short-break-btn');

// Initialize Values
let timer = {
	pomodoro: 25,
	shortBreak: 5,
	longBreak: 15,
	current: 'pomodoro'
};
// If there is an active alarm, set non-clock elements appropriately
// Ex: Start button should be 'Stop', and the current mode should be selected
initializeAlarmValues();

// Call updateHTMLClock every second
updateHTMLClock();
setInterval(updateHTMLClock, 1000);

// Start / Stop button
mainButton.addEventListener('click', async () => {
	const { action } = mainButton.dataset;
	buttonSound.play();

	if (action === 'reset') {
		chrome.alarms.clear(timer.current);
		mainButton.classList.remove('active');
		mainButton.textContent = 'Start';
		mainButton.dataset.action = 'start';
	} else {
		chrome.alarms.create(timer.current, {
			delayInMinutes: timer[timer.current]
		});

		mainButton.classList.add('active');
<<<<<<< HEAD
		mainButton.textContent = 'Stop';
		mainButton.dataset.action = 'stop';

		// Save the current mode to storage. This is used to figure out
		// which mode to set as active when the extension is reopened.
=======
		mainButton.textContent = 'Reset';
		mainButton.dataset.action = 'reset';
>>>>>>> 064c8bb33fa303e3af2913e3b5e9c0975997c309
		chrome.storage.local.set({ currentMode: timer.current }).then(() => {
			console.log('Mode set to ' + timer.current);
		});
	}
});

pomodoroButton.addEventListener('click', () => {
	buttonSound.play();
	switchMode('pomodoro');
});

longBreakButton.addEventListener('click', () => {
	buttonSound.play();
	switchMode('longBreak');
});

shortBreakButton.addEventListener('click', () => {
	buttonSound.play();
	switchMode('shortBreak');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'timerUp') {
		const breakSound = new Audio('./assets/break.mp3');
		breakSound.play();
		switchMode('pomodoro');
	}
});
