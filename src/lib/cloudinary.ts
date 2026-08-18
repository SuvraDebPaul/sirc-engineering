import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file straight from a Server Action.
 *
 * Takes the `File` a form submits, not a client-side upload widget — the
 * Server Action already has the request, so uploading from there keeps the
 * whole write in one place instead of trusting a URL the browser hands back
 * from a separate signed upload.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, { folder });
  return result.secure_url;
}
