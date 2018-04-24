const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/session");
router.get("/sessions", (req, res) => {
  sessionController.getAll(req, res);
});
router.route("/session").post((req, res) => {
  sessionController.post(req, res);
});
router
  .route("/session/:id")
  .get((req, res) => {
    sessionController.get(req, res);
  })
  .delete((req, res) => {
    sessionController.delete(req, res);
  });
router.route("/session/byLocation/:longitude/:latitude/:radius").get((req, res) => {
  sessionController.getByLocation(req, res);
});
module.exports = router;
