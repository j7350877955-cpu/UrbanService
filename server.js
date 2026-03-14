const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
// REPLACE THE STRING BELOW WITH YOUR ACTUAL MONGODB URI
const mongoURI = "mongodb+srv://Aryanpopalghat:Aryanpopalghat23@urbanservice.w3smd8n.mongodb.net/?appName=urbanservice";

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err.message));

// --- SCHEMAS ---
const Worker = mongoose.model('Worker', new mongoose.Schema({
    name: String, service: String, phone: String, lat: Number, lng: Number
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
    name: String, service: String, phone: String, address: String, date: { type: Date, default: Date.now }
}));

// --- API ROUTES ---
app.get('/api/workers', async (req, res) => {
    try { res.json(await Worker.find()); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Booking Confirmed! View in Admin Panel." });
    } catch (e) { res.status(500).json({ error: "Booking Failed: " + e.message }); }
});

app.post('/api/apply', async (req, res) => {
    try {
        const { workerName, workerService, workerPhone, workerLat, workerLng } = req.body;
        const newWorker = new Worker({
            name: workerName, service: workerService, phone: workerPhone,
            lat: parseFloat(workerLat), lng: parseFloat(workerLng)
        });
        await newWorker.save();
        res.status(201).json({ message: "Application Successful! You are on the map." });
    } catch (e) { res.status(500).json({ error: "Application Failed: " + e.message }); }
});

// Admin Data
app.get('/api/admin/data', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        const apps = await Worker.find();
        res.json({ bookings, apps });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
