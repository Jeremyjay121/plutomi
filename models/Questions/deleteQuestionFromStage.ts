import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoStage } from '../../types/dynamo';

interface DeleteQuestionFromStageInput
  extends Pick<DynamoStage, 'orgId' | 'openingId' | 'stageId'> {
  questionId: string;
  deleteIndex: number; // TODO check if this type is broken
  /**
   * When removing a question from a stage, we want to decrement the stage count on the question.
   * This isn't needed if the question is deleted obviously, and is used in the deletion state machine.
   * which should only be deleting the adjacent item.
   * Set it to FALSE if the question has been deleted form the org.
   */
  decrementStageCount: boolean;
}

export const deleteQuestionFromStage = async (
  props: DeleteQuestionFromStageInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, openingId, stageId, questionId, deleteIndex, decrementStageCount } = props;

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete the adjacent item
        Delete: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}#${Entities.STAGE}S`,
            SK: `${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_exists(PK)',
        },
      },
      {
        // Update the question order on the stage and decrement the total question count
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
            SK: Entities.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: `REMOVE questionOrder[${deleteIndex}] SET totalQuestions = totalQuestions - :value`,
          ExpressionAttributeValues: {
            ':value': 1,
          },
        },
      },
    ],
  };

  if (decrementStageCount) {
    transactParams.TransactItems.push({
      Update: {
        Key: {
          PK: `${Entities.ORG}#${orgId}#${Entities.QUESTION}#${questionId}`,
          SK: Entities.QUESTION,
        },
        TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        UpdateExpression: 'SET totalStages = totalStages - :value',
        ExpressionAttributeValues: {
          ':value': 1,
        },
      },
    });
  }

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [undefined, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
