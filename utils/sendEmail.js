import nodemailer from "nodemailer";

export const sendEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: "no-reply@closho.com",
        to: email,
        subject: "Password Reset",
        text: `Use this token to reset your password: ${token}`
    });

    console.log("📧 Reset email sent to:", email);
};
