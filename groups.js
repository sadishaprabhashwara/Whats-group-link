const express = require("express");
const router  = express.Router();
const Group   = require("../models/Group");

// GET approved groups with filters
router.get("/", async (req, res) => {
  try {
    const { search, category, country, language, page = 1, limit = 100 } = req.query;
    const filter = { isApproved: true };
    if (category && category !== "Any") filter.category = category;
    if (country  && country  !== "Any") filter.country  = { $regex: country,  $options: "i" };
    if (language && language !== "Any") filter.language = language;
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags:        { $in: [new RegExp(search, "i")] } },
        { category:    { $regex: search, $options: "i" } },
        { country:     { $regex: search, $options: "i" } },
      ];
    }
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const total  = await Group.countDocuments(filter);
    const groups = await Group.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ success: true, total, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit group
router.post("/", async (req, res) => {
  try {
    const { name, link, category, country, language, tags, description, members, submittedBy } = req.body;
    if (!name?.trim() || !link?.trim())
      return res.status(400).json({ success: false, message: "Name and link are required." });

    const existing = await Group.findOne({ link: link.trim() });
    if (existing) {
      const status = existing.isApproved ? "already listed" : "already pending approval";
      return res.status(409).json({ success: false, message: `⚠️ This link is ${status}.` });
    }

    const parsedTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 10) : [];
    const group = new Group({ name, link, category, country, language, tags: parsedTags,
      description, members: parseInt(members) || 0, submittedBy: submittedBy || "Anonymous", isApproved: false });
    await group.save();
    res.status(201).json({ success: true, message: "✅ Submitted for Admin Approval!", group });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(". ") });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Track click
router.patch("/:id/click", async (req, res) => {
  try {
    const g = await Group.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
    res.json({ success: true, clicks: g?.clicks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
