import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, OpeningState, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoOpening } from '../../types/dynamo';
import * as Time from '../../utils/time';

type CreateOpeningInput = Pick<DynamoOpening, 'orgId' | 'openingName'>;

export const createOpening = async (
  props: CreateOpeningInput,
): Promise<[DynamoOpening, undefined] | [undefined, SdkError]> => {
  const { orgId, openingName } = props;
  const openingId = nanoid(ID_LENGTHS.OPENING);
  const newOpening: DynamoOpening = {
    PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
    SK: Entities.OPENING,
    entityType: Entities.OPENING,
    createdAt: Time.currentISO(),
    orgId,
    openingId,
    openingName,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}S`,
    GSI1SK: OpeningState.PRIVATE, // All openings are private by default
    totalStages: 0,
    stageOrder: [],
    totalApplicants: 0,
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: newOpening,
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `${Entities.ORG}#${orgId}`,
            SK: Entities.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: 'SET totalOpenings = if_not_exists(totalOpenings, :zero) + :value',
          ExpressionAttributeValues: {
            ':zero': 0,
            ':value': 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newOpening, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
