import { Request, Response } from 'express';
import Joi from 'joi';
import * as CreateError from '../../utils/createError';
import { JOI_GLOBAL_FORBIDDEN, JOI_SETTINGS, LIMITS } from '../../Config';
import { DynamoQuestion } from '../../types/dynamo';
import DB from '../../models';

export interface APIUpdateQuestionOptions
  extends Partial<Pick<DynamoQuestion, 'GSI1SK' | 'description'>> {
  [key: string]: any;
}

const JOI_FORBIDDEN_OPENING = Joi.object({
  ...JOI_GLOBAL_FORBIDDEN,
  questionId: Joi.any().forbidden(),
  GSI1PK: Joi.any().forbidden(),
  GSI1SK: Joi.string().optional().max(LIMITS.MAX_QUESTION_TITLE_LENGTH),
  description: Joi.string().allow('').max(LIMITS.MAX_QUESTION_DESCRIPTION_LENGTH).optional(),
});

const schema = Joi.object({
  body: JOI_FORBIDDEN_OPENING,
}).options(JOI_SETTINGS);

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }

  const { session } = res.locals;
  const { questionId } = req.params;

  const [question, questionError] = await DB.Questions.updateQuestion({
    orgId: session.orgId,
    questionId,
    newValues: req.body,
  });

  if (questionError) {
    const { status, body } = CreateError.SDK(
      questionError,
      'An error ocurred updating this question',
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({
    message: 'Question updated!',
  });
};
