import { fetchFromR2 } from "../storage/cloudflare.js";

export const getFiles = async (req, res) => {
  try {
    const { key } = req.query;

    const result = await fetchFromR2(key);

    if (!result.Body) {
      return res.badRequest({ status: 400, message: "File not found" });
    }

    // Set headers so browser understands it's a file/blob
    res.setHeader(
      "Content-Type",
      result.ContentType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(key)}"`
    );

    // ✅ Stream file directly to response (efficient for large files)
    result.Body.pipe(res);
  } catch (err) {
    console.error("Error fetching file from R2:", err);
    res.failureResponse();
  }
};
