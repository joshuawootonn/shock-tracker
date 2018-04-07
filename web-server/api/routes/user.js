const express = require("express");
const router = express.Router();

router.get("/users", (req, res) => {
  res.send("all the users");
});
router
  .route("/user")
  .get((req, res) => {res.send("a user");})
  .post((req, res) => {})
  .put((req, res) => {})
  .delete((req, res) => {});
module.exports = router;
