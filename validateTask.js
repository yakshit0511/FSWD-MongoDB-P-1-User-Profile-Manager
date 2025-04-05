const validateTask = (req, res, next) => {
    const { title, status } = req.body;
  
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required and must be a non-empty string' });
    }
  
    if (!status || (status !== 'pending' && status !== 'completed')) {
      return res.status(400).json({ message: 'Status must be either "pending" or "completed"' });
    }
  
    next();
  };
  
  module.exports = validateTask;

