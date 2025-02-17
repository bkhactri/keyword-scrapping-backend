interface ExpectException {
  fn: () => unknown;
  exceptionInstance: unknown;
  message?: string;
}

export const expectException = async (props: ExpectException) => {
  let error: unknown;
  try {
    await props.fn();
  } catch (err) {
    error = err;
  }

  expect(error).toBeDefined();
  expect(error).toBeInstanceOf(props.exceptionInstance);
  if (props?.message) {
    expect((error as Record<string, never>).message).toBe(props.message);
  }
};
