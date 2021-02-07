type Result<T, E> = Success<T> | Err<E>;

class Success<T> {
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSuccess(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }
}

class Err<E> {
  private readonly reason: E;

  constructor(reason: E) {
    this.reason = reason;
  }

  isSuccess(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }
}

export const success = <T, E>(value: T): Result<T, E> => {
  return new Success(value);
};

export const err = <T, E>(reason: E): Result<T, E> => {
  return new Err(reason);
};
