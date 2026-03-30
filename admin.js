const express = require("express");
const router  = express.Router();
const Group   = require("../models/Group");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2025";
const ADMIN_TOKEN    = Buffer.from(ADMIN_PASSWORD).toString("base64");

function auth(req, res, next) {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (!token || token !== ADMIN_TOKEN)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

router.post("/login", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD)
    return res.json({ success: true, token: ADMIN_TOKEN });
  res.status(401).json({ success: false, message: "Wrong password" });
});

router.get("/pending",  auth, async (req, res) => {
  const groups = await Group.find({ isApproved: false }).sort({ createdAt: -1 });
  res.json({ success: true, count: groups.length, groups });
});

router.get("/approved", auth, async (req, res) => {
  const groups = await Group.find({ isApproved: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: groups.length, groups });
});

router.patch("/approve/:id", auth, async (req, res) => {
  const g = await Group.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!g) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Approved!", group: g });
});

router.delete("/delete/:id", auth, async (req, res) => {
  const g = await Group.findByIdAndDelete(req.params.id);
  if (!g) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Deleted." });
});

router.get("/stats", auth, async (req, res) => {
  const [total, pending, approved, byCategory] = await Promise.all([
    Group.countDocuments(),
    Group.countDocuments({ isApproved: false }),
    Group.countDocuments({ isApproved: true }),
    Group.aggregate([{ $match: { isApproved: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({ success: true, total, pending, approved, byCategory });
});

module.exports = router;
