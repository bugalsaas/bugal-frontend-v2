// Contact-related enums matching backend schema

export enum Gender {
  Female = 'female',
  Male = 'male',
  Other = 'other',
  PreferNotToSay = 'prefer_not_to_say',
}

export enum RelationshipType {
  Parent = 'Parent',
  Sibling = 'Sibling',
  OtherFamilyMember = 'OtherFamilyMember',
  LegalGuardian = 'LegalGuardian',
  SupportCoordinator = 'SupportCoordinator',
  Other = 'Other',
}

export enum RoleType {
  AccountsDepartment = 'AccountsDepartment',
  Coordinator = 'Coordinator',
  NDISContact = 'NDISContact',
  Other = 'Other',
  OtherGuardian = 'OtherGuardian',
  PlanManager = 'PlanManager',
}

// Helper functions for displaying enum values
export const GenderToText = (gender: Gender): string => {
  switch (gender) {
    case Gender.Female:
      return 'Female';
    case Gender.Male:
      return 'Male';
    case Gender.Other:
      return 'Other';
    case Gender.PreferNotToSay:
      return 'Prefer not to say';
    default:
      return String(gender);
  }
};

export const RelationshipTypeToText = (relationship: RelationshipType): string => {
  switch (relationship) {
    case RelationshipType.Parent:
      return 'Parent';
    case RelationshipType.Sibling:
      return 'Sibling';
    case RelationshipType.OtherFamilyMember:
      return 'Other Family Member';
    case RelationshipType.LegalGuardian:
      return 'Legal Guardian';
    case RelationshipType.SupportCoordinator:
      return 'Support Coordinator';
    case RelationshipType.Other:
      return 'Other';
    default:
      return String(relationship);
  }
};

export const RoleTypeToText = (role: RoleType): string => {
  switch (role) {
    case RoleType.AccountsDepartment:
      return 'Accounts Department';
    case RoleType.Coordinator:
      return 'Support Coordinator';
    case RoleType.NDISContact:
      return 'NDIS Contact';
    case RoleType.OtherGuardian:
      return 'Other Guardian';
    case RoleType.Other:
      return 'Other';
    case RoleType.PlanManager:
      return 'Plan Manager';
    default:
      return String(role);
  }
};

