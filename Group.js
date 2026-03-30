const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    link: {
      type: String, required: true, unique: true, trim: true,
      validate: {
        validator: (v) => /^https:\/\/chat\.whatsapp\.com\//i.test(v),
        message: "Must be a valid WhatsApp invite link",
      },
    },
    category: {
      type: String, required: true,
      enum: ["Gaming","Jobs","Education","Business","Sri Lanka Chats","News","Sports","Tech","Fun","Religion","Music","Travel","Other"],
      default: "Other",
    },
    country:  { type: String, default: "Sri Lanka", trim: true },
    language: { type: String, enum: ["Sinhala","English","Tamil","Any"], default: "Any" },
    tags:        { type: [String], default: [] },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    members:     { type: Number, default: 0, min: 0 },
    isApproved:  { type: Boolean, default: false },
    clicks:      { type: Number, default: 0 },
    submittedBy: { type: String, default: "Anonymous", trim: true },
  },
  { timestamps: true }
);

groupSchema.index({ name: "text", description: "text", tags: "text" });
module.exports = mongoose.model("Group", groupSchema);
