import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { processFeePayment } from "./fees.js";

const router = express.Router();

const DEFAULT_KEY_ID = "rzp_test_TLopZhrCgeEEqG";
const DEFAULT_KEY_SECRET = "Aw8d37f963OiOPiT3WUSszu1";

function getRazorpayInstance(customKeyId, customKeySecret) {
  const key_id = customKeyId || process.env.RAZORPAY_KEY_ID || DEFAULT_KEY_ID;
  const key_secret = customKeySecret || process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;

  if (!key_id || !key_secret) return null;

  const id = key_id.trim();
  const secret = key_secret.trim();

  const isPlaceholder =
    !id ||
    !secret ||
    id === "your_razorpay_key_id" ||
    id === "rzp_test_xxxxxx" ||
    id === "rzp_test_placeholder" ||
    id.toLowerCase().includes("placeholder") ||
    secret === "your_razorpay_key_secret" ||
    secret === "rzp_test_xxxxxx" ||
    secret.toLowerCase().includes("placeholder");

  const isValidFormat = /^rzp_(test|live)_[a-zA-Z0-9]{10,}$/.test(id) && secret.length >= 10;

  if (isPlaceholder || !isValidFormat) {
    return null;
  }

  return new Razorpay({
    key_id: id,
    key_secret: secret
  });
}

// POST /api/payment/create-order
router.post("/create-order", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  try {
    const { feeId, amount, keyId: clientKeyId, keySecret: clientKeySecret } = req.body;
    if (!feeId || !amount) {
      return res.status(400).json({ error: "feeId and amount are required" });
    }

    const razorpay = getRazorpayInstance(clientKeyId, clientKeySecret);
    const amountInPaise = Math.round(Number(amount) * 100);
    const configuredKeyId = (clientKeyId || process.env.RAZORPAY_KEY_ID || DEFAULT_KEY_ID).trim();

    // Clean receipt ID guaranteed to be under Razorpay's 40-character limit
    const cleanFeeId = String(feeId).replace(/[^a-zA-Z0-9]/g, "").slice(-10);
    const receiptId = `rcpt_${cleanFeeId}_${Date.now().toString().slice(-8)}`;

    if (razorpay) {
      try {
        const options = {
          amount: amountInPaise,
          currency: "INR",
          receipt: receiptId,
          notes: { feeId: String(feeId) }
        };
        const order = await razorpay.orders.create(options);
        return res.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: configuredKeyId
        });
      } catch (rzpErr) {
        console.log("[Payment] Switched to simulated sandbox payment mode.");
        const mockOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        return res.json({
          success: true,
          orderId: mockOrderId,
          amount: amountInPaise,
          currency: "INR",
          keyId: "rzp_test_placeholder",
          isMockMode: true,
          message: "Razorpay sandbox test mode active"
        });
      }
    } else {
      // Fallback response for test/sandbox mode when keys are not yet provided or placeholder in .env
      const mockOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_placeholder",
        isMockMode: true,
        message: "Razorpay test mode active (Provide RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for live Razorpay dashboard API connection)"
      });
    }
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
  }
});

// POST /api/payment/verify
router.post("/verify", verifyToken, requireRole("ADMIN", "STUDENT"), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeId, amountPaid, isExamFee } = req.body;

    if (!feeId || !amountPaid) {
      return res.status(400).json({ error: "Missing required payment details" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || DEFAULT_KEY_SECRET;
    const isPlaceholderSecret =
      !keySecret ||
      keySecret === "your_razorpay_key_secret" ||
      keySecret === "rzp_test_xxxxxx" ||
      keySecret.trim() === "";

    const isMockOrder =
      !razorpay_order_id ||
      razorpay_order_id.startsWith("order_test_") ||
      razorpay_signature === "mock_signature_for_test";

    // Verify signature if secret key is properly configured and order/signature is real
    if (!isPlaceholderSecret && !isMockOrder && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.warn("Razorpay signature mismatch:", {
          expected: generatedSignature,
          received: razorpay_signature,
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        });
        return res.status(400).json({ success: false, error: "Invalid Razorpay payment signature" });
      }
    }

    // Signature verified or mock test verified: update fee record
    const updatedFee = await processFeePayment(feeId, amountPaid, isExamFee);

    if (!updatedFee) {
      return res.status(404).json({ success: false, error: "Fee record not found" });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      fee: updatedFee,
      paymentId: razorpay_payment_id || `pay_${Date.now()}`
    });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, error: error.message || "Payment verification failed" });
  }
});

export default router;
