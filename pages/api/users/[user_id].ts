import { NextApiRequest, NextApiResponse } from "next";
import { GetUser } from "../../../utils/users/getUser";
import { Clean } from "../../../utils/clean";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { user_id } = query;

  if (method === "GET") {
    try {
      const user = await GetUser(user_id as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      Clean(user);
      return res.status(200).json(user);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to create user: ${error}` });
    }
  }

  return res.status(405).json({ message: "Not Allowed" });
};

export default handler;