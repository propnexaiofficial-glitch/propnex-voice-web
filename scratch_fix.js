const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const email = 'abdulrahman9june@gmail.com';
  const resumeUrl = 'https://drive.google.com/file/d/1nxQElN31IB_zTHm5a666rR_jZDZGmy1d/view?usp=sharing';

  console.log('Updating database for', email);
  const updated = await prisma.jobApplication.updateMany({
    where: { email: email },
    data: { resumeUrl: resumeUrl }
  });
  console.log('Updated records:', updated.count);

  if (updated.count > 0) {
    const app = await prisma.jobApplication.findFirst({ where: { email } });
    
    // Trigger the webhook to send the emails
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec';
    
    console.log('Sending webhook to Google Apps Script...');
    const payload = {
      type: 'job_application',
      jobId: app.jobId,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      countryCode: app.countryCode,
      phone: app.phone,
      experience: app.experience,
      expectedPayout: app.expectedPayout,
      currentPayout: app.currentPayout,
      sponsor: app.sponsor,
      legalStatus: app.legalStatus,
      citizenship: app.citizenship,
      gender: app.gender,
      agreedToTerms: app.agreedToTerms
    };

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log('Webhook response:', text);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
