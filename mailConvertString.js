const HrMails = `
`;
const HrGmails = [
    
];
const mails = HrMails.split('\n').map(line => line.trim()).filter(line => line !== '');
var MailsHr;

if ((mails.length > 1) && (!HrGmails.length == 0)) {
    MailsHr = mails.concat(HrGmails)
}
else if (mails.length > 1) {
    MailsHr = mails
}
else if (!HrGmails.length == 0) {
    MailsHr = HrGmails
}
module.exports = { MailsHr };