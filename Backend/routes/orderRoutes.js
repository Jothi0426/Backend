// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// In‑memory store (replace with real DB calls)
const orderTrackingData = {
  '5aca6c1e0bbf9127f8631952': [
    { status: 'Order Confirmed',    date: '2021‑12‑28T13:47:00Z', completed: true },
    { status: 'Shipped',            date: '2021‑12‑30T01:30:00Z', completed: true },
    { status: 'Out For Delivery',   date: '2021‑12‑30T11:31:00Z', completed: true },
    { status: 'Delivered',          date: '2021‑12‑30T16:45:00Z', completed: true },
    { status: 'Return Requested',   date: '2021‑12‑31T14:23:00Z', completed: false },
  ]
};

// GET /order/:orderId/tracking
router.get('/:orderId/tracking', (req, res) => {
  const steps = orderTrackingData[req.params.orderId];
  if (!steps) return res.status(404).json({ message: 'Order not found' });
  res.json(steps);
});

module.exports = router;
