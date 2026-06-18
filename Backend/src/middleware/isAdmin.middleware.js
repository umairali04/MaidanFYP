export const isAdmin = (req, res, next) => {
  try {
    // Ensure user exists (important for safety)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: User not found"
      });
    }

    // Check role
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access only"
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error in admin middleware",
      error: error.message
    });
  }
};