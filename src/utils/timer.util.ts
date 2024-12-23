export const randomDelay = async (range: number) => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * (range * 1000) + 1000),
  );
};
