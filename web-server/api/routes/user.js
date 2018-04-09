const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
router.get("/users", (req, res) => {
  console.log("here");
  userController.getAll(req, res);
});
router.route("/user").post((req, res) => {
  userController.post(req, res);
});

router
  .route("/user/:id")
  .get((req, res) => {
    userController.get(req, res);
  })
  .put((req, res) => {
    userController.put(req, res);
  })
  .delete((req, res) => {
    userController.delete(req, res);
  });
module.exports = router;
