const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Mails').then(() => {
    console.log('Database Connected Successfully...\n');
}).catch((err) => {
    console.log(err.message);
});
const MailsSchema = new mongoose.Schema({
    Count: Number,
    HrEmails: [{
        type: String,
        unique: true,
    }],
});
const Mails = mongoose.model('hrmails', MailsSchema);
const getAllhrMails = async () => {
    const allhrMails = await Mails.find();
    return allhrMails;
};
const Save_Mails_In_Database = async (hrMails) => {
    const mailDocuments = await Mails.find({ Count: { $lt: 50 } });
    if (mailDocuments.length > 0) {
        for (const mailDocument of mailDocuments) {
            var availableSpace = 50 - mailDocument.Count;
            for (let i = 0; i < Math.min(availableSpace, hrMails.length); i++) {
                const newEmail = hrMails[i];
                try {
                    mailDocument.HrEmails.push(newEmail);
                    mailDocument.Count++;
                } catch (error) {
                    if (error.name === 'MongoError' && error.code === 11000) {
                        console.log(`Duplicate entry error: Email ${newEmail} already exists in the array.`);
                    } else {
                        throw error;
                    };
                };
            };
            await mailDocument.save();
            hrMails.splice(0, Math.min(hrMails.length, mailDocuments.length * availableSpace));
        };
        if (hrMails.length > 0) {
            Save_Mails_In_Db(hrMails);
        };
    } else {
        if (hrMails.length > 0) {
            Save_Mails_In_Db(hrMails);
        };
    };
    async function Save_Mails_In_Db(hrMails) {
        const groupSize = 50;

        for (let i = 0; i < hrMails.length; i += groupSize) {
            var group = hrMails.slice(i, i + groupSize);

            const MailsDocument = new Mails({
                Count: group.length,
                HrEmails: group,
            });
            await MailsDocument.save();
        };
    };
};
const AppliedMailsCount = async () => {

    let All_Applied_Mails = [];
    const GmaileData2 = await getAllhrMails();

    for (let gmail of GmaileData2) {
        gmail.HrEmails.forEach((Email) => {
            All_Applied_Mails.push(Email);
        });
    };
    return All_Applied_Mails.length;
};

module.exports = { getAllhrMails, Save_Mails_In_Database, AppliedMailsCount };
