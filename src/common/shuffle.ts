import { randomIntFromInterval } from "./timer";

const SHUFFLE_COUNT = 5_000;

export const shuffleList = (
  list: string[],
  count = SHUFFLE_COUNT
): string[] => {
  const size = list.length;
  if (!size || size === 1) {
    return [...list];
  }

  return Array.from(Array(count).keys()).reduce<string[]>((res) => {
    const newList = [...res];

    const oldInd = randomIntFromInterval(0, size - 1);
    const newInd = randomIntFromInterval(0, size - 1);

    const item = newList[oldInd];
    newList[oldInd] = newList[newInd];
    newList[newInd] = item;

    return newList;
  }, list);
};
