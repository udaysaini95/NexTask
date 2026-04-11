import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendmEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "NexTask",
            link: "https://mailgen.js/",
        },
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    })

    const mail={
        from: "mail.NexTask@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    }

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.log("Email service failed");
        console.log(error);
    }

}

const emailverificationMailgenContent = (username, verificationUrl) => {
    return {
      body: {
        name: username,
        intro: "Welcome to  ProjM We're very excited to have you on board.",
        action: {
          instructions: 'To get started with ProjM, please click here:',
          button: {
            color: '#22BC66', // Optional action button color
            text: 'Confirm your account',
            link: verificationUrl,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
    
}

const PasswordResetMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password for ProjM.",
      action: {
        instructions: 'To get started with ProjM, please click here:',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Reset your password',
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { emailverificationMailgenContent, PasswordResetMailgenContent ,sendmEmail};