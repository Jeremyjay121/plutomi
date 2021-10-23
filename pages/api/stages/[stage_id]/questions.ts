import { NextApiResponse } from "next";
import { GetAllQuestionsInStage } from "../../../../utils/questions/getAllQuestionsInStage";
import withCleanOrgName from "../../../../middleware/withCleanOrgName";
import withSession from "../../../../middleware/withSession";

const handler = async (
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> => {
  const user = req.session.get("user");
  if (!user) {
    req.session.destroy();
    return res.status(401).json({ message: "Please sign in again" });
  }
  const { method, query } = req;
  const { stage_id } = query as CustomQuery;

  if (method === "GET") {
    try {
      const questions = await GetAllQuestionsInStage({
        org_id: user.org_id,
        stage_id,
      });

      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Unable to retrieve questions" });
    }
  }
  return res.status(405).json({ message: "Not Allowed" });
};

export default withSession(withCleanOrgName(handler));