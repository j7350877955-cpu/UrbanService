let map;
function initMap() {
    map = L.map('map').setView([28.61, 77.20], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    loadWorkers();
}

async function loadWorkers() {
    try {
        const res = await fetch('/api/workers');
        const data = await res.json();
        data.forEach(w => {
            if(w.lat && w.lng) L.marker([w.lat, w.lng]).addTo(map).bindPopup(`<b>${w.name}</b><br>${w.service}`);
        });
    } catch (e) { console.log("Map error:", e); }
}

function setService(s) {
    document.getElementById('service-input').value = s;
}

async function bookService() {
    const data = {
        name: document.getElementById('c-name').value,
        service: document.getElementById('service-input').value,
        phone: document.getElementById('c-phone').value,
        address: document.getElementById('c-addr').value
    };
    const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || result.error);
}

document.getElementById('applyForm').addEventListener('submit', async (e) => {
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
    alert(result.message || result.error);
    location.reload();
});

window.onload = initMap;
