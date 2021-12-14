import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetAllQuestionsInStageInput,
  GetAllQuestionsInStageOutput,
} from "../../types/main";
import getStageById from "./getStageById";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function GetQuestions(
  props: GetAllQuestionsInStageInput
): Promise<GetAllQuestionsInStageOutput> {
  const { orgId, stageId } = props;
  // TODO this shouldn't be here!!
  const stage = await getStageById({ orgId, stageId });
  const { questionOrder } = stage;

  const params: QueryCommandInput = {
    IndexName: "GSI1",
    TableName: DYNAMO_TABLE_NAME,
    KeyConditionExpression: "GSI1PK = :GSI1PK",
    ExpressionAttributeValues: {
      ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}#QUESTIONS`, // NOT STAGE_QUESTIONS, just QUESTIONS
    },
  };

  try {
    const allQuestions = await Dynamo.send(new QueryCommand(params));

    // Sort questions in the same order of the stage before sending it back
    const result = questionOrder.map((i) =>
      allQuestions.Items.find((j) => j.questionId === i)
    );

    return result as GetAllQuestionsInStageOutput;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}