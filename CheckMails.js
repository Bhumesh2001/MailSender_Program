const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Mails').then(()=>{
    console.log('Database Connected Successfully...\n');
}).catch((err)=>{
    console.log(err.message);
})

const MailsSchema = new mongoose.Schema({
    Count:Number,
    HrEmails:[String]
});

const Mails = mongoose.model('hrMails',MailsSchema);

const getAllhrMails = async()=>{
    const allhrMails = await Mails.find();
    return allhrMails;
};

const Save_Mails_In_Database = async(hrMails)=>{

    const groupSize = 50;
    
    for (let i = 0; i < hrMails.length; i += groupSize) {
        var group = hrMails.slice(i, i + groupSize);

        const MailsDocument = new Mails({
            Count:group.length,
            HrEmails:group
        });
        await MailsDocument.save();
    };
};

const AppliedMailsCount = async()=>{

    let All_Applied_Mails = [];
    const GmaileData2 = await getAllhrMails();

    for(let gmail of GmaileData2){
        gmail.HrEmails.forEach((Email)=>{
            All_Applied_Mails.push(Email);
        });
    };
    return All_Applied_Mails.length;
};

module.exports = { getAllhrMails, Save_Mails_In_Database, AppliedMailsCount };