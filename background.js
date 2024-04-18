chrome.alarms.onAlarm.addListener(() => {
	chrome.runtime.sendMessage({ action: 'timerUp' });
	chrome.notifications.create({
		type: 'basic',
		iconUrl: './assets/icon.png',
		title: 'cookodoro',
		message: 'Time is up!',
		silent: false
	});
});