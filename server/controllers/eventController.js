const Event = require('../models/Eventmodel');


exports.getAllEvents = async (req, res) => {
    try {

        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.location) {
            filter.location = req.query.location;
        }

        const events = await Event.find(filter).sort({ date: 1 }); // Sort by date in ascending order
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

    try {
        const seats = Number(totalSeats);
        const price = Number(ticketPrice);

        const event = new Event({
            title,
            description,
            date: new Date(date),
            location,
            category,
            totalSeats: seats,
            availableSeats: seats, // Mongoose schema requires availableSeats
            ticketPrice: price,
            imageUrl: imageUrl || '',
            // If your schema has an 'organizer' or 'createdBy' field, attach it safely:
            ...(req.user && { createdBy: req.user._id, organizer: req.user._id })
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('--- CREATE EVENT ERROR DETAIL ---');
        console.error(error); // Logs the full stack trace in your terminal
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        }, { new: true });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};