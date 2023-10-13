const nodemailer = require('nodemailer');
const fs = require('fs');
const dns = require('dns');

const { getAllhrMails, Save_Mails_In_Database, AppliedMailsCount } = require('./CheckMails');
const { MailsHr } = require('./mailConvertString');

const mailSender = async()=>{
    const AllHrMails = await getAllhrMails();
    const mailsArray = [];
    AllHrMails.forEach((document)=>{
        document.HrEmails.forEach((mail)=>{
            mailsArray.push(mail);
        });
    });
    if(!MailsHr == ''){

        let FilterMails = MailsHr.filter((value,index)=> MailsHr.indexOf(value) === index);
        let mailCount = 0;
        var AppliedMails = [];
        var AppliedMails2 = [];

        function isEmailValid(email) {
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return regex.test(email);
        };

        function checkDomainExists(domain) {
            dns.resolveMx(domain, (err, addresses) => {
                if (err) {
                    return false
                } else {
                    return true
                };
            });
        };
          
        for(let mail of FilterMails){
            try {
                if(isEmailValid(mail) && checkDomainExists(mail.split('@')[1])){
                    if(!mailsArray.includes(mail)){
                        let transPorter = nodemailer.createTransport({
                                host:"smtp.gmail.com",
                                port:465,
                                secure:true,
                                pool:true,
                                auth: {
                                    user: 'vickyyede30@gmail.com',
                                    pass: 'kxydadnzignhoezd'
                                }
                            });
                        let body = `<p>Hello Ma'am/sir,</p>
                                    <p>I hope this email finds you well. My name is Vicky Yede, and I have completed web development course from navgurukul org at dharamshala(H.P). 
                                    I'm writing to express my interest in the Frontend developer position at your company.</p>
                                    
                                    <p>I have developed strong skills in HTML, CSS, JavaScript, Bootstrap, Tailwind CSS, Hapi.js. I can work on HTML, CSS, JavaScript, Hapi.js, MonogDB. 
                                    I believe these skills will be valuable in contributing to your company mission and goals.</p>
                                    
                                    <p>I've attached my resume and my githhub link to this email for your review. Please let me know if there are any further steps 
                                    I can take to apply for the Frontend developer position or if you require additional information.</p>
                                    
                                    <p>Thank you for considering my application. I look forward to hearing back from you.</p>
    
                                    <p>https://github.com/vickyyede28?tab=repositories</p>
                                    <p>Thank you<br>Ma'am/Sir,</p>
                                    <p>Regard's,<br>Vicky Yede,<br>Mobile no: 9310716417</p>
                                `;
            
                        let info = await transPorter.sendMail({
                            from: '"Vicky Yede" <vickyyede30@gmail.com>',
                            to: mail,
                            subject: "Application for the job of Frontend developer position.",
                            text:"This is mail by me",
                            html: body,
                            attachments:[
                                {
                                    filename:"vicky_resume.pdf",
                                    content:fs.createReadStream("./vicky_resume.pdf")
                                }
                            ],
                            priority:'high'            
                        });
        
                        AppliedMails.push(mail);
                        console.log(info);
                        mailCount ++
        
                    }else{
                        AppliedMails2.push(mail);
                    };
                };

            } catch (error) {
                console.log(error);
            };
        };
        if(!AppliedMails.length == 0){
            Save_Mails_In_Database(AppliedMails);
            console.log('Applied mails saved successfully in the database');
        }
        if(!AppliedMails2.length == 0){
            console.log('You have allready applied for the job on this mails => ',{ Count: AppliedMails2.length, AllreadyAppliedMails: AppliedMails2 });
        }
        console.log(mailCount," mail has been sent\n");
        console.log('I have applied for the job in company',await AppliedMailsCount(),'mails till now');

    }else{
        console.log('Please Enter the mail in array or in String');
    };
};
mailSender();