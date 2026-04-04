let map;
let allWorkers = []; // Store all workers to filter later

// --- 1. Service Data for the Extra Slides ---
const serviceDetails = {
    'Home Cleaning': {
        price: '$49 - $99', desc: 'Deep cleaning, dusting, and sanitization of your home by verified professionals.',
        img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'
    },
    'Home Salon': {
        price: '$35 - $120', desc: 'Premium haircuts, spa, and facial treatments right in the comfort of your living room.',
        img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
    },
    'Cooking': {
        price: '$60 per meal', desc: 'Hire an expert chef to cook delicious, healthy meals in your own kitchen.',
        img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
    },
    'AC Repair': {
        price: '$75 inspection', desc: 'Fast and reliable AC servicing, gas refilling, and cooling repair.',
        img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800'
    }
};

// --- 2. Map & Worker Initialization ---
function initMap() {
    map = L.map('map').setView([28.61, 77.20], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    loadWorkers();
}

async function loadWorkers() {
    try {
        const res = await fetch('/api/workers');
        allWorkers = await res.json(); // Save to global array
        
        allWorkers.forEach(w => {
            if(w.lat && w.lng) {
                L.marker([w.lat, w.lng]).addTo(map).bindPopup(`<b>${w.name}</b><br>${w.service}`);
            }
        });
    } catch(e) { console.log("Error loading workers", e); }
}

// --- 3. Modal (Extra Slides) Logic ---
function openService(serviceName) {
    const data = serviceDetails[serviceName];
    
    // Fill the modal with data
    document.getElementById('m-title').innerText = serviceName;
    document.getElementById('m-price').innerText = "Pricing: " + data.price;
    document.getElementById('m-desc').innerText = data.desc;
    document.getElementById('m-img').src = data.img;

    // Filter available workers for THIS service
    const availablePros = allWorkers.filter(w => w.service === serviceName);
    const workersContainer = document.getElementById('m-workers');
    
    if (availablePros.length === 0) {
        workersContainer.innerHTML = `<p style="color:#64748b; font-style:italic;">No pros currently online for this area. You can still book!</p>`;
    } else {
        workersContainer.innerHTML = availablePros.map(w => `
            <div class="worker-item">
                <div><b>${w.name}</b> <br> <span style="font-size:12px; color:#64748b;">⭐ 4.8 | Verified Pro</span></div>
                <div><span class="status-dot"></span> Online</div>
            </div>
        `).join('');
    }

    // Show the modal
    document.getElementById('serviceModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

function continueToBook() {
    // Grab the title from the modal and put it in the booking form
    const serviceName = document.getElementById('m-title').innerText;
    document.getElementById('service-choice').value = serviceName;
    
    closeModal();
    
    // Scroll down to the booking form
    document.getElementById('book-section').scrollIntoView({ behavior: 'smooth' });
}

// Close modal if user clicks outside the white box
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) closeModal();
}

// --- 4. Booking & Application API Calls ---
async function sendBooking() {
    const data = {
        name: document.getElementById('c-name').value,
        service: document.getElementById('service-choice').value,
        phone: document.getElementById('c-phone').value,
        address: document.getElementById('c-addr').value
    };
    if(!data.name || !data.service) return alert("Please fill name and pick a service.");

    const res = await fetch('/api/bookings', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || result.error);
    if(res.ok) { document.getElementById('c-name').value = ''; document.getElementById('c-addr').value = ''; }
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
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || result.error);
    if(res.ok) location.reload();
});

window.onload = initMap;

let map;
let markers = {};
let customerLatLng = null;

function initMap() {
    map = L.map('map').setView([28.61, 77.20], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Get Customer Location to calculate ETA
    navigator.geolocation.getCurrentPosition(pos => {
        customerLatLng = [pos.coords.latitude, pos.coords.longitude];
        L.marker(customerLatLng, {icon: L.divIcon({className: 'customer-icon', html: '📍'})}).addTo(map).bindPopup("You are here");
    });

    setInterval(refreshLiveMap, 5000); // Sync every 5 seconds
}

async function refreshLiveMap() {
    const res = await fetch('/api/workers');
    const workers = await res.json();

    workers.forEach(w => {
        const workerPos = [w.lat, w.lng];

        if (markers[w.phone]) {
            markers[w.phone].setLatLng(workerPos);
        } else {
            markers[w.phone] = L.marker(workerPos).addTo(map)
                .bindPopup(`<b>${w.name}</b><br>${w.rating}`);
        }

        // Calculate ETA if customer location is known
        if (customerLatLng) {
            const dist = map.distance(customerLatLng, workerPos); // Distance in meters
            updateETADisplay(w.name, dist);
        }
    });
}

function updateETADisplay(name, distanceMeters) {
    const km = distanceMeters / 1000;
    const minutes = Math.round((km / 25) * 60) + 2; // Speed 25km/h + 2 min buffer

    const box = document.getElementById('eta-box');
    box.style.display = 'block';
    document.getElementById('tracking-worker-name').innerText = name + " is on the way";
    document.getElementById('eta-text').innerText = `ETA: ${minutes} mins (${km.toFixed(1)} km away)`;
}

// --- WORKER SIDE: PING LOCATION ---
function startWorkerLive(phone) {
    if (!phone) return alert("Enter phone");
    
    navigator.geolocation.watchPosition(pos => {
        fetch('/api/worker/update-location', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                phone: phone,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            })
        });
    }, err => console.error(err), { enableHighAccuracy: true });
    
    alert("Live Tracking Started! Keep this tab open.");
}

window.onload = initMap;
