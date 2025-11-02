import CatalogTemplateModel from "../model/catalogTemplate.model.js";
import { fetchDecodedToken } from "../middleware/tokenValidator.js";

// Get all templates (base templates + user templates if userId provided)
export const getAllTemplates = async (req, res) => {
  try {
    let userId = null;
    try {
      const decoded = fetchDecodedToken(req);
      userId = decoded?.userId || decoded?.id || null;
    } catch (error) {
      // No token - only return base templates
    }

    const query = {};
    
    // If user is authenticated, return base templates + their templates
    if (userId) {
      query.$or = [
        { isBaseTemplate: true },
        { userId: userId },
      ];
    } else {
      // If not authenticated, only return base templates
      query.isBaseTemplate = true;
    }

    const templates = await CatalogTemplateModel.find(query).sort({
      isBaseTemplate: -1, // Base templates first
      createdAt: -1, // Then newest first
    });

    res.ok({
      status: 200,
      data: templates,
      message: "Catalog templates fetched successfully",
      count: templates.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.failureResponse({ message: "Failed to fetch templates" });
  }
};

// Get single template by templateId
export const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await CatalogTemplateModel.findOne({ templateId });

    if (!template) {
      return res.badRequest({ message: "Template not found" });
    }

    // Check if user has access (base template or user's template)
    let userId = null;
    try {
      const decoded = fetchDecodedToken(req);
      userId = decoded?.userId || decoded?.id || null;
    } catch (error) {
      // No token
    }

    // If it's not a base template, check if it belongs to the user
    if (!template.isBaseTemplate && template.userId) {
      if (!userId || template.userId.toString() !== userId.toString()) {
        return res.accessForbidden({
          message: "You don't have access to this template",
        });
      }
    }

    res.ok({
      status: 200,
      data: template,
      message: "Template fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.failureResponse({ message: "Failed to fetch template" });
  }
};

// Create new template (user template)
export const createTemplate = async (req, res) => {
  try {
    const decoded = fetchDecodedToken(req);
    const userId = decoded?.userId || decoded?.id;

    if (!userId) {
      return res.unAuthorizedRequest({ message: "Authentication required" });
    }

    const { templateId, name, description, fontFamily, pages, previewImage } =
      req.body;

    // Generate unique templateId if not provided
    let finalTemplateId = templateId;
    if (!finalTemplateId) {
      finalTemplateId = `template-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`;
    }

    // Check if templateId already exists
    const existing = await CatalogTemplateModel.findOne({
      templateId: finalTemplateId,
    });
    if (existing) {
      return res.badRequest({
        message: "Template ID already exists. Please use a different ID.",
      });
    }

    const newTemplate = new CatalogTemplateModel({
      templateId: finalTemplateId,
      name: name || "Untitled Template",
      description: description || "",
      fontFamily: fontFamily || "Inter",
      pages: pages || [],
      previewImage,
      userId,
      isBaseTemplate: false,
    });

    await newTemplate.save();

    res.ok({
      status: 201,
      data: newTemplate,
      message: "Template created successfully",
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.failureResponse({
      message: error.message || "Failed to create template",
    });
  }
};

// Update template (only user's templates)
export const updateTemplate = async (req, res) => {
  try {
    const decoded = fetchDecodedToken(req);
    const userId = decoded?.userId || decoded?.id;

    if (!userId) {
      return res.unAuthorizedRequest({ message: "Authentication required" });
    }

    const { templateId } = req.params;
    const { name, description, fontFamily, pages, previewImage } = req.body;

    const template = await CatalogTemplateModel.findOne({ templateId });

    if (!template) {
      return res.badRequest({ message: "Template not found" });
    }

    // Check if it's a base template (cannot be updated)
    if (template.isBaseTemplate) {
      return res.badRequest({
        message: "Base templates cannot be updated",
      });
    }

    // Check if template belongs to user
    if (template.userId?.toString() !== userId.toString()) {
      return res.accessForbidden({
        message: "You don't have permission to update this template",
      });
    }

    // Update fields
    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (fontFamily !== undefined) template.fontFamily = fontFamily;
    if (pages !== undefined) template.pages = pages;
    if (previewImage !== undefined) template.previewImage = previewImage;
    template.updatedAt = new Date();

    await template.save();

    res.ok({
      status: 200,
      data: template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.failureResponse({
      message: error.message || "Failed to update template",
    });
  }
};

// Duplicate template
export const duplicateTemplate = async (req, res) => {
  try {
    const decoded = fetchDecodedToken(req);
    const userId = decoded?.userId || decoded?.id;

    if (!userId) {
      return res.unAuthorizedRequest({ message: "Authentication required" });
    }

    const { templateId } = req.params;

    const originalTemplate = await CatalogTemplateModel.findOne({ templateId });

    if (!originalTemplate) {
      return res.badRequest({ message: "Template not found" });
    }

    // Generate new unique templateId
    const newTemplateId = `template-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Create duplicate
    const duplicatedTemplate = new CatalogTemplateModel({
      templateId: newTemplateId,
      name: `${originalTemplate.name} Copy`,
      description: originalTemplate.description,
      fontFamily: originalTemplate.fontFamily,
      pages: originalTemplate.pages,
      previewImage: originalTemplate.previewImage,
      userId,
      isBaseTemplate: false,
    });

    await duplicatedTemplate.save();

    res.ok({
      status: 201,
      data: duplicatedTemplate,
      message: "Template duplicated successfully",
    });
  } catch (error) {
    console.error("Error duplicating template:", error);
    res.failureResponse({
      message: error.message || "Failed to duplicate template",
    });
  }
};

// Delete template (only user's templates)
export const deleteTemplate = async (req, res) => {
  try {
    const decoded = fetchDecodedToken(req);
    const userId = decoded?.userId || decoded?.id;

    if (!userId) {
      return res.unAuthorizedRequest({ message: "Authentication required" });
    }

    const { templateId } = req.params;

    const template = await CatalogTemplateModel.findOne({ templateId });

    if (!template) {
      return res.badRequest({ message: "Template not found" });
    }

    // Check if it's a base template (cannot be deleted)
    if (template.isBaseTemplate) {
      return res.badRequest({
        message: "Base templates cannot be deleted",
      });
    }

    // Check if template belongs to user
    if (template.userId?.toString() !== userId.toString()) {
      return res.accessForbidden({
        message: "You don't have permission to delete this template",
      });
    }

    await CatalogTemplateModel.deleteOne({ templateId });

    res.ok({
      status: 200,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.failureResponse({
      message: error.message || "Failed to delete template",
    });
  }
};

