const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Local or Atlas)
mongoose.connect('mongodb://localhost:27017/urbanServiceDB')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- Schemas ---
const BookingSchema = new mongoose.Schema({
    name: String, phone: String, service: String, address: String, status: { type: String, default: 'Moving' }
});

const ApplicationSchema = new mongoose.Schema({
    name: String, phone: String, expertise: String, experience: Number
});

const Booking = mongoose.model('Booking', BookingSchema);
const Application = mongoose.model('Application', ApplicationSchema);

// --- Routes ---
app.post('/api/book', async (req, res) => {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.json({ success: true, message: "Booking Received", id: newBooking._id });
});

app.post('/api/apply', async (req, res) => {
    const newApp = new Application(req.body);
    await newApp.save();
    res.json({ success: true, message: "Application Submitted" });
});

// Mock endpoint for worker location
app.get('/api/worker-location', (req, res) => {
    // In a real app, this would pull from a 'Worker' collection updated by a GPS app
    res.json({
        lat: 28.6139 + (Math.random() * 0.01), 
        lng: 77.2090 + (Math.random() * 0.01)
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));

// --- Admin Routes ---

// Fetch all bookings for the Admin Panel
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ _id: -1 }); // Newest first
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Fetch all job applications for the Admin Panel
app.get('/api/admin/applications', async (req, res) => {
    try {
        const apps = await Application.find().sort({ _id: -1 });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});
