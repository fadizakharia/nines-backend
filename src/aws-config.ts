const AWS_CONFIG = {
  aws: {
    key: process.env.IAM_ACCESS_KEY,
    secret: process.env.IAM_ACCESS_SECRET,
    ses: {
      from: {
        default: "fadi.zakharia@icloud.com",
      },
      region: "us-east-1",
    },
  },
};
export { AWS_CONFIG };
