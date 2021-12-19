import express from "express";
import { client } from "../index.js";

const router = express.Router();

router.route("/availablerooms").get(async (req, res) => {
  const availableRooms = await client
    .db("hallbooking")
    .collection("rooms")
    .find({ availability: true })
    .toArray();
  res.send(availableRooms);
});
router.route("/createroom").post(async (req, res) => {
  const mongoResponse = await client
    .db("hallbooking")
    .collection("rooms")
    .insertOne(req.body);
  if (mongoResponse.acknowledged) {
    res.status(200).send({ message: "Room Created Successfully" });
  }
});
router.route("/allRooms").get(async (req, res) => {
  const availableRooms = await client
    .db("hallbooking")
    .collection("rooms")
    .find({})
    .toArray();
  res.send(availableRooms);
});
router.route("/bookedrooms").get(async (req, res) => {
  const availableRooms = await client
    .db("hallbooking")
    .collection("rooms")
    .find({ $expr: { $gte: [{ $size: "$bookingsInfo" }, 1] } })
    .toArray();
  res.send(availableRooms);
});

export const RoomsRouter = router;
