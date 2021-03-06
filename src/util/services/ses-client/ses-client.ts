import env from "dotenv";
env.config();
import AWS from "aws-sdk";
import { AWS_CONFIG as configurations } from "../../../aws-config"; // load configurations file
const config = configurations(
  process.env.IAM_ACCESS_KEY,
  process.env.IAM_ACCESS_SECRET
);
AWS.config.update({
  accessKeyId: config.aws.key,
  secretAccessKey: config.aws.secret,
  region: config.aws.ses.region,
});

const ses = new AWS.SES();

const sendEmail = (to, subject, message, from) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: message,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    ReturnPath: from ? from : config.aws.ses.from.default,
    Source: from ? from : config.aws.ses.from.default,
  };

  ses.sendEmail(params, (err, data) => {
    if (err) {
      return console.log(err, err.stack);
    } else {
      console.log("Email sent.", data);
    }
  });
};

export { sendEmail };
