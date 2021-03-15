export type Result<T, E> = Success<T, E> | Failure<T, E>;

class Success<T, E> {
  constructor(readonly value: T) {}

  isSuccess(): boolean {
    return true;
  }

  isFailure(): boolean {
    return false;
  }

  unwrap(): T {
    return this.value;
  }
}

class Failure<T, E> {
  constructor(readonly reason: E) {}

  isSuccess(): boolean {
    return false;
  }

  isFailure(): boolean {
    return true;
  }

  unwrap(): T {
    throw new Error("can't unwrap failure");
  }
}

export const success = <T, E>(value: T): Result<T, E> => {
  return new Success(value);
};

export const failure = <T, E>(reason: E): Result<T, E> => {
  return new Failure(reason);
};
