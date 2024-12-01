import { Response } from "express";

type Tresponse<T> = {
  status: number;
  success: boolean;
  message: string;
  data: T;
};

const sendResponse = <T>(res: Response, data: Tresponse<T>) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;
