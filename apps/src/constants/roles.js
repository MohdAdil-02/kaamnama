export const ROLES = Object.freeze({
  WORKER: "worker",
  CUSTOMER: "customer",
  ORG_ADMIN: "org_admin",
  ADMIN: "admin",
});

export const ROLE_LIST = Object.values(ROLES);

export const ORG_MEMBER_ROLES = Object.freeze({
  OWNER: "owner",
  MANAGER: "manager",
  MEMBER: "member",
});