const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const admin = await User.findOne({ email, role: "superadmin" });

    if (!admin) {
      return res.status(400).json({ error: "Superadmin not found" });
    }

    const isMatch = await bcrypt.compare(password.trim(), admin.password.trim());

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createToken(admin._id, admin.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,             // ✅ must be true in HTTPS (Render)
      sameSite: "None",         // ✅ must be None for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      message: "Login successful",
      user: adminData,
    });

  } catch (error) {
    console.error("🔥 Login error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
