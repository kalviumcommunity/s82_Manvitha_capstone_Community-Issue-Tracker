const express = require('express');
const router = express.Router();
const Issue = require('../models/IssueSchema');
const User=require('../models/UserSchema');
const authenticateToken=require('../middleware/authMiddleWare');

// GET all issues
router.get('/getissues', async (req, res) => {
  try {
    const problems = await Issue.find().populate('user','mail');
    res.status(200).json(problems);
  } catch (e) {
    console.error('Error fetching issues:', e);
    res.status(500).json({ message: "Failed to fetch issues", error: e.message });
  }
});

// CREATE new issue
router.post('/create',authenticateToken, async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  if (!title || !description || !dueDate || !priority) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newIssue = new Issue({ title, description, dueDate, priority,user:req.user.id });
    const savedIssue = await newIssue.save();
    
    res.status(201).json({ message: "Issue created successfully", savedIssue });
  } catch (e) {
    console.error('Error creating issue:', e);
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
    console.error('Error updating issue:', e);
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
    console.error('Error deleting issue:', e);
    res.status(500).json({ message: "Delete failed", error: e.message });
  }
});

module.exports = router;
