import { TChatMessage } from "../../util/openRouterClient";

export type TGenerateDescriptionPayload = {
  name: string;
  categoryId: string;
  keywords?: string;
  price?: number;
};

export type TGenerateDescriptionResult = {
  title: string;
  description: string;
};

export type TChatPayload = {
  message: string;
  history?: TChatMessage[];
};

export type TChatResult = {
  reply: string;
  productIds: string[];
};

export type TSmartSearchFilter = {
  searchTerm?: string;
  categoryId?: string;
  priceRange?: number;
};
