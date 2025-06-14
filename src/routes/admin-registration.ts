import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const adminRouter = express.Router();

adminRouter.post("/register-admin", async (req: Request, res: Response) => {
  console.log("camee");
  const {
    username,
    password,
    email,
  }: { username: string; password: string; email: string } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      email,
      role: "admin",
      status: "pending",
    });
    res
      .status(201)
      .json({ message: "Registration submitted. Awaiting approval." });
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});


adminRouter.post("/approve-admin/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user || user.role !== "admin") {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    user.status = "approved";
    await user.save();
    res.json({ message: "Admin approved successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


adminRouter.post("/reject-admin/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user || user.role !== "admin") {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    await user.destroy();
    res.json({ message: "Admin record deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


adminRouter.get("/pending-admins", async (_req: Request, res: Response) => {
  try {
    const pendingAdmins = await User.findAll({
      where: { role: "admin", status: "pending" },
    });

    res.json(pendingAdmins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


adminRouter.get("/active-admins", async (_req: Request, res: Response) => {
  try {
    const activeAdmins = await User.findAll({
      where: { role: "admin", status: "approved" },
    });

    res.json(activeAdmins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


adminRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Incorrect password" });
      return;
    }
    if (user.role === "admin" && user.status !== "approved") {
      res.status(403).json({ message: "Admin registration not approved yet." });
      return;
    }

    res.json({ message: "Login successful", user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


adminRouter.post(
  "/request-reset-password",
  async (req: Request, res: Response) => {
    const { email }: { email: string } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ message: "Email not registered" });
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
      const expires = new Date(Date.now() + 10 * 60 * 1000); 

      user.otp = otp;
      user.otpExpiresAt = expires;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is: ${otp}`,
      });

      res.json({ message: "OTP sent to your email." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);


adminRouter.post("/reset-password", async (req: Request, res: Response) => {
  const {
    email,
    otp,
    newPassword,
  }: { email: string; otp: string; newPassword: string } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.otp || user.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    if (new Date() > user.otpExpiresAt!) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
