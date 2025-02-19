import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DynamoApplicant } from '../../types/dynamo';

export type DeleteApplicantInput = Pick<
  DynamoApplicant,
  'orgId' | 'applicantId' | 'openingId' | 'stageId' // Last two are needed to decrement the applicant count
>;

export const deleteApplicant = async (
  props: DeleteApplicantInput,
): Promise<[undefined, undefined] | [undefined, SdkError]> => {
  const { orgId, applicantId, openingId, stageId } = props;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the applicant
          Delete: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
              SK: Entities.APPLICANT,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          },
        },
        {
          // Decrement opening's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
          },
        },
        {
          // Decrement stage's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.STAGE}#${stageId}`,
              SK: Entities.STAGE,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
          },
        },
        {
          // Decrement the org's total applicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
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
