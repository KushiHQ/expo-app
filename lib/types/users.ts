export type UserStore = {
  userType?: UserType;
};

export enum UserType {
  Host,
  Guest,
}
