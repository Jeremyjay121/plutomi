import { Request, Response } from 'express';
import DB from '../../models';
import * as CreateError from '../../utils/createError';

export const getQuestionsInStage = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId } = req.params;

  const [stage, stageError] = await DB.Stages.getStage({
    openingId,
    stageId,
    orgId: session.orgId,
  });

  if (stageError) {
    const { status, body } = CreateError.SDK(
      stageError,
      'An error ocurred retrieving your stage info',
    );
    return res.status(status).json(body);
  }
  if (!stage) {
    return res.status(404).json({ message: 'Stage not found' });
  }

  const { questionOrder } = stage;

  if (questionOrder.length === 0) {
    return res.status(200).json([]);
  }
  try {
    const results = await Promise.all(
      questionOrder.map(async (id: string) => {
        const [question, error] = await DB.Questions.getQuestion({
          orgId: session.orgId,
          questionId: id,
        });

        if (error) {
          console.error(error);
          throw new Error('An error ocurred retrieving the questions for this stage');
        }
        // TODO it is possible that a question was deleted so the question will return undefined
        return question;
      }),
    );

    const sortedQuestions = questionOrder.map((i: string) =>
      results.find((j) => j.questionId === i),
    );
    return res.status(200).json(sortedQuestions);
  } catch (error) {
    const { status, body } = CreateError.SDK(
      error,
      'An error ocurred retrieving the questions for this stage',
    );
    return res.status(status).json(body);
  }
};
