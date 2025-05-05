const express = require('express');
const router = express.Router();
const Issue = require('../models/IssueSchema');

// GET all issues
router.get('/getissues', async (req, res) => {
  try {
    const problems = await Issue.find();
    res.status(200).json(problems);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch issues", error: e.message });
  }
});

// CREATE new issue
router.post('/create', async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  if (!title || !description || !dueDate || !priority) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newIssue = new Issue({ title, description, dueDate, priority });
    const savedIssue = await newIssue.save();
    res.status(201).json({ message: "Issue created successfully", savedIssue });
  } catch (e) {
    res.status(500).json({ message: "Failed to create issue", error: e.message });
  }
});

// UPDATE issue
router.put('/updatedIssues/:id', async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, priority },
      { new: true }
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({ message: "Issue updated successfully", updatedIssue });
  } catch (e) {
    res.status(500).json({ message: "Update failed", error: e.message });
  }
});

// DELETE issue
router.delete('/deletedIssues/:id', async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);

    if (!deletedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({ message: "Issue deleted successfully", deletedIssue });
  } catch (e) {
    res.status(500).json({ message: "Delete failed", error: e.message });
  }
});

module.exports = router;
