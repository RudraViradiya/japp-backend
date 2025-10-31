import AiShootTemplateModel from "../model/aiShootTemplate.model.js";

export const getAllAiShootTemplates = async (req, res) => {
  try {
    const templates = await AiShootTemplateModel.find({});
    res.ok({
      status: 200,
      data: templates,
      message: "Ai Shoot Templates fetched successfully",
      count: templates.length,
    });
  } catch (error) {
    res.failureResponse();
  }
};
