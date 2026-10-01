const env = require("./backend/src/config/env");
const app = require("./backend/src/app");

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AddisVenuX API running in ${env.NODE_ENV} mode on port ${PORT}`);
});