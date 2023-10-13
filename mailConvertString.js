const HrMails = `
    manisha@expandimo.com
    dhara.gohel@Aimsinfosoft.com  
    shilpa.bharti@testingxperts.com
    deekshasaini@deftsoft.com
    hr@researchallied.com
    nitisha@dightinfotech.com
    hr@thefabcode.org
    ankita.hr.hi@gmail.com
    careers@perigeon.com
    rashmi@jobingujarat.com
    sagar.hr@dightinfotech.com
    shikhasharma@sourcemash.com
    careers@techstriker.com
    hr.nexever@gmail.com
    aayushik@blackbasil.tech
`;

const HrGmails = [
    "info@samvidsearch.com",
    "hr.visionvivante@gmail.com",
    "careeritcrossroads@gmail.com",
    "priti.chaudhary@lbmsolutions.in",
    "kalyani@unoiatech.com",
    "kanishka@annulartechnologies.com",
    "hr@zenidinfotech.com",
    "info@artechnolabs.com",
    "hr@knackroot.com",
    "bhoomi@sevensquaretech.com",
    "vishwa.vhits@gmail.com",
    "sunil.m@aarchik.com",
    "hr@sketchish.com",
    "info@exceleurservices.com",
    "hr@linearloop.io",
    "hr@arhamtechnosoft.com",
    "mittal@mobpair.com",
    "helly.innovius@gmail.com",
    "jalpa@thinktanker.in",
    "hello@kreyet.com",
    "buddy@rotonn.com",
    "hr@softrefine.com",
    "shivani@moontechnolabs.com",
    "unnati.pandya@bytestechnolab.com",
    "hrm@proexelancers.com",
    "srikconsulting08@gmail.com",
    "hr@aglowiditsolutions.com",
    "Hiring@competentemporio.com",
    "parul.gupta@dayhawk.in",
    "career@kiraintrilogy.com",
    "manishaaasmo7@gmail.com",
    "khyati.hires@gmail.com",
    "hr@liseinfotech.com",
    "renuka.p@extwebtech.in",
    "Prerna.luthra@antiersolution",
    "varsha.p@richestsoft.in",
    "prafful.walia@digimantra.com",
    "kirthika.m@sensiple.com",
    "jobs@techseria.com",
    "hr@innzes.com",
    "jobs@webtech-evolution.com",
    "hr@matlabinfotech.com",
    "hr@aktivsoftware.com",
    "Info@DeetyaAccountingCodes.com",
    "hr@nimblechapps.com",
    "miteshpandya@moneyphi.com",
    "purvish.pandya@bombaysoftwares.com",
    "parthiv.shah@kmkconsultinginc.com"
];

const mails = HrMails.split('\n').map(line => line.trim()).filter(line => line !== ''); 
var MailsHr;

if((mails.length > 1) && (!HrGmails.length == 0)){
    MailsHr = mails.concat(HrGmails)
}
else if(mails.length > 1){
    MailsHr = mails
}
else if(!HrGmails.length == 0){
    MailsHr = HrGmails
}

module.exports = { MailsHr };