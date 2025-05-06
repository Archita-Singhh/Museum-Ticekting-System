const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();  // This initializes the Express app
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Simulating a database of bookings and events with timings
let events = {
    exhibition1: { remaining: 100, timing: "10:00 AM - 5:00 PM" },
    exhibition2: { remaining: 200, timing: "10:00 AM - 5:00 PM" },
    event1: { remaining: 50, timing: "6:00 PM - 9:00 PM" },
    event2: { remaining: 75, timing: "7:00 PM - 10:00 PM" },
};

// MongoDB URI (local setup)
const uri = 'mongodb://localhost:27017';
// MongoDB Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
let db, collection;
async function connectDB() {
    try {
        await client.connect();
        db = client.db('museum_ticketing_system');
        collection = db.collection('tickets');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

// Call the connect function when the server starts
connectDB();

// In-memory storage for bookings
let bookings = [];

// Endpoint to get ticket availability
app.get('/availability/:eventId', (req, res) => {
    const eventId = req.params.eventId;
    if (events[eventId]) {
        res.json({ remaining: events[eventId].remaining, timing: events[eventId].timing });
    } else {
        res.json({ error: 'Event not found' });
    }
});

// Endpoint to handle ticket booking and reduce count
app.post('/book/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const {
        count,
        fullName,
        email,
        mobileNumber,
        age,
        nationality,
        visitDate,
    } = req.body;

    // Check if the event is 'none' and if tickets are available
    if (eventId === 'none') {
        // Handle the case when 'No Event/Exhibition' is selected
        // Assume that there are unlimited tickets for the "none" event (adjust as needed)
        res.json({
            success: true,
            bookingId: `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            remaining: 1000,  // assuming 1000 tickets available for 'none'
            eventTiming: 'N/A', // No specific event timing for 'none'
        });
    } else if (events[eventId] && events[eventId].remaining >= count) {
        // Handle regular event booking
        const bookingId = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Store the booking details
        const booking = {
            bookingId,
            eventId,
            fullName,
            email,
            mobileNumber,
            age,
            nationality,
            visitDate,
            count,
            eventTiming: events[eventId].timing, // Event timing based on the event
            timestamp: new Date(),
        };

        bookings.push(booking);

        // Reduce the ticket count
        events[eventId].remaining -= count;

        // Store the booking in MongoDB
        try {
            const result = await collection.insertOne({
                bookingId,
                eventId,
                fullName,
                email,
                mobileNumber,
                age,
                nationality,
                visitDate,
                eventTiming: events[eventId].timing,
                count,
                bookedAt: new Date(),
            });
            console.log(`Ticket booked with ID: ${bookingId}`);
        } catch (error) {
            console.error('Error inserting booking into MongoDB:', error);
        }

        // Send success response with booking details
        res.json({
            success: true,
            bookingId,
            remaining: events[eventId].remaining,
            eventTiming: events[eventId].timing,
        });
    } else {
        // If not enough tickets available, respond with failure
        res.json({ success: false, error: 'Not enough tickets available' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
