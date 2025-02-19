import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { Entities, DEFAULTS, DYNAMO_TABLE_NAME } from '../../Config';

interface LeaveAndDeleteOrgInput {
  orgId: string;
  userId: string;
}

export const leaveAndDeleteOrg = async (
  props: LeaveAndDeleteOrgInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, userId } = props;

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with "new" org (default)
          Update: {
            Key: {
              PK: `${Entities.USER}#${userId}`,
              SK: Entities.USER,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK',
            ExpressionAttributeValues: {
              ':orgId': DEFAULTS.NO_ORG,
              ':orgJoinDate': DEFAULTS.NO_ORG,
              ':GSI1PK': DEFAULTS.NO_ORG,
            },
            ConditionExpression: 'attribute_exists(PK)',
          },
        },
        {
          // Delete the org - // TODO delete all children asynchronously
          Delete: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            ConditionExpression: 'attribute_exists(PK)',
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
