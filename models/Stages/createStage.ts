import { nanoid } from 'nanoid';
import { SdkError } from '@aws-sdk/types';
import { TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import getNewChildItemOrder from '../../utils/getNewChildItemOrder';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, LIMITS, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoStage } from '../../types/dynamo';
import * as Time from '../../utils/time';

export interface CreateStageInput extends Pick<DynamoStage, 'orgId' | 'GSI1SK' | 'openingId'> {
  /**
   * Optional position on where to place the new opening, optional. Added to the end if not provided
   */
  position?: number;
  // To figure out where to place it
  stageOrder: string[];
}

export const createStage = async (
  props: CreateStageInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, GSI1SK, openingId, position, stageOrder } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const newStage: DynamoStage = {
    PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    SK: Entities.STAGE,
    entityType: Entities.STAGE,
    createdAt: Time.currentISO(),
    stageId,
    questionOrder: [],
    orgId,
    totalApplicants: 0,
    totalQuestions: 0,
    openingId,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}S`, // Get all stages in an opening
    GSI1SK,
  };

  const newStageOrder = getNewChildItemOrder(stageId, stageOrder, position);

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add the new stage
          Put: {
            Item: newStage,
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          // Increment stage count on the opening and update the newStageOrder
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'totalStages < :maxChildItemLimit AND attribute_exists(PK)',
            UpdateExpression:
              'SET totalStages = if_not_exists(totalStages, :zero) + :value, stageOrder = :stageOrder',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
              ':stageOrder': newStageOrder,
              ':maxChildItemLimit': LIMITS.MAX_CHILD_ITEM_LIMIT,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [undefined, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
