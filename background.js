// chrome.runtime.onInstalled.addListener(() => {
// 	chrome.action.setBadgeText({
// 		text: 'OFF'
// 	});
// });

// chrome.action.onClicked.addListener(async () => {
// 	chrome.action.setBadgeText({ text: 'ON' });
// });

chrome.alarms.onAlarm.addListener(() => {
	chrome.action.setBadgeText({ text: '' });
	chrome.notifications.create({
		type: 'basic',
		iconUrl: './assets/icon.png',
		title: 'Pomodoro Timer',
		message: 'Time is up!',
		// buttons: [{ title: 'Start a new session' }],
		silent: false
	});
});

// chrome.notifications.onButtonClicked.addListener(async () => {
// 	const item = await chrome.storage.sync.get(['lastTimer']);
// 	chrome.action.setBadgeText({ text: 'ON' });
// 	chrome.alarms.create({ lastTimer: item.lastTimer });
// });
