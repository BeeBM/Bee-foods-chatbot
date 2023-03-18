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

const aDay = 60000 * 60 * 24;
//handle sessions
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: aDay },
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

  const choiceMaker =
    "Select a category of food you would like to have:<br>11 for snacks <br>12 for swallows<br>13 for African dishes<br>14 for drinks";

  if (!sessionData.name) {
    socket.emit("chatbot_message", "Welcome to Bee Foods. What is your name?");
  } else {
    socket.emit(
      "chatbot_message",
      `Welcome back to Bee Foods, ${sessionData.name}.<br>Type "ok" to start`
    );
  }

  socket.on("user_input", (message) => {
    sessionData.reload((err) => {
      if (err) {
        console.log("user disconnected");
        return socket.disconnect();
      }
      console.log("user connected", sessionData);
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
              io.to(sessionId).emit(
                "chatbot_message",
                "No order to place yet!"
              );
              io.to(sessionId).emit(
                "chatbot_message",
                "Press 1 to place an order"
              );
            } else {
              sessionData.orderHistory.push(order);
              io.to(sessionId).emit("chatbot_message", "Order placed!");
              sessionData.order = [];
              order = "";
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
                (acc, curr) => `${acc}<br><hr>${curr}`
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
            const foodItems = {
              11: {
                22: "22 for Shawarma - NGN1500",
                23: "23 for Small chops - NGN1000",
                24: "24 for Cookies - NGN1200",
                25: "25 for Chocolate-filled Donut - NGN300",
              },
              12: {
                32: "32 for Amala and Ewedu/Ogbonno - NGN2000",
                33: "33 for Pounded yam and Efo riro - NGN3000",
                34: "34 for Wheat and Afang - NGN4800",
                35: "35 for Poundo yam and Egusi - NGN4800",
              },
              13: {
                42: "42 for Scrambled eggs - NGN3000",
                43: "43 for Peri Peri prawns - NGN6000",
                44: "44 for  Jerk chicken - NGN5800",
                45: "45 for Sticky chicken wings - NGN6000",
              },
              14: {
                52: "52 for Orange and Banana Smoothie - NGN800",
                53: "53 for Ice cream - NGN600",
                54: "54 for Wine - NGN700",
              },
            };
            if (sessionData.selection === "foodbaskets") {
              if (foodItems[message]) {
                const basket = foodItems[message];
                sessionData.selection = message;
                io.to(sessionId).emit(
                  "chatbot_message",
                  `${Object.values(basket).reduce(
                    (opt, currOpt) => `${opt}<br>${currOpt}`
                  )}<br>1 for going back to food category selection.`
                );
              } else {
                io.to(sessionId).emit(
                  "chatbot_message",
                  "Invalid option! Please select one of the options above"
                );
              }
            } else {
              const selection = sessionData.selection;

              if (foodItems[selection][message]) {
                const orderedFood = foodItems[selection][message];
                const formatedItem = orderedFood.slice(7);
                sessionData.order.push(formatedItem);
                console.log(sessionData);
                io.to(sessionId).emit(
                  "chatbot_message",
                  `${formatedItem} added to your order`
                );
              } else if (message === "1") {
                sessionData.selection = "foodbaskets";
                console.log(sessionData);
                io.to(sessionId).emit(
                  "chatbot_message",
                  "Please select a food basket from the following: 11 for Snacks, 12 for Swallows, 13 for Continental, 14 for Drinks."
                );
              } else {
                io.to(sessionId).emit(
                  "chatbot_message",
                  "Invalid option! Please select one of the options above"
                );
              }
            }
        }
      }
      sessionData.save();
    });
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
