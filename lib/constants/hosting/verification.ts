import { HostingPropertyRelationship } from "@/lib/services/graphql/generated";

export const HOSTING_VERIFICATION_OPTIONS: {
  label: keyof typeof HostingPropertyRelationship;
  value: HostingPropertyRelationship;
  description?: string;
}[] = [
    {
      label: "Agent",
      value: HostingPropertyRelationship.Agent,
      description:
        "I am the legal owner of this property with full rights to lease it.",
    },
    {
      label: "Landlord",
      value: HostingPropertyRelationship.Landlord,
      description:
        "I am an attorney or agent with a direct mandate from the owner to manage this property.",
    },
    {
      label: "Subletter",
      value: HostingPropertyRelationship.Subletter,
      description:
        "I am a tenant with a valid lease and written permission from my landlord to sublet this space.",
    },
  ];
