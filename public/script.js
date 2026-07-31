const eventList = document.getElementById("event-list");
const eventSelect = document.getElementById("event-select");
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");
const bookingHistory = document.getElementById("booking-history");

async function loadEvents() {
    try {
        const response = await fetch("/api/events");
        const events = await response.json();

        eventList.innerHTML = "";
        eventSelect.innerHTML =
            '<option value="">Select an event</option>';

        events.forEach(event => {
            const card = document.createElement("div");
            card.className = "event-card";

            card.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Price:</strong> ₹${event.price}</p>
            `;

            eventList.appendChild(card);

            const option = document.createElement("option");
            option.value = event.id;
            option.textContent =
                `${event.name} - ₹${event.price}`;

            eventSelect.appendChild(option);
        });
    } catch (error) {
        eventList.innerHTML = "<p>Could not load events.</p>";
    }
}

async function loadBookings() {
    try {
        const response = await fetch("/api/bookings");
        const bookings = await response.json();

        bookingHistory.innerHTML = "";

        if (bookings.length === 0) {
            bookingHistory.innerHTML =
                "<p>No bookings have been made.</p>";
            return;
        }

        bookings.forEach(booking => {
            const card = document.createElement("div");
            card.className = "booking-card";

            card.innerHTML = `
                <p><strong>Name:</strong> ${booking.userName}</p>
                <p><strong>Event:</strong> ${booking.eventName}</p>
                <p><strong>Tickets:</strong> ${booking.tickets}</p>
                <p>
                    <strong>Total:</strong>
                    ₹${booking.totalAmount}
                </p>
            `;

            bookingHistory.appendChild(card);
        });
    } catch (error) {
        bookingHistory.innerHTML =
            "<p>Could not load booking history.</p>";
    }
}

bookingForm.addEventListener("submit", async event => {
    event.preventDefault();

    const bookingData = {
        userName: document.getElementById("user-name").value,
        eventId: Number(eventSelect.value),
        tickets: Number(
            document.getElementById("tickets").value
        )
    };

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        bookingMessage.textContent =
            `Booking successful! Total amount: ₹${result.totalAmount}`;

        bookingForm.reset();
        loadBookings();
    } catch (error) {
        bookingMessage.textContent = error.message;
    }
});

loadEvents();
loadBookings();