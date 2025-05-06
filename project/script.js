const ticketsInput = document.getElementById('tickets');
const ticketDetails = document.getElementById('ticketDetails');
const totalPriceSpan = document.getElementById('totalPrice');
const bookButton = document.getElementById('bookButton');
const remainingCount = document.getElementById('remainingCount');
const resultDiv = document.getElementById('result');
const eventSelect = document.getElementById('event');

let totalPrice = 0;

// Socket.io setup
const socket = io("http://localhost:5000");

// Fetch initial remaining tickets
const fetchRemainingTickets = async () => {
    const event = eventSelect.value;
    try {
        const response = await fetch(`http://localhost:5000/remaining_tickets?event=${event}`);
        const data = await response.json();

        if (data.success) {
            remainingCount.textContent = data.remaining;
        } else {
            remainingCount.textContent = "Error";
        }
    } catch (error) {
        console.error("Error fetching remaining tickets:", error);
        remainingCount.textContent = "Error";
    }
};

// Update remaining tickets in real-time
socket.on('update_remaining_tickets', (data) => {
    if (data.event === eventSelect.value) {
        remainingCount.textContent = data.remaining;
    }
});

// Calculate ticket price based on age
const calculatePrice = (age) => {
    if (age <= 16) return 0;
    if (age <= 24) return 15;
    if (age <= 40) return 20;
    return 10;
};

// Update ticket details dynamically
ticketsInput.addEventListener('change', () => {
    const ticketCount = parseInt(ticketsInput.value, 10);

    ticketDetails.innerHTML = '';
    totalPrice = 0;

    for (let i = 0; i < ticketCount; i++) {
        const div = document.createElement('div');

        div.innerHTML = `
            <label>Name for Ticket ${i + 1}: <input type="text" name="name${i}" required></label>
            <label>Age for Ticket ${i + 1}: <input type="number" name="age${i}" min="1" required></label>
        `;

        const ageInput = div.querySelector(`input[name="age${i}"]`);
        ageInput.addEventListener('input', () => updatePrice());

        ticketDetails.appendChild(div);
    }

    updatePrice();
});

// Update total price
const updatePrice = () => {
    totalPrice = 0;
    const ageInputs = ticketDetails.querySelectorAll('input[name^="age"]');

    ageInputs.forEach((input) => {
        const age = parseInt(input.value, 10);
        if (!isNaN(age)) totalPrice += calculatePrice(age);
    });

    totalPriceSpan.textContent = totalPrice;
};

// Book tickets
bookButton.addEventListener('click', async () => {
    const tickets = [];
    const ticketCount = parseInt(ticketsInput.value, 10);

    for (let i = 0; i < ticketCount; i++) {
        tickets.push({
            name: document.querySelector(`input[name="name${i}"]`).value,
            age: parseInt(document.querySelector(`input[name="age${i}"]`).value, 10),
        });
    }

    const event = eventSelect.value;

    try {
        const response = await fetch('http://localhost:5000/book_ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, tickets }),
        });

        const result = await response.json();
        if (result.success) {
            resultDiv.textContent = "Booking Successful!";
            fetchRemainingTickets(); // Refresh remaining tickets
        } else {
            resultDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        console.error("Error booking tickets:", error);
    }
});

// Fetch remaining tickets on page load
window.onload = fetchRemainingTickets;
