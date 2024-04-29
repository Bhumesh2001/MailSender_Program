require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const { getAllhrMails, Save_Mails_In_Database, AppliedMailsCount } = require('./checkMails');
const { MailsHr } = require('./mailConvertString');

const mailSender = async () => {
    const AllHrMails = await getAllhrMails();
    let mailsArray = [];
    AllHrMails.forEach((document) => {
        document.HrEmails.forEach((mail) => {
            mailsArray.push(mail);
        });
    });
    if (!MailsHr == '') {
        let FilterMails = MailsHr.filter((value, index) => MailsHr.indexOf(value) === index);
        let mailCount = 0;
        let AppliedMails = [];
        let AppliedMails2 = [];
        for (let mail of FilterMails) {
            try {
                if (!mailsArray.includes(mail)) {
                    let transPorter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        pool: true,
                        auth: {
                            user: process.env.USER,
                            pass: process.env.PASS,
                        }
                    });
                    let body = `<p><strong>Hi,</strong></p>
                                <p>I hope this email finds you well. I am writing to express my interest in the Backend Node.js 
                                Developer position at your company. With a strong background in backend development, 
                                I am excited about the opportunity to contribute to your innovative team.</p>

                                <strong>Key Skills:</strong>

                                <p><strong>* </strong>Proficient in Node.js and server-side JavaScript.<br>
                                <strong>* </strong>Expertise in API development and database management.<br>
                                <strong>* </strong>Strong problem-solving abilities and a commitment to code quality.</p>
                                
                                <p>I am confident that my technical skills and passion for clean, 
                                efficient code align with the needs of your company. 
                                I am eager to bring my expertise to your team and contribute to the success of your projects.</p>
                                
                                <p>Thank you for considering my application. 
                                I have attached my resume for your review, and 
                                I look forward to the opportunity to discuss how my skills can benefit your company.</p>

                                <strong>Best regards,</strong>
                    
                                <p>Bhumesh Kewat<br>
                                Linkedin Profile https://www.linkedin.com/in/bhumesh-kewat/<br>
                                Github Profile https://github.com/Bhumesh2001?tab=repositories<br>
                                Mobile No: 8080368624</p>
                            `;
                    let info = await transPorter.sendMail({
                        from: '"Bhumesh Kewat" <bhumesh2212001@gmail.com>',
                        to: mail,
                        subject: "Application for Backend Node.js Developer Position",
                        text: "This is mail by me",
                        html: body,
                        attachments: [
                            {
                                filename: "kewat_Resume.pdf",
                                content: fs.createReadStream("./kewat_Resume.pdf")
                            }
                        ],
                        priority: 'high'
                    });
                    AppliedMails.push(mail);
                    console.log(info.messageId);
                    mailCount++
                } else {
                    AppliedMails2.push(mail);
                };
            } catch (error) {
                console.log(error);
            };
        };
        if (!AppliedMails.length == 0) {
            await Save_Mails_In_Database(AppliedMails);
            console.log('\nApplied mails saved successfully in the database\n');
        }
        if (!AppliedMails2.length == 0) {
            console.log(
                'You have allready applied for the job on this mails => ',
                { Count: AppliedMails2.length, AllreadyAppliedMails: AppliedMails2 }
            );
        };
        console.log(mailCount, " mail has been sent\n");
        let countedMail = await AppliedMailsCount();
        console.log('I have applied for the job in IT company', countedMail, 'mails till now');
    } else {
        console.log('Please Enter the mail in array or in String');
    };
};
mailSender();