const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wa_groups_sl";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err  => console.error("❌ MongoDB:", err.message));

app.use("/api/groups", require("./routes/groups"));
app.use("/api/admin",  require("./routes/admin"));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WA Group Links SL v3 on port ${PORT}`);
});
