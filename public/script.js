let map;
function initMap() {
    map = L.map('map').setView([28.61, 77.20], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    loadMarkers();
}

async function loadMarkers() {
    const res = await fetch('/api/workers');
    const data = await res.json();
    data.forEach(w => {
        L.marker([w.lat, w.lng]).addTo(map).bindPopup(`<b>${w.name}</b><br>${w.service}`);
    });
}

function selectService(s) {
    document.getElementById('selected-service').value = s;
}

async function submitBooking() {
    const data = {
        name: document.getElementById('cust-name').value,
        service: document.getElementById('selected-service').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value
    };
    const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
}

document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        workerName: document.getElementById('w-name').value,
        workerService: document.getElementById('w-service').value,
        workerPhone: document.getElementById('w-phone').value,
        workerLat: document.getElementById('w-lat').value,
        workerLng: document.getElementById('w-lng').value
    };
    const res = await fetch('/api/apply', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
    location.reload();
});

window.onload = initMap;
