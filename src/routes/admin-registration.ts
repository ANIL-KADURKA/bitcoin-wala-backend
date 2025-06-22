import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import nodemailer from "nodemailer";
import { getEmail } from "../utils/getAdminEmail";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import fs from 'fs'

export const adminRouter = express.Router();

adminRouter.post("/register-admin", async (req: Request, res: Response) => {
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
      remarks: {},
    });
    res
      .status(201)
      .json({ message: "Registration submitted. Awaiting approval." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const updatedUser = await User.findByPk(req.params.id);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

adminRouter.post("/email/:id", async (req: Request, res: Response) => {
  try {
    const {
      password,
      email,
    }: { username: string; password: string; email: string } = req.body;
    const id = req.params.id;
    const user = await User.findOne({ where: { id } });
    if (!user || user.role !== "super_admin") {
      res.status(404).json({ message: "Admin not found" });
      return;
    }
    const emailObj = {
      email: email,
      password: password,
    };
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: email,
      to: 'ushasrigudikandula456@gmail.com',
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
          <h2 style="color: #333;">Test Email</h2>
        </div>
      `,
    });
    user.remarks = emailObj;
    await user.save();
    res.json({ message: "Added email and token successfully." });
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
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
  const { email, password }: { email: string; password: string } =
    req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User with provided email not found" });
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
    const { email, otp }: { email: string; otp: string } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ message: "Please enter your registered email" });
        return;
      }
      await user.save();

      const result = await getEmail();

      if (!result) {
        res.status(503).json({ message: "Service unavailable. Please try again later" });
        return;
      }

      const { sendingEmail, password } = result;

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: sendingEmail,
          pass: password,
        },
      });

      await transporter.sendMail({
        from: sendingEmail,
        to: email,
        subject: "Password Reset OTP",
        html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9; border: 1px solid #e0e0e0;">
      <h2 style="color: #333;">Password Reset Request for Bitcoinwala.ai</h2>
      <p style="font-size: 16px; color: #555;">Hi ${user.username},</p>
      <p style="font-size: 16px; color: #555;">
        We received a request to reset your password. Please use the OTP below to proceed:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #007BFF;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #888;">
        This OTP is valid for the next 10 minutes.
      </p>
      <p style="font-size: 14px; color: #aaa; margin-top: 30px;">– Bitcoin Team</p>
    </div>
  `,
      });
      console.log("email sent")
      res.status(200).json({ message: "OTP sent to your email." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

adminRouter.post("/reset-password", async (req: Request, res: Response) => {
  const {
    email,
    newPassword,
  }: {
    email: string;
    newPassword: string;
    expiresAt: Date;
  } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// const __filename = fileURLToPath(import.meta.url);
const baseDir = path.resolve();
const jsonPath = path.join(baseDir, "whitepaper.json");
adminRouter.get("/api/whitepaper", (req, res) => {
  fs.readFile(jsonPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading whitepaper:", err);
      return res.status(500).json({ error: "Unable to read file." });
    }
    res.json(JSON.parse(data));
  });
});

// POST: Overwrite JSON
adminRouter.post("/api/whitepaper", (req, res) => {
  const updatedData = req.body;

  fs.writeFile(jsonPath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).json({ error: "Unable to write file." });
    }
    res.json({ message: "File updated successfully ✅" });
  });
});
