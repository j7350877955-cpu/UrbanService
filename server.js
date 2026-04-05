const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANT: Added /urbanservice before the '?' to ensure data goes to the right place
const mongoURI = "mongodb+srv://admin:Service123@cluster0.abcde.mongodb.net/urbanservice?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ DATABASE CONNECTED TO 'urbanservice'"))
    .catch(err => console.error("❌ DATABASE ERROR:", err.message));

// MODELS
const Worker = mongoose.model('Worker', new mongoose.Schema({
    name: String, service: String, phone: String, lat: Number, lng: Number,
    rating: { type: String, default: "⭐ 5.0" }
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
    name: String, service: String, phone: String, address: String, 
    date: { type: Date, default: Date.now }
}));

// API ROUTES
app.post('/api/bookings', async (req, res) => {
    try {
        const b = new Booking(req.body);
        await b.save();
        res.status(201).json({ message: "Booking Saved!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/apply', async (req, res) => {
    try {
        const w = new Worker(req.body);
        await w.save();
        res.status(201).json({ message: "Worker Saved!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/workers', async (req, res) => {
    try {
        const data = await Worker.find();
        res.json(data);
    } catch (e) { res.json([]); }
});

// ADMIN DATA ROUTE
app.get('/api/admin/data', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        const workers = await Worker.find();
        res.json({ bookings, workers });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server running`));
