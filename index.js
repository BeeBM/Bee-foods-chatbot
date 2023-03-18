const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();
const port = process.env.PORT || 3000;
const path = require("path");

const joinPath = path.join(__dirname, "chatbot.html");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//handle sessions
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(joinPath);
});

//socket.io middleware used to store and retrieve sessions
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
    const sessionData = socket.request.session;
    const sessionId = socket.request.sessionID;
    socket.join(sessionId);
    
    socket.use((__, next) => {
        sessionData.reload((err) => {
          if (err) {
            socket.disconnect();
          } else {
            next();
          }
        });
      });

  const choiceMaker =
    "Select a category of food you would like to have:<br>11 for snacks <br>12 for swallows<br>13 for African dishes<br>14 for drinks";

    if (!sessionData.name) {
        socket.emit("chatbot_message", "Welcome to Bee Foods. What is your name?");
    } else {
        socket.emit("chatbot_message", `Welcome back to Bee Foods, ${sessionData.name}.<br>Type "ok" to start`);
    }

  socket.on("user_input", (message) => {
    if (!sessionData.name) {
      io.to(sessionId).emit("user_message", message);
      sessionData.name = message;
      sessionData.orderHistory = [];
      sessionData.order = [];

      io.to(sessionId).emit(
        "chatbot_message",
        `Hi, ${sessionData.name}! What would you like to do?`
      );
      io.to(sessionId).emit(
        "chatbot_message",
        "Type 1 to place your order<br>Type 99 to checkout your order<br>Type 98 to see your order history<br>Type 97 to see your current order<br>Type 0 to cancel your order"
      );

    } else {
      io.to(sessionId).emit("user_message", message);

      if (message === "ok") {
        io.to(sessionId).emit(
          "chatbot_message",
          "Type 1 to place your order<br>Type 99 to checkout your order<br>Type 98 to see your order history<br>Type 97 to see your current order<br>Type 0 to cancel your order"
        );
      }

      if (isNaN(message || message !== "ok")) {
        io.to(sessionId).emit(
          "chatbot_message",
          "Invalid input. Please select an appropriate option"
        );
        return;
      }

      let order = sessionData.order.reduce(
        (acc, curr) => `${acc}<br>${curr}`,
        ""
      );

      switch (message) {
        case "1":
          sessionData.selection = "foodbaskets";
          console.log(sessionData);
          io.to(sessionId).emit("chatbot_message", choiceMaker);
          break;

        case "99":
          if (sessionData.order.length === 0) {
            io.to(sessionId).emit("chatbot_message", "No order to place yet!");
            io.to(sessionId).emit(
              "chatbot_message",
              "Press 1 to place an order"
            );
          } else {
            sessionData.orderHistory.push(order);
            io.to(sessionId).emit("chatbot_message", "Order placed!");
          }
          break;

        case "98":
          if (sessionData.orderHistory.length === 0) {
            io.to(sessionId).emit(
              "chatbot_message",
              "You don't have any record yet!"
            );
            io.to(sessionId).emit(
              "chatbot_message",
              "Press 1 to place an order"
            );
          } else {
            const orderHistory = sessionData.orderHistory.reduce(
              (acc, curr) => `${acc}<br><hr>${curr}`,
              ""
            );
            io.to(sessionId).emit("chatbot_message", orderHistory);
          }
          break;

        case "97":
          if (order.length === 0) {
            io.to(sessionId).emit(
              "chatbot_message",
              "No order has been placed yet!"
            );
            io.to(sessionId).emit(
              "chatbot_message",
              "Press 1 to place an order"
            );
          } else {
            io.to(sessionId).emit("chatbot_message", order);
          }
          break;

        case "0":
          if (order.length === 0) {
            io.to(sessionId).emit(
              "chatbot_message",
              "There is no order to cancel!"
            );
            io.to(sessionId).emit(
              "chatbot_message",
              "Press 1 to place an order"
            );
          } else {
            sessionData.order = [];
            order = "";
            io.to(sessionId).emit("chatbot_message", "Order cancelled!");
          }
          break;

        default:
          if (sessionData.selection === "foodbaskets") {
            switch (message) {
              case "11":
                sessionData.selection = "11";
                console.log(sessionData);
                let snacks =
                  "2 for Shawarma - NGN1500<br>3 for Small chops - NGN1000<br>4 for Cookies - NGN1200<br>5 for Chocolate-filled Donut - NGN3000<br>1 to go back to the food baskets";
                io.to(sessionId).emit("chatbot_message", snacks);
                break;

              case "12":
                sessionData.selection = "12";
                console.log(sessionData);
                let swallows =
                  "2 for Amala and Ewedu/Ogbonna - NGN2000<br>3 for Pounded yam and Efo riro - NGN3000<br>4 for Wheat and Afang - NGN4800<br>5 for Poundo yam and Egusi - NGN4800<br>1 to go back to the food baskets";
                io.to(sessionId).emit("chatbot_message", swallows);
                break;

              case "13":
                sessionData.selection = "13";
                console.log(sessionData);
                let continental =
                  "2 for Scrambled eggs - NGN3000<br>3 for Peri Peri prawns - NGN6000<br>4 for Jerk chicken - NGN5800<br>4 for Sticky chicken wings - NGN6000<br>1 to go back to the food baskets";
                io.to(sessionId).emit("chatbot_message", continental);
                break;

              case "14":
                sessionData.selection = "14";
                console.log(sessionData);
                let drinks =
                  "2 for Orange and Banana Smoothie - NGN800<br>3 for Ice cream - NGN600<br>4 for Wine - NGN700<br>1 to go back to the food baskets";
                io.to(sessionId).emit("chatbot_message", drinks);
                break;

              default:
                io.to(sessionId).emit(
                  "chatbot_message",
                  "Invalid option! Please select one of the options above"
                );
                break;
            }
          } else {
            const selection = sessionData.selection;
            switch (selection) {
              case "11":
                switch (message) {
                  case "2":
                    // order.push("Shawarma - #\1500");
                    sessionData.order.push("Shawarma - NGN1500");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Shawarma - NGN1500 added to your basket"
                    );
                    break;
                  case "3":
                    // order.push("Small chops - NGN1000");
                    sessionData.order.push("Small chops - NGN1000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Small chops - NGN1000 added to your order"
                    );
                    break;
                  case "4":
                    // order.push("Cookies - NGN1200");
                    sessionData.order.push("Cookies - NGN1200");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Cookies - NGN1200 added to your order"
                    );
                    break;
                  case "5":
                    // order.push("Chocolate-filled Donut - NGN300");
                    sessionData.order.push("Chocolate-filled Donut - NGN300");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Chocolate-filled Donut - NGN300 added to your order"
                    );
                    break;
                  default:
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Enter the number attached to the food basket"
                    );
                    break;
                }
                break;

              case "12":
                switch (message) {
                  case "2":
                    sessionData.order.push("Amala and Ewedu/Ogbonna - NGN2000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Amala and Ewedu/Ogbonna - NGN2000 added to your order"
                    );
                    break;
                  case "3":
                    sessionData.order.push(
                      "Pounded yam and Efo riro - NGN3000"
                    );
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Pounded yam and Efo riro - NGN3000 added to your order"
                    );
                    break;
                  case "4":
                    sessionData.order.push("Wheat and Afang - NGN4800");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Wheat and Afang - NGN4800 added to your order"
                    );
                    break;
                  case "5":
                    sessionData.order.push("Poundo yam and Egusi - NGN4800");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Chocolate-filled Donut - NGN300 added to your order"
                    );
                    break;
                  default:
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Enter the number attached to the food basket"
                    );
                    break;
                }
                break;

              case "13":
                switch (message) {
                  case "2":
                    sessionData.order.push("Scrambled eggs - NGN3000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Scrambled eggs - NGN3000 added!"
                    );
                    break;
                  case "3":
                    sessionData.order.push("Peri Peri prawns - NGN6000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Peri Peri prawns - NGN6000 added!"
                    );
                    break;
                  case "4":
                    sessionData.order.push("Jerk chicken - NGN5800");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Jerk chicken - NGN5800 added"
                    );
                    break;
                  case "5":
                    sessionData.order.push("Sticky chicken wings - NGN6000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Sticky chicken wings - NGN6000 added to your order"
                    );
                    break;
                  default:
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Enter the number attached to the food basket"
                    );
                    break;
                }
                break;

              case "14":
                switch (message) {
                  case "2":
                    sessionData.order.push(
                      "Orange and Banana Smoothie - NGN800"
                    );
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Orange and Banana Smoothie - NGN800 added!"
                    );
                    break;
                  case "3":
                    sessionData.order.push("Ice cream - NGN600");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Ice cream - NGN600 added!"
                    );
                    break;
                  case "4":
                    sessionData.order.push("Wine - NGN7000");
                    console.log(sessionData);
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Wine - NGN700 added!"
                    );
                    break;
                  default:
                    io.to(sessionId).emit(
                      "chatbot_message",
                      "Enter the number attached to the food basket"
                    );
                    break;
                }
            }
          }
      }
    }
  });
  sessionData.save();
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
