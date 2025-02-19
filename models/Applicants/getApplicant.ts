import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { GetApplicantByIdOutput } from '../../types/main';
import { DynamoApplicant, DynamoApplicantResponse } from '../../types/dynamo';

export type GetApplicantInput = Pick<DynamoApplicant, 'orgId' | 'applicantId'>;
export interface DynamoApplicantWithResponses extends DynamoApplicant {
  responses: DynamoApplicantResponse[];
}

export const getApplicant = async (
  props: GetApplicantInput,
): Promise<[DynamoApplicantWithResponses, undefined] | [undefined, SdkError]> => {
  const { orgId, applicantId } = props;
  const responsesParams: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(new QueryCommand(responsesParams));

    if (allApplicantInfo.Count === 0) {
      throw new Error('Applicant not found');
    }

    if (allApplicantInfo?.Items?.length === 0) {
      throw new Error('Applicant not found');
    }

    const grouped = _.groupBy(allApplicantInfo.Items, 'entityType');

    const metadata = grouped.APPLICANT[0] as DynamoApplicant;
    const responses = grouped.APPLICANT_RESPONSE;

    // TODO files
    const applicant: GetApplicantByIdOutput = {
      ...metadata,
      responses, // TODO rework responses
      // TODO files
    };
    // TODO types
    return [applicant as DynamoApplicantWithResponses, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
