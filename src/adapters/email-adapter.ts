import nodemailer from "nodemailer";


export const EmailAdapter = {

    async sendEmail(email:string,subject:string,message:string){
        const transporter = nodemailer.createTransport({
            service: 'gmail',// с гуглом остальное не надо
            // host: "smtp.ethereal.email",
            // port: 587,
            // secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: "th.great.forest@gmail.com", //My Email
                pass: process.env.GMAIL_COM_PASS,  // My pass
            },
        });
       //async function main() {// async..await is not allowed in global scope, must use a wrapper
            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: '"Ratmir" <th.great.forest@gmail.com>', // sender address
                to: email, // list of receivers
                subject: subject, // Subject line
                html: message, // html body
            });

            //console.log("Message sent: %s", info.messageId, info);
            // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
            return info
       // }
       // main().catch(console.error);

    }

}