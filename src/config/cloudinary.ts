import { envConfig } from "./env";

import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

class Cloudinary {
  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: envConfig.cloud_name,
      api_key: envConfig.cloud_api_key,
      api_secret: envConfig.cloud_api_secret,
    });
  }

  public uploads(
    file: string,
    public_id?: string,
    overwrite?: boolean,
    invalidate?: boolean
  ): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
        file,
        {
          public_id,
          overwrite,
          invalidate,
          resource_type: "auto", // zip, images
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) resolve(error);
          resolve(result);
        }
      );
    });
  }

  public videoUpload(
    file: string,
    public_id?: string,
    overwrite?: boolean,
    invalidate?: boolean
  ): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise((resolve) => {
      cloudinary.v2.uploader.upload(
        file,
        {
          public_id,
          overwrite,
          invalidate,
          chunk_size: 50000,
          resource_type: "video",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) resolve(error);
          resolve(result);
        }
      );
    });
  }
}

export const cloudinaryConfig: Cloudinary = new Cloudinary();
