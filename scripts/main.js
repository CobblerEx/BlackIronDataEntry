// === 12-HOUR TIME WITH AM/PM ===
const timeOptions = [];
for (let h = 0; h < 24; h++) {
	for (let m of [0, 30]) {
		const mil = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
		const hr12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
		const period = h < 12 ? 'AM' : 'PM';
		const display = `${hr12}:${m.toString().padStart(2,'0')} ${period}`;
		timeOptions.push({mil, display});
	}
}

function to12hr(time24) {
	const opt = timeOptions.find(o => o.mil === time24);
	return opt ? opt.display : time24;
}
function timeToDecimal(t) {
	const [h, m] = t.split(':').map(Number);
	return h + m/60;
}
function decimalToHM(dec) {
	const totalMins = Math.round(dec * 60);
	return {h: Math.floor(totalMins / 60), m: totalMins % 60};
}
function formatHours(dec) {
	const {h, m} = decimalToHM(dec);
	return `${h}:${m.toString().padStart(2,'0')}`;
}
function getNextTime(current24) {
	const idx = timeOptions.findIndex(o => o.mil === current24);
	return timeOptions[(idx + 1) % timeOptions.length].mil;
}
function formatDate(d) {
	if (!d) return '';
	const [y, m, day] = d.split('-');
	return `${m}/${day}/${y}`;
}

// === DATA & STORAGE ===
let entries = [];
let currentTimesheetId = null; // Track if editing a saved timesheet
let addressHistory = JSON.parse(localStorage.getItem('addressHistory') || '[]');
let taskHistory = JSON.parse(localStorage.getItem('taskHistory') || '[]');
let savedTimesheets = JSON.parse(localStorage.getItem('savedTimesheets') || '[]');

function clearForm() {
	document.getElementById('jobType').value = 'Custom';
	document.getElementById('jobName').value = '';
	document.getElementById('address').value = '';
	document.getElementById('description').value = '';
	document.getElementById('editIndex').value = -1;
	document.getElementById('actionButton').textContent = 'Add Entry';
	document.getElementById('cancelButton').style.display = 'none';
	if (entries.length) {
		const last = entries[entries.length-1];
		document.getElementById('timeIn').value = last.timeOut;
		document.getElementById('timeOut').value = getNextTime(last.timeOut);
	}
}
function loadData() {
	const saved = localStorage.getItem('timesheetData');
	if (saved) {
		const d = JSON.parse(saved);
		document.getElementById('employee').value = d.employee || 'Lucas';
		document.getElementById('sessionDate').value = d.date || new Date().toISOString().split('T')[0];
		entries = d.entries || [];
	}
	// renderTable();
}

window.addEventListener('DOMContentLoaded', function() {
	loadData();
	clearForm();

	// === FORM ===
	const jobTypeSelect = document.getElementById('jobType');
	jobTypeSelect.addEventListener('change', function() {
		const descTextarea = document.getElementById('description');
		if (this.value !== 'Custom') {
			document.getElementById('jobName').value = this.value;
			// Template logic will be added later
		} else {
			descTextarea.value = '';
		}
	});

	document.getElementById('actionButton').onclick = () => {
		const idx = +document.getElementById('editIndex').value;
		const date = document.getElementById('sessionDate').value;
		let job = document.getElementById('jobName').value.trim();
		const addr = document.getElementById('address').value.trim();
		const tIn = document.getElementById('timeIn').value;
		const tOut = document.getElementById('timeOut').value;
		const desc = document.getElementById('description').value.trim();

		if (!date) return alert('Select a date');
		if (!job) return alert('Enter job name');
		if (timeToDecimal(tOut) === timeToDecimal(tIn)) return alert('Time In and Time Out cannot be the same');

		const entry = {dateStr: date, jobName: job, address: addr, timeIn: tIn, timeOut: tOut, description: desc};

		if (idx === -1) entries.push(entry);
		else entries[idx] = entry;

		if (addr && !addressHistory.includes(addr)) {
			addressHistory.unshift(addr);
			if (addressHistory.length > 50) addressHistory.pop();
		}

		// renderTable();
		clearForm();
	};

	document.getElementById('cancelButton').onclick = clearForm;

	document.getElementById('copyLast').onclick = () => {
		if (!entries.length) return alert('No previous job');
		const l = entries[entries.length-1];
		document.getElementById('jobType').value = 'Custom';
		document.getElementById('jobName').value = l.jobName;
		document.getElementById('address').value = l.address || '';
		document.getElementById('description').value = l.description || '';
		document.getElementById('timeIn').value = l.timeOut;
		document.getElementById('timeOut').value = getNextTime(l.timeOut);
	};

	document.getElementById('clearAllButton').onclick = () => {
		if (confirm('Clear ALL entries?')) { 
			entries = []; 
			currentTimesheetId = null;
			// renderTable(); 
			clearForm(); 
		}
	};

	document.addEventListener('keydown', e => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter')
			document.getElementById('actionButton').click();
	});
});