const ticketsInput = document.getElementById('tickets');
const ticketDetails = document.getElementById('ticketDetails');
const totalPriceSpan = document.getElementById('totalPrice');
const bookButton = document.getElementById('bookButton');
const remainingCount = document.getElementById('remainingCount');
const resultDiv = document.getElementById('result');
const eventSelect = document.getElementById('event');
const paymentButtonContainer = document.getElementById('paymentButtonContainer');
const paymentButton = document.getElementById('paymentButton');

// Socket.io setup
const socket = io("http://localhost:5000");

let totalPrice = 0;

// Fetch initial remaining tickets
const fetchRemainingTickets = async () => {
    const event = eventSelect.value;
    remainingCount.textContent = "Loading...";
    try {
        const response = await fetch(`http://localhost:5000/remaining_tickets?event=${event}`);
        const data = await response.json();

        if (data.success) {
            remainingCount.textContent = data.remaining;
        } else {
            remainingCount.textContent = "Not Available";
        }
    } catch (error) {
        console.error("Error fetching remaining tickets:", error);
        remainingCount.textContent = "Error";
    }
};

// Update remaining tickets in real-time
socket.on('update_remaining_tickets', (data) => {
    if (data && data.event === eventSelect.value) {
        remainingCount.textContent = data.remaining;
    } else {
        console.warn("Real-time update received for a different event or invalid data:", data);
    }
});

// Handle event change
eventSelect.addEventListener('change', fetchRemainingTickets);

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

// Book tickets and send to backend
bookButton.addEventListener('click', async () => {
    bookButton.disabled = true; // Disable button during processing
    resultDiv.textContent = "Processing...";

    const tickets = [];
    const ticketCount = parseInt(ticketsInput.value, 10);

    for (let i = 0; i < ticketCount; i++) {
        const nameInput = document.querySelector(`input[name="name${i}"]`);
        const ageInput = document.querySelector(`input[name="age${i}"]`);

        if (!nameInput.value || !ageInput.value || isNaN(parseInt(ageInput.value, 10))) {
            resultDiv.textContent = "Please fill in all ticket details correctly.";
            bookButton.disabled = false;
            return; // Exit if any input is invalid
        }

        tickets.push({
            name: nameInput.value,
            age: parseInt(ageInput.value, 10),
        });
    }

    const event = eventSelect.value;
    const email = document.getElementById('email').value;  // Add your email input field here
    const phone = document.getElementById('phone').value;  // Add your phone input field here

    if (!email || !phone) {
        resultDiv.textContent = "Please provide both email and phone number.";
        bookButton.disabled = false;
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/book_ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event,
                tickets,
                name: tickets.map(ticket => ticket.name).join(', '),  // You can combine the names if needed
                email,
                phone,
            }),
        });

        const result = await response.json();
        if (result.success) {
            resultDiv.textContent = "Booking Successful!";
            fetchRemainingTickets(); // Refresh remaining tickets
            // Show "Proceed to Payment" button after booking
            paymentButtonContainer.style.display = 'block';
        } else {
            resultDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        console.error("Error booking tickets:", error);
        resultDiv.textContent = "An error occurred. Please try again.";
    } finally {
        bookButton.disabled = false; // Re-enable button after processing
    }
});

// Fetch remaining tickets on page load
window.onload = fetchRemainingTickets;
