import express from "express";
import { client } from "../index.js";
import { ObjectId } from "mongodb";
import moment from "moment";

const router = express.Router();

router.route("/createbooking").post(async (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const bookingDetails = {
    ...req.body,
    serviceStatus: "Service booked",
    reservationTime: {
      from: from,
      to: to,
    },
  };
  const { bookingsInfo, roomName } = await client
    .db("hallbooking")
    .collection("rooms")
    .findOne(
      { _id: ObjectId(req.body.roomId) },
      { projection: { bookingsInfo: 1, roomName: 1, _id: 0 } }
    );
  //bookingDetails.roomName = roomName;
  console.log("bookingsinfos", bookingsInfo, roomName);

  //to value should be ahead of from
  if (moment(from).isAfter(moment(to))) {
    res.send({ message: "To Time/date should be ahead of from date/time" });
    return;
  }

  //Check for minimum stay duration
  const stayDuration = moment(to).diff(moment(from), "hours");
  if (stayDuration < 4) {
    res.send({ message: "Minimum stay duration shouold be 4 hours" });
    return;
  }

  //Check if from date less than current date
  if (moment(from).isBefore(moment())) {
    res.send({ message: "Date should not be past date" });
    return;
  }
  const createBooking = async () => {
    const insertBooking = await client
      .db("hallbooking")
      .collection("bookings")
      .insertOne(bookingDetails);
    console.log("insert", insertBooking);
    const insertDate = await client
      .db("hallbooking")
      .collection("rooms")
      .updateOne(
        { _id: ObjectId(bookingDetails.roomId) },
        {
          $push: {
            bookingsInfo: {
              bookingId: insertBooking.insertedId.toString(),
              customerName: bookingDetails.customerName,
              serviceStatus: "Service booked",
              ...bookingDetails.reservationTime,
            },
          },
        }
      );

    if (insertBooking.acknowledged && insertDate.modifiedCount > 0) {
      res.send({ message: "Booking created" });
      return;
    }
  };

  if (!bookingsInfo.length) {
    createBooking();
    return;
  }
  //check availabilities by comparing previous bookings of room, returns true if available
  const available = bookingsInfo.every((booking) => {
    return (
      !moment(from).isSame(booking.from) || !moment(from).isBefore(booking.to)
    );
  });

  if (available) {
    console.log("available");
    createBooking();
    return;
  } else {
    res.send({ message: `Hall not available on ${from}` });
    return;
  }

  res.status(400).send({ message: "Error in Booking" });
});
router.route("/").get(async (req, res) => {
  const allBookings = await client
    .db("hallbooking")
    .collection("bookings")
    .find({})
    .toArray();
  res.send(allBookings);
});
router.route("/bookedcustomers").get(async (req, res) => {
  const bookedCustomers = await client
    .db("hallbooking")
    .collection("bookings")
    .find(
      { serviceStatus: "Service booked" },
      { projection: { serviceStatus: 0 } }
    )
    .toArray();
  res.send(bookedCustomers);
});

export default router;
