from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Chatbot response function
def chatbot_response(user_input):
    if "ticket" in user_input.lower():
        return "To book tickets, please use the 'Book Tickets' option on our website."
    elif "exhibitions" in user_input.lower():
        return "We have various exhibitions. Visit the Exhibitions section to learn more!"
    elif "hours" in user_input.lower():
        return "The museum is open daily from 9 AM to 6 PM."
    else:
        return "I'm here to help with any questions about our museum!"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_input = request.json['message']
    response = chatbot_response(user_input)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
