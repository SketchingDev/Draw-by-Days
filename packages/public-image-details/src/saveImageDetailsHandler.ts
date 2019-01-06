import { Context } from "aws-lambda";
import { ResultCallback } from "aws-types-lib";
import { model, Model } from "dynamoose";
import { IBasicImageDetails } from "messages-lib/lib";
import { basicImageDetailsToImageSchemaMap } from "./basicImageDetailsToImageSchemaMap";
import { IImage } from "./storage/image";
import { IImageModel } from "./storage/imageModel";
import { imageSchema } from "./storage/imageSchema";

// tslint:disable-next-line:no-var-requires
const objectMapper = require("object-mapper");

interface IDeps {
  imageRecord: IImageModel;
}
export const deps = {
  init: (): Promise<IDeps> =>
    Promise.resolve({
      imageRecord: model<IImage, void>(process.env.TABLE_NAME!, imageSchema),
    }),
};

const mapThenSaveImageDetails = (imageRecord: IImageModel, imageDetails: IBasicImageDetails) => {
  const mappedObject = objectMapper(imageDetails, basicImageDetailsToImageSchemaMap);
  return new imageRecord(mappedObject).save();
};

const successResult = (savedItem: Model<IImage>) => {
  const item = savedItem.originalItem() as IImage;
  return { result: "success", message: `Details saved for ${item.ImageId}` };
};

export const saveImageDetailsHandler = (imageDetails: IBasicImageDetails, context: Context, callback: ResultCallback) =>
  deps
    .init()
    .then(({ imageRecord }) => mapThenSaveImageDetails(imageRecord, imageDetails))
    .then(image => callback(null, successResult(image)), (err: any) => callback(err, undefined));