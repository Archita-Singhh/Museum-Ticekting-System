// Open and close chatbot modal
function openChat() {
    document.getElementById('chatbotModal').style.display = 'block';
}

function closeChat() {
    document.getElementById('chatbotModal').style.display = 'none';
}

// Send message to chatbot
async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += `<p class="user-message">${userInput}</p>`;
    document.getElementById('userInput').value = '';

    const response = await fetch('/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
    });
    const data = await response.json();
    chatbox.innerHTML += `<p class="bot-message">${data.response}</p>`;
}
