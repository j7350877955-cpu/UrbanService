const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DATABASE CONNECTION
const mongoURI = "mongodb+srv://Aryanpopalghat:Aryanpopalghat23@urbanservice.w3smd8n.mongodb.net/?appName=urbanservice"; 

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// SCHEMAS (Database Structure)
const workerSchema = new mongoose.Schema({
    name: String, service: String, phone: String, lat: Number, lng: Number, date: { type: Date, default: Date.now }
});
const Worker = mongoose.model('Worker', workerSchema);

const bookingSchema = new mongoose.Schema({
    name: String, service: String, address: String, phone: String, date: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// ROUTES
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 1. Get all workers for the live map
app.get('/api/workers', async (req, res) => {
    try { res.json(await Worker.find()); } catch (err) { res.status(500).send(err); }
});

// 2. Handle Job Applications
app.post('/api/apply', async (req, res) => {
    try {
        const newWorker = new Worker({
            name: req.body.workerName,
            service: req.body.workerService,
            phone: req.body.workerPhone,
            lat: parseFloat(req.body.workerLat) || 28.61,
            lng: parseFloat(req.body.workerLng) || 77.20
        });
        await newWorker.save();
        res.status(201).json({ message: "Application Saved & Live on Map!" });
    } catch (err) { res.status(500).json({ error: "Database Save Failed" }); }
});

// 3. Handle Service Appointments
app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Appointment Booked Successfully!" });
    } catch (err) { res.status(500).json({ error: "Booking Failed" }); }
});

// 4. Admin Data Retrieval
app.get('/api/admin/bookings', async (req, res) => res.json(await Booking.find().sort({date: -1})));
app.get('/api/admin/applications', async (req, res) => res.json(await Worker.find().sort({date: -1})));

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
