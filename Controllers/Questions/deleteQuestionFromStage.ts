import { Request, Response } from 'express';
import DB from '../../models';

import * as CreateError from '../../utils/createError';

export const deleteQuestionFromStage = async (req: Request, res: Response) => {
  const { session } = res.locals;
  const { openingId, stageId, questionId } = req.params;
  const [stage, error] = await DB.Stages.getStage({
    openingId,
    stageId,
    orgId: session.orgId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(
      error,
      'An error ocurred deleting that question from this stage',
    );
    return res.status(status).json(body);
  }

  if (!stage) {
    return res.status(400).json({ message: 'Stage not found' });
  }

  // TODO add a test for this
  if (!stage.questionOrder.includes(questionId)) {
    return res.status(400).json({
      message: `The question ID '${questionId}' does not exist in this stage`,
    });
  }

  // Remove that question
  const [updated, updateError] = await DB.Questions.deleteQuestionFromStage({
    openingId,
    stageId,
    questionId,
    orgId: session.orgId,
    deleteIndex: stage.questionOrder.indexOf(questionId),
    decrementStageCount: true,
  });

  if (updateError) {
    const { status, body } = CreateError.SDK(
      updateError,
      'An error ocurred deleting that question',
    );
    return res.status(status).json(body);
  }

  return res.status(200).json({ message: 'Question removed from stage!' });
};
