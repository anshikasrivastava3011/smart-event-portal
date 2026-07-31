const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let events = [
    {
        id: 1,
        name: "Tech Conference 2026",
        date: "2026-08-20",
        location: "Delhi",
        price: 500
    },
    {
        id: 2,
        name: "Music Festival",
        date: "2026-09-10",
        location: "Mumbai",
        price: 800
    },
    {
        id: 3,
        name: "Startup Meetup",
        date: "2026-10-05",
        location: "Bengaluru",
        price: 300
    }
];

let bookings = [];

// Health-check route for Docker, Kubernetes and Jenkins
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        message: "Smart Event Portal is running"
    });
});

// Get all events
app.get("/api/events", (req, res) => {
    res.json(events);
});

// Add a new event
app.post("/api/events", (req, res) => {
    const { name, date, location, price } = req.body;

    if (!name || !date || !location || price === undefined) {
        return res.status(400).json({
            message: "All event details are required"
        });
    }

    const newEvent = {
        id: Date.now(),
        name,
        date,
        location,
        price: Number(price)
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
});

// Update an event
app.put("/api/events/:id", (req, res) => {
    const eventId = Number(req.params.id);
    const event = events.find(item => item.id === eventId);

    if (!event) {
        return res.status(404).json({
            message: "Event not found"
        });
    }

    event.name = req.body.name || event.name;
    event.date = req.body.date || event.date;
    event.location = req.body.location || event.location;

    if (req.body.price !== undefined) {
        event.price = Number(req.body.price);
    }

    res.json(event);
});

// Delete an event
app.delete("/api/events/:id", (req, res) => {
    const eventId = Number(req.params.id);
    const originalLength = events.length;

    events = events.filter(item => item.id !== eventId);

    if (events.length === originalLength) {
        return res.status(404).json({
            message: "Event not found"
        });
    }

    res.json({
        message: "Event deleted successfully"
    });
});

// Book an event
app.post("/api/bookings", (req, res) => {
    const { userName, eventId, tickets } = req.body;

    const selectedEvent = events.find(
        event => event.id === Number(eventId)
    );

    if (!userName || !selectedEvent || Number(tickets) < 1) {
        return res.status(400).json({
            message: "Valid booking details are required"
        });
    }

    const booking = {
        id: Date.now(),
        userName,
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        tickets: Number(tickets),
        totalAmount: selectedEvent.price * Number(tickets)
    };

    bookings.push(booking);
    res.status(201).json(booking);
});

// View booking history
app.get("/api/bookings", (req, res) => {
    res.json(bookings);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
});