// All public openings for the org
import withCleanOrgId from "../../../../../../middleware/withCleanOrgId";
import { NextApiRequest, NextApiResponse } from "next";
import { getAllOpeningsInOrg } from "../../../../../../utils/openings/getAllOpeningsInOrg";
import { API_METHODS, ENTITY_TYPES } from "../../../../../../defaults";
import withValidMethod from "../../../../../../middleware/withValidMethod";
import { CUSTOM_QUERY } from "../../../../../../types/main";
import clean from "../../../../../../utils/clean";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  const { orgId } = query as Pick<CUSTOM_QUERY, "orgId">;

  if (method === API_METHODS.GET) {
    try {
      const allOpenings = await getAllOpeningsInOrg({ orgId });
      const publicOpenings = allOpenings.filter((opening) => opening.isPublic);

      publicOpenings.forEach((opening) => clean(opening, ENTITY_TYPES.OPENING));

      return res.status(200).json(publicOpenings);
    } catch (error) {
      // TODO add error logger
      return res
        .status(400) // TODO change #
        .json({ message: `Unable to retrieve org: ${error}` });
    }
  }
};

export default withCleanOrgId(withValidMethod(handler, [API_METHODS.GET]));