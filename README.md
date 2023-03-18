**Bee Foods Chatbot**
## **Brief Description**
The purpose of this chatbot is to allow customers to place orders for meals in Bee Foods (a restaurant) through a chat interface. The chatbot interface is designed using HTML and the chat functionality is implemented using Node.js, Express.js, and Socket.io.

The front-end of the chatbot is designed using HTML and consists of a chat area where messages are displayed, and an input field where customers can enter their messages. The messages are sent to the server using Socket.io.

On the server-side, the chatbot is implemented using Node.js, Express.js, and Socket.io. When a customer sends a message, the server receives the message and processes it. The server can emit responses to the customer based on the message received.

To enable user sessions based on devices, the chatbot uses the express-session middleware. This allows the chatbot to store user sessions on the server, and associate them with specific devices.

To validate inputs from customers, the chatbot uses regular expressions to match specific patterns in the messages received. If the message matches a specific pattern, the server can emit a response to the customer based on the message received.

Here is a summary of the code:
1. The front-end of the chatbot is designed using HTML and consists of a chat area and an input field.
2. The chat functionality is implemented using Socket.io. When a message is sent, it is received by the server using Socket.io.
3. The server uses the express-session middleware to enable user sessions based on devices.
4. To validate inputs from customers, the server uses regular expressions to match specific patterns in the messages received.
5. If the message matches a specific pattern, the server can emit a response to the customer based on the message received.

Overall, the chatbot allows customers to place orders for meals in a restaurant through a chat interface. The chatbot interface is designed using HTML, and the chat functionality is implemented using Node.js, Express.js, and Socket.io. The chatbot also uses the express-session middleware to enable user sessions based on devices, and regular expressions to validate inputs from customers.

**Table of Contents**

- [**Brief Description**](#brief-description)
- [**Installation**](#installation)
- [**Usage**](#usage)
- [**License**](#license)

## **Installation**
- Clone the repository or download the ZIP file and extract it.
- Open a terminal or command prompt and navigate to the root directory of the application.
- Run npm install to install all the required dependencies.
- Create a .env file in the root directory of the project and add the necessary environment variables such as PORT, SESSION_SECRET.
- Run the command **'node index.js'** to start the server.
- Once the server is running, open a web browser and navigate to http://localhost:PORT (replace PORT with the actual port number specified in the .env file) to access the chatbot.
- You can also customize the chatbot behavior and add new features by modifying the codebase.

These steps assume that you have Node.js installed on your system. If not, you will need to install them before proceeding (Visit the official Node.js website at https://nodejs.org/). Additionally, you may need to modify these instructions depending on your specific environment and requirements.

## **Usage**
The chatbot begins by welcoming the customer and asking for their name. With the use of the express-session, the chatbot is capable of welcoming a previous customer with his name if he visits the chatbot again within a 24-hour period. With the name, the chatbot asks the customer to select from the following options:

- Type 1 to Place an order
- Type 99 to checkout order
- Type 98 to see order history
- Type 97 to see current order
- Type 0 to cancel order

The chatbot checks if the customer's selection is 1 which correspond to "foodbaskets" and then presents the different options for the customer to select from. 

- 11 for Snacks
- 12 for Swallows
- 13 for African dishes
- 14 for drinks

If the customer selects an option, the chatbot checks what they selected and displays the menu for that option. The customer can then select the different items on the menu by entering the corresponding number. The chatbot then checks what item the customer selected and adds it to their order. If the item is invalid, the chatbot informs the customer and prompts them to enter a valid item.

If the customer's selection is 99, the chatbot checks if an order has been placed, checks it out, and adds the order to the order history. Otherwise it alerts the customer that no order has been placed.

If the customer's selection is 98, the chatbot returns the order history of the customer, if there is. Otherwise it alerts the customer that he has no order history.

If the customer's selection is 97, the chatbot returns the current order of the customer, this will only apply if he has checked out. Otherwise it alerts the customer that he should place an order.

If the customer's selection is 0, the chatbot cancels the current order of the customer, this will only apply if he has previously checked out an order. Otherwise it alerts the customer that he has no order to cancel.

Overall, this code allows customers to order food from a chatbot by presenting a menu of food baskets to choose from and then allowing them to select items from the menu.

Note that this chatbot is a basic implementation and can be improved by adding more conversational rules and integrating it with other services such as natural language processing (NLP) engines to improve its accuracy and effectiveness.

## **License**
MIT License