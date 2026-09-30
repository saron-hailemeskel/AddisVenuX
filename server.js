require("dotenv").config();

const app = require("./backend/src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AddisVenuX API running on port ${PORT}`);
});