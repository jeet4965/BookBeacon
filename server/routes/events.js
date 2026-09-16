const express = require("express");
const router = express.Router();
const {protect, admin} = require("../middleware/protect");
const {getAllEvents, getEventById, createEvent, updateEvent, deleteEvent} = require("../controllers/eventController");
// Get all events
router.get("/", getAllEvents);

// Get a specific event by ID
router.get("/:id", getEventById);

// Create a new event (admin only)
router.post("/", protect, admin, createEvent);

// Update an existing event (admin only)
router.put("/:id", protect, admin, updateEvent);

// Delete an event (admin only)
router.delete("/:id", protect, admin, deleteEvent);

module.exports = router;