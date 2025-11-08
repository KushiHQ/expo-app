import { LoginMutation } from "../services/graphql/generated";

export type UserStore = {
  userType?: UserType;
  password?: string;
  user?: NonNullable<LoginMutation["login"]["data"]>["user"];
};

export enum UserType {
  Host,
  Guest,
}
