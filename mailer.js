import sendgrid from '@sendgrid/mail';
const SEND_GRID_API_KEY =
  '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';

sg = sendgrid.SendGridAPIClient(SEND_GRID_API_KEY);

export const sendVerificationEmail = () => {
  const data = {
    personalizations: [
      {
        to: [
          {
            email: 'usheddy07@gmail.com',
          },
        ],
        subject: 'Hello World from the facebook clone!',
      },
    ],
    from: {
      email: 'akinrefonsheddy07@gmail.com',
    },
    content: [
      {
        type: 'text/plain',
        value: 'Hello, Email!',
      },
    ],
  };

  sg.client.mail.send.post((request_body = data));
};

sendVerificationEmail();
