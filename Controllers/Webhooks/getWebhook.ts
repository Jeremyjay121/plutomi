import { Request, Response } from 'express';
import Joi from 'joi';
import { JOI_SETTINGS } from '../../Config';
import DB from '../../models';
import * as CreateError from '../../utils/createError';

const schema = Joi.object({
  params: {
    webhookId: Joi.string(),
  },
}).options(JOI_SETTINGS);

export const getWebhook = async (req: Request, res: Response) => {
  try {
    await schema.validateAsync(req);
  } catch (error) {
    const { status, body } = CreateError.JOI(error);
    return res.status(status).json(body);
  }
  const { session } = res.locals;
  const { webhookId } = req.params;

  const [webhook, error] = await DB.Webhooks.getWebhook({
    orgId: session.orgId,
    webhookId,
  });

  if (error) {
    const { status, body } = CreateError.SDK(error, 'An error ocurred retrieving your webhook');

    return res.status(status).json(body);
  }
  if (!webhook) {
    return res.status(404).json({ message: 'Webhook not found' });
  }

  return res.status(200).json(webhook);
};
