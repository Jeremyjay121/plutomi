import { Request, Response } from "express";
import Joi from "joi";
import { DEFAULTS } from "../Config";
import { UpdateStageInput } from "../types/main";
import { getAllQuestionsInStage } from "../utils/questions/getAllQuestionsInStage";
import { createStage } from "../utils/stages/createStage";
import * as Stage from "../utils/stages/deleteStage";
import { getAllApplicantsInStage } from "../utils/stages/getAllApplicantsInStage";
import { getStageById } from "../utils/stages/getStageById";
import updateStage from "../utils/stages/updateStage";

export const create = async (req: Request, res: Response) => {
  const { GSI1SK, openingId } = req.body;

  if (req.session.user.orgId === DEFAULTS.NO_ORG) {
    return res.status(403).json({
      message: "Please create an organization before creating a stage",
    });
  }
  const createStageInput = {
    orgId: req.session.user.orgId,
    openingId: openingId,
    GSI1SK: GSI1SK,
  };

  const schema = Joi.object({
    orgId: Joi.string(),
    openingId: Joi.string(),
    GSI1SK: Joi.string(),
  }).options({ presence: "required" }); // TODo add actual inputs of new question values

  // Validate input
  try {
    await schema.validateAsync(createStageInput);
  } catch (error) {
    return res.status(400).json({ message: `${error.message}` });
  }

  try {
    await createStage(createStageInput);
    return res.status(201).json({ message: "Stage created" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to create stage: ${error}` });
  }
};

export const deleteStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  try {
    const deleteStageInput = {
      orgId: req.session.user.orgId,
      stageId: stageId,
    };

    await Stage.deleteStage(deleteStageInput); // TODO fix this as its not grouped with the other funnels

    return res.status(200).json({ message: "Stage deleted!" });
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to delete your stage: ${error}` });
  }
};

export const getStageInfo = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const getStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
  };

  try {
    const stage = await getStageById(getStageInput);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    return res.status(200).json(stage);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve stage: ${error}` });
  }
};

export const update = async (req: Request, res: Response) => {
  const { newStageValues } = req.body;
  const { stageId } = req.params;
  try {
    const updateStageInput: UpdateStageInput = {
      orgId: req.session.user.orgId,
      stageId: stageId,
      newStageValues: newStageValues,
    };

    const schema = Joi.object({
      orgId: Joi.string(),
      stageId: Joi.string(),
      newStageValues: Joi.object(), // TODo add actual inputs of new stage values
    }).options({ presence: "required" });

    // Validate input
    try {
      await schema.validateAsync(updateStageInput);
    } catch (error) {
      return res.status(400).json({ message: `${error.message}` });
    }

    await updateStage(updateStageInput);
    return res.status(200).json({ message: "Stage updated!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to update stage - ${error}` });
  }
};

export const getApplicantsInStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  const getAllApplicantsInStageInput = {
    orgId: req.session.user.orgId,
    stageId: stageId,
  };

  try {
    const allApplicants = await getAllApplicantsInStage(
      getAllApplicantsInStageInput
    );
    return res.status(200).json(allApplicants);
  } catch (error) {
    // TODO add error logger
    return res
      .status(400) // TODO change #
      .json({ message: `Unable to retrieve applicants: ${error}` });
  }
};

export const getQuestionsInStage = async (req: Request, res: Response) => {
  const { stageId } = req.params;
  try {
    const questions = await getAllQuestionsInStage({
      orgId: req.session.user.orgId,
      stageId,
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve questions" });
  }
};
