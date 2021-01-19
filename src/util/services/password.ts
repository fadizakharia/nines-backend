import hasher from "bcryptjs";
const toHash = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await new Promise<string>((resolve, reject) => {
    hasher.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
  return hashedPassword;
};
const compareHash = async (currentPassword, password) => {
  const result = await hasher.compare(currentPassword, password);
  return result;
};
export { toHash, compareHash };
