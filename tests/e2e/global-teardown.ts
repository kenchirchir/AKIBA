import { removeTestData } from "./test-data";

export default async function globalTeardown() {
  await removeTestData();
}
