import User from "../models/User.js";

export const sendEmail = async (
  candidateId,
  jobRole,
  jobDescription,
  company,
  mode,
  durationMinutes,
  expiresAt
) => {
    try {

        if(!process.env.MAIL_URL){
            console.log("No email found in environment");
            throw new Error("No Email Service URL found");
        }
            
        
        console.log("Sending Mail to candidate")

        const candidate = await User.findById(candidateId);

        if (!candidate) {
            throw new Error("Candidate not found");
        }

        const toEmail = candidate.email;
        const subject = `Interview Invitation - ${jobRole} | ${company}`;

        const candidateName = candidate.name || "Candidate";

        const emailContent = `
<p>Dear ${candidateName},</p>

<p>Greetings from <b>${company}</b>.</p>

<p>
We are pleased to inform you that you have been assigned for the interview process.
</p>

<p><b>Interview Details:</b></p>

<p>
<b>Company Name:</b> ${company}<br>
<b>Job Role:</b> ${jobRole}<br>
<b>Interview Mode:</b> ${mode}<br>
<b>Duration:</b> ${durationMinutes} minutes<br>
<b>Expiry Time:</b> ${expiresAt}
</p>

<p><b>Job Description:</b><br>
${jobDescription}
</p>

<p>Please complete your interview before the expiry time.</p>

<p><b>Make sure you have:</b></p>

<ul>
  <li>Stable internet connection</li>
  <li>Quiet environment</li>
  <li>Enough uninterrupted time</li>
</ul>

<p>We wish you all the best.</p>

<p>
Best regards,<br>
<b>${company} Recruitment Team</b>
</p>
`;

        const response = await fetch(
            process.env.MAIL_URL,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                to: toEmail,
                subject: subject,
                body: emailContent,
                }),
            }
        );


        const data = await response.json();

        console.log("Email service response:", data);

        return true;

    } catch (error) {
        console.log(error)
    }

}


export const sendBatchMails = async (recipients) => {
    console.log("recipients", recipients)
    try {
        const response = await fetch(
            process.env.MAIL_URL_BATCH,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(recipients),
            }
        );


        const data = await response.json();

        console.log("Email service response:", data);

        return true;
    } catch (error) {
        console.log("Error senging bulk emails " + error)
        return false;
    }
}