const express = require('express');
const router = express.Router();
const Issue = require('../models/IssueSchema');
const User = require('../models/UserSchema');
const authenticateToken = require('../middleware/authMiddleWare');

// GET all issues
router.get('/getissues', async (req, res) => {
  try {
    const problems = await Issue.find().populate('createdBy', 'mail');
    res.status(200).json(problems);
  } catch (e) {
    console.error('Error fetching issues:', e);
    res.status(500).json({ message: e.message, error: e.message });
  }
});

// GET my issues
router.post('/myissues', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required in body" });
    }

    const userIssues = await Issue.find({ createdBy: userId }).populate('createdBy', 'mail');
    console.log(userIssues);

    res.status(200).json(userIssues);
  } catch (e) {
    console.error('Error fetching user issues:', e);
    res.status(500).json({ message: "Failed to fetch user issues", error: e.message });
  }
});


// CREATE new issue
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !category || !createdBy) {
      return res.status(400).json({ message: 'Title, category, and createdBy are required.' });
    }

    // Optionally, you could verify that createdBy matches req.user._id to ensure authenticity

    const newIssue = new Issue({
      title,
      description,
      category,
      createdBy,
    });

    const savedIssue = await newIssue.save();

    res.status(201).json({
      message: 'Issue created successfully',
      savedIssue,
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ message: err.message, error: err.message });
  }
});



// UPDATE issue
router.put('/updatedIssues/:id', async (req, res) => {
  const { title, description, category, status } = req.body;

  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { title, description, category, status },
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
