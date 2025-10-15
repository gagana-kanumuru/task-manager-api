import Joi from "joi";
export const taskCreateSchema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow(""),
});
export const taskUpdateSchema = Joi.object({
    title: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow(""),
    completed: Joi.boolean(),
});
