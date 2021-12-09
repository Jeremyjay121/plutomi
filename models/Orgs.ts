import {
  GetCommand,
  GetCommandInput,
  QueryCommandInput,
  QueryCommand,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "./../utils/time";
import { ENTITY_TYPES } from "../Config";
import { DynamoNewOrg, DynamoNewUser } from "../types/dynamo";
import {
  CreateAndJoinOrgInput,
  GetAllOpeningsInOrgInput,
  GetAllUsersInOrgInput,
  GetOrgInput,
} from "../types/main";

const { DYNAMO_TABLE_NAME } = process.env;

export const getOrgById = async (
  props: GetOrgInput
): Promise<[DynamoNewOrg, null] | [null, Error]> => {
  // TODO add these types all over the dynamo calls
  const { orgId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}`,
      SK: ENTITY_TYPES.ORG,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return [response.Item as DynamoNewOrg, null];
  } catch (error) {
    console.error("error", error);
    return [null, error];
  }
};

export const createAndJoinOrg = async (
  props: CreateAndJoinOrgInput
): Promise<void> => {
  const { userId, orgId, GSI1SK } = props;
  const now = Time.currentISO();

  const newOrg: DynamoNewOrg = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}`,
    SK: ENTITY_TYPES.ORG,
    orgId: orgId, // plutomi - Cannot be changed
    entityType: ENTITY_TYPES.ORG,
    createdAt: now,
    totalApplicants: 0,
    totalOpenings: 0,
    totalStages: 0,
    totalUsers: 1,
    GSI1PK: ENTITY_TYPES.ORG, // Allows for 'get all orgs' query
    // but cannot do get org by specific name as there might be duplicates
    GSI1SK: GSI1SK, // Actual org name ie: Plutomi Inc - Can be changed!
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Update user with the new org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.USER}#${userId}`,
              SK: ENTITY_TYPES.USER,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET orgId = :orgId, orgJoinDate = :orgJoinDate, GSI1PK = :GSI1PK",
            ExpressionAttributeValues: {
              ":orgId": orgId,
              ":orgJoinDate": now,
              ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.USER}S`,
            },
          },
        },
        {
          // Create the org
          Put: {
            Item: newOrg,
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_not_exists(PK)",
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));

    return;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getAllUsersInOrg = async (
  props: GetAllUsersInOrgInput
): Promise<DynamoNewUser[]> => {
  const { orgId, limit } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.USER}S`,
    },
    Limit: limit || null,
  }; // TODO query until all results are returned

  limit && (params.Limit = limit);

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return response.Items as DynamoNewUser[];
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllOpeningsInOrg = async (props: GetAllOpeningsInOrgInput) => {
  const { orgId } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    },
  };

  try {
    const response = await Dynamo.send(new QueryCommand(params));
    return [response.Items, null];
  } catch (error) {
    console.error("error", error);
    return [null, error];
  }
};
