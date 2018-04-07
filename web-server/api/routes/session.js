const express = require("express");
const router = express.Router();

router.get("/sessions", (req, res) => {
  res.send("all the sessions");
});
router
  .route("/session")
  .get((req, res) => {res.send("a session");})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});
module.exports = router;
