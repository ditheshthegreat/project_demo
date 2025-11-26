import { Result } from "../../../../shared/core/types/Result";

export class EmailVO {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  public getValue(): string {
    return this.value;
  }

  public static create(email: string): Result<EmailVO> {
    if (!email || email.trim().length === 0) {
      return Result.fail<EmailVO>("Email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Result.fail<EmailVO>("Invalid email format");
    }

    return Result.ok<EmailVO>(new EmailVO(email.toLowerCase().trim()));
  }

  public equals(other: EmailVO): boolean {
    return this.value === other.value;
  }
}
