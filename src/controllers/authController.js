import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { saveLog } from "../utils/saveLogsMongo.js";

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, role, company, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: "Email already registered" });

    const user = await User.create({ name, email, password, role, company, phone });
    const token = signToken({ id: user._id, role: user.role });

    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    await saveLog("login request " + req)
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))){
      await saveLog("login failure " + "Invalid email or password")
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    if (!user.isActive)
      return res.status(403).json({ success: false, error: "Account deactivated" });

    const token = signToken({ id: user._id, role: user.role });
    const userObj = user.toJSON(); // strips password
    await saveLog("login success " + token, userObj)
    res.json({ success: true, token, user: userObj });
  } catch (err) { next(err); }
}

// GET /api/auth/me
export async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

// PUT /api/auth/profile
export async function updateProfile(req, res, next) {
  try {
    const { name, company, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, company, phone },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
}
