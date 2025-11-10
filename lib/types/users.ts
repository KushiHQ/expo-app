import { LoginMutation } from "../services/graphql/generated";

export type UserData = {
  userType?: UserType;
  email?: string;
  hostListingsView?: "list" | "grid" | "block";
  password?: string;
  user?: NonNullable<LoginMutation["login"]["data"]>["user"];
};

export enum UserType {
  Host,
  Guest,
}
