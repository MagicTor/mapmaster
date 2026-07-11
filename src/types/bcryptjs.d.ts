declare module "bcryptjs" {
  export type HashValue = string;

  const bcrypt: {
    hash(data: string, saltOrRounds: string | number): Promise<HashValue>;
    compare(data: string, encrypted: string): Promise<boolean>;
  };

  export default bcrypt;
}
