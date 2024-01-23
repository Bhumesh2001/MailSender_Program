const nodemailer = require('nodemailer');
const fs = require('fs');
const dns = require('dns');
const util = require('util');

const { getAllhrMails, Save_Mails_In_Database, AppliedMailsCount } = require('./CheckMails');
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
        var AppliedMails = [];
        var AppliedMails2 = [];

        function isEmailValid(email) {
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return regex.test(email);
        };

        const resolveMxAsync = util.promisify(dns.resolveMx);
        async function checkDomainExists(domain) {
            try {
                await resolveMxAsync(domain);
                return true;

            } catch (err) {
                return false;
            }
        };

        for (let mail of FilterMails) {
            try {
                if (!mailsArray.includes(mail)) {
                    let domain = mail.split('@')[1];
                    if (isEmailValid(mail) && await checkDomainExists(domain)) {
                        let transPorter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: true,
                            pool: true,
                            auth: {
                                user: '',
                                pass: '',
                            }
                        });
                        let body = `<p><strong>Hello hiring team,</strong></p>
                                    <p>I trust this message finds you well. I am writing to express my interest in exploring new opportunities in Node.js development and to inquire about potential openings within your esteemed organization.</p>
                                    
                                    <p>I bring 1 year of hands-on experience in server-side JavaScript, API development, and database management. Throughout my career, I have successfully delivered scalable and efficient web applications, contributing to the growth and success of my current employer.</p>

                                    <strong>Key Skills:</strong>

                                    <p><strong>* </strong>Proficient in Node.js and server-side JavaScript.<br>
                                    <strong>* </strong>Expertise in API development and database management.<br>
                                    <strong>* </strong>Strong problem-solving abilities and a commitment to code quality.</p>
                                    
                                    <p>I am eager to leverage my skills in a new and challenging environment where I can make meaningful contributions to innovative projects. Enclosed is my updated resume for your review.</p>
                                    
                                    <p>Thank you for considering my application. I look forward to the possibility of discussing how my background aligns with the opportunities at your company.</p>

                                    <strong>Best regards,</strong>
                        
                                    <p>Bhumesh Kewat<br>
                                    Linkedin Profile https://www.linkedin.com/in/bhumesh-kewat/<br>
                                    Github Profile https://github.com/Bhumesh2001?tab=repositories<br>
                                    Mobile No: 8080368624</p>
                                `;

                        let info = await transPorter.sendMail({
                            from: '"Bhumesh Kewat" <bhumesh2212001@gmail.com>',
                            to: mail,
                            subject: "Exploring Exciting Opportunities in Node.js Development",
                            text: "This is mail by me",
                            html: body,
                            attachments: [
                                {
                                    filename: "bhumeshResume.pdf",
                                    content: fs.createReadStream("./bhumeshResume.pdf")
                                }
                            ],
                            priority: 'high'
                        });

                        AppliedMails.push(mail);
                        console.log(info.messageId);
                        mailCount++
                    };
                } else {
                    AppliedMails2.push(mail);
                };

            } catch (error) {
                console.log(error);
            };
        };
        if (!AppliedMails.length == 0) {
            Save_Mails_In_Database(AppliedMails);
            console.log('Applied mails saved successfully in the database');
        }
        if (!AppliedMails2.length == 0) {
            console.log('You have allready applied for the job on this mails => ', { Count: AppliedMails2.length, AllreadyAppliedMails: AppliedMails2 });
        }
        console.log(mailCount, " mail has been sent\n");
        let countedMail = await AppliedMailsCount();
        console.log('I have applied for the job in IT company', countedMail, 'mails till now');

    } else {
        console.log('Please Enter the mail in array or in String');
    };
};
mailSender();