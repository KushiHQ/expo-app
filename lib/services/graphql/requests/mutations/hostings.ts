import { gql } from "urql";

export const CREATE_UPDATE_SAVED_HOSTING_FOLDER_MUTATION = gql`
  mutation CreateUpdateSavedHostingFolder($input: SavedHostingFolderInput!) {
    createUpdateSavedHostingFolder(input: $input) {
      message
      data {
        id
      }
    }
  }
`;
