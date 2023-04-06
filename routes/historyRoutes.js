const { startApp, getAppStatus, getHistory, dropCollection, getAccounts } = require("../controllers/historyController");
const router = require("express").Router();

router.post("/startApp", startApp);
router.get("/getAppStatus", getAppStatus);
router.post("/getHistory", getHistory);
router.post("/dropCollection", dropCollection);
router.post("/getAccounts", getAccounts);

module.exports = router;
