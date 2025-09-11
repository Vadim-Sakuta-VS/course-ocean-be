import nodemailer from 'nodemailer';

(async () => {
  try {
    const account = await nodemailer.createTestAccount();
    console.log(`User: ${account.user}`);
    console.log('Add this to your .env file as ETHEREAL_EMAIL');
    console.log(`Password: ${account.pass}`);
    console.log('Add this to your .env file as ETHEREAL_PASSWORD');
    console.log(
      'Ethereal automatically deletes an account after 48 hours of inactivity!!!',
    );
  } catch (error) {
    return console.error(`Failed to create a testing account. ${error}`);
  }
})();
