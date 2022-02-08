import { Request, Response } from "express";
import * as CreateError from "../../utils/createError";
import * as Questions from "../../models/Questions";
import { DynamoQuestion } from "../../types/dynamo";
import Joi from "joi";
import { JOI_SETTINGS, LIMITS } from "../../Config";

export type APICreateQuestionOptions = Pick<
  DynamoQuestion,
  "questionId" | "GSI1SK" | "description"
>;
const schema = Joi.object({
  body: {
    questionId: Joi.string().max(50), // TODO joi regex to match tag generator
    GSI1SK: Joi.string().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
    description: Joi.string()
      .allow("")
      .max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH)
      .optional(),
  },
}).options(JOI_SETTINGS);

const main = async (req: Request, res: Response) => {
  const { session } = res.locals;
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { questionId, description, GSI1SK }: APICreateQuestionOptions =
    req.body;

  const [created, error] = await Questions.CreateQuestion({
    questionId,
    orgId: session.orgId,
    GSI1SK,
    description,
  });

  if (error) {
    if (error.name === "TransactionCanceledException") {
      return res
        .status(409)
        .json({ message: "A question already exists with this ID" });
    }

    const { status, body } = CreateError.SDK(
      error,
      "An error ocurred creating your question"
    );
    return res.status(status).json(body);
  }
  return res
    .status(201)
    .json({ message: "Question created!", question: created });
};
export default main;