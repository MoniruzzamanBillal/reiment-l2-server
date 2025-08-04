import nodemailer from "nodemailer";

export const sendEmail = async (
  resetPasswordLink: string,
  receiverMail: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "mdmoniruzzamanbillal2@gmail.com",
      pass: "ilmf eeqw agtp mibf",
    },
  });

  const response = await transporter.sendMail({
    from: "mdmoniruzzamanbillal2@gmail.com",
    to: receiverMail, // list of receivers
    subject: "Reset your password within 5 mins!",
    text: "", // plain text body
    html: resetPasswordLink,
  });

  return response;
};
