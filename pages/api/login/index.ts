import { NextApiRequest, NextApiResponse } from "next";
import { Login } from "../../../utils/sessions/login";
import { VerifyPassword } from "../../../utils/passwords";
import { FailedLoginAttempt } from "../../../utils/users/createFailedLogin";
import withLoginAbuse from "../../../middleware/withLoginAbuse";
import { GetPastOrFutureTime } from "../../../utils/time";

const Cookies = require("cookies");
const Keygrip = require("keygrip");
const { KEYGRIP_1, KEYGRIP_2 } = process.env;
const keys = new Keygrip([KEYGRIP_1, KEYGRIP_2]);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req;
  const { user_email, password } = body;

  // Attempt to log the user in
  if (method === "POST") {
    try {
      const password_match = await VerifyPassword(user_email, password);
      if (!password_match) {
        await FailedLoginAttempt(user_email);
        return res.status(400).json({ message: "Password is incorrect" });
      }
      try {
        const session = await Login(user_email);
        let cookies = new Cookies(req, res, { keys: keys });
        cookies.set("session_id", session, {
          signed: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production", // Set to true if site is live
          domain:
            process.env.NODE_ENV === "production" ? "plutomi.com" : undefined,
        });
        return res.status(200).json({ message: "Log in succesfull!" });
      } catch (error) {
        // TODO add error logger
        return res
          .status(400) // TODO change #
          .json({ message: `${error}` });
      }
    } catch (error) {
      return res.status(400).json({ message: `${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default withLoginAbuse(handler);