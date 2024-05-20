const express = require("express");
const router = express.Router();
const {
  createEntity,
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
  addAttribute,
  deleteAttribute,
  updateAttribute,
} = require("./controllers.js");

router.post("/entities", createEntity);
router.post("/:entity", createEntry);
router.get("/:entity", getEntries);
router.put("/:entity/:id", updateEntry);
router.delete("/:entity/:id", deleteEntry);
router.post("/entities/add-attribute", addAttribute);
router.post("/entities/delete-attribute", deleteAttribute);
router.post("/entities/update-attribute", updateAttribute);

module.exports = router;
