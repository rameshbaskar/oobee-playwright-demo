import { Page } from "@playwright/test";

let currentPage: Page;

export const init = async (page: Page) => {
  currentPage = page;
  await currentPage.goto("");
};

export const getCurrentPage = () => {
  return currentPage;
};
