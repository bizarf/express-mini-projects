const app = require("./app");
const config = require("./utils/config");

app.listen(PORT, () => {
    console.log(`listening on port ${config.PORT}`);
});
