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
router.route("/session/byUser/:id").get((req, res) => {
  sessionController.getByUser(req, res);
});
module.exports = router;
