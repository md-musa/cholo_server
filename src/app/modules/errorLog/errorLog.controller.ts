import { IGenericErrorMessage } from "../../../interfaces/error";
import { ErrorLogModel } from "./errorLog.model";

interface ILogErrorOptions {
  message: string;
  statusCode?: number;
  errorMessages?: IGenericErrorMessage[];
  stack?: string;
  method?: string;
  url?: string;
}

export const logErrorToDatabase = async (options: ILogErrorOptions) => {
  // console.log(options);
  try {
    await ErrorLogModel.create({
      message: options.message,
      statusCode: options.statusCode || 500,
      errorMessages: options.errorMessages || [],
      stack: options.stack,
      method: options.method,
      url: options.url,
    });
  } catch (err) {
    console.error("❌ Failed to log error to MongoDB:", err);
  }
};

export const ErrorLogController = {
  logErrorToDatabase,
};
