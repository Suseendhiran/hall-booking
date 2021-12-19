import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { RoomsRouter } from "./Routers/roomsRouter.js";
import BookingRouter from "./Routers/bookingRouter.js";
const app = express();

dotenv.config();
app.listen(process.env.PORT);
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongodb Connected");
  return client;
}
export const client = await createConnection();

app.get("/", (req, res) => {
  res.send("Hall Booking API");
});

app.use("/rooms", RoomsRouter);
app.use("/bookings", BookingRouter);
