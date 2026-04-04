const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// REPLACE THIS with your exact URI from MongoDB Atlas "Connect" menu
const mongoURI = "mongodb+srv://admin:Urban123@cluster0.xxxxx.mongodb.net/urbanservice?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Connection Error:", err.message));

// SCHEMAS
const Worker = mongoose.model('Worker', new mongoose.Schema({
    name: String, service: String, phone: String, lat: Number, lng: Number
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
    name: String, service: String, phone: String, address: String, date: { type: Date, default: Date.now }
}));

// API ROUTES
app.post('/api/apply', async (req, res) => {
    try {
        const newWorker = new Worker({
            name: req.body.workerName,
            service: req.body.workerService,
            phone: req.body.workerPhone,
            lat: parseFloat(req.body.workerLat),
            lng: parseFloat(req.body.workerLng)
        });
        await newWorker.save();
        res.status(201).json({ message: "Application Successful!" });
    } catch (e) { res.status(500).json({ error: "DB Error: " + e.message }); }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ message: "Service Booked Successfully!" });
    } catch (e) { res.status(500).json({ error: "Booking Error: " + e.message }); }
});

app.get('/api/workers', async (req, res) => {
    try { res.json(await Worker.find()); } catch (e) { res.json([]); }
});

app.get('/api/admin/data', async (req, res) => {
    const bookings = await Booking.find().sort({ date: -1 });
    const apps = await Worker.find();
    res.json({ bookings, apps });
});

app.listen(PORT, () => console.log(`🚀 Live on port ${PORT}`));
