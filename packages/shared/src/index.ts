export type AppLocale = "zh-CN" | "en-US";

export const APP_LOCALES: AppLocale[] = ["zh-CN", "en-US"];

export enum ResourceType {
  DOC = "doc",
  MARKDOWN = "markdown",
  DIAGRAM = "diagram",
  TASK_TREE = "task_tree",
  ASSET_FILE = "asset_file",
  PDF = "pdf",
  HOI4_FOCUS_TREE = "hoi4_focus_tree",
  HOI4_LOCALIZATION = "hoi4_localization",
  HOI4_EVENT = "hoi4_event",
  HOI4_DECISION = "hoi4_decision",
}

export enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  MAINTAINER = "maintainer",
  EDITOR = "editor",
  VIEWER = "viewer",
  GUEST = "guest",
}

export enum MembershipStatus {
  ACTIVE = "active",
  INVITED = "invited",
  SUSPENDED = "suspended",
  REMOVED = "removed",
}

export enum OrganizationInviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

export enum ProjectType {
  GENERAL = "general",
  HOI4 = "hoi4",
}

export enum RepositoryVisibility {
  PRIVATE = "private",
  INTERNAL = "internal",
}

export enum TeamRoleScope {
  ORGANIZATION = "organization",
  REPOSITORY = "repository",
  PROJECT = "project",
}

export enum ProjectPermission {
  PROJECT_VIEW = "project_view",
  PROJECT_EDIT = "project_edit",
  PROJECT_DELETE = "project_delete",
  RESOURCE_VIEW = "resource_view",
  RESOURCE_EDIT = "resource_edit",
  RESOURCE_DELETE = "resource_delete",
  FOCUS_TREE_VIEW = "focus_tree_view",
  FOCUS_TREE_EDIT = "focus_tree_edit",
  LOCALIZATION_VIEW = "localization_view",
  LOCALIZATION_EDIT = "localization_edit",
  COLLABORATION_MANAGE = "collaboration_manage",
  RELEASE_MANAGE = "release_manage",
}

export enum AuthProvider {
  LOCAL = "local",
  GITHUB = "github",
  GOOGLE = "google",
  OIDC = "oidc",
  SAML = "saml",
}

export enum UserEmailStatus {
  PENDING = "pending",
  VERIFIED = "verified",
}

export enum UserAccountStatus {
  ACTIVE = "active",
  PENDING_VERIFICATION = "pending_verification",
  LOCKED = "locked",
  DISABLED = "disabled",
}

export enum TokenPurpose {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
  ORGANIZATION_INVITE = "organization_invite",
}

export enum SsoProviderType {
  OIDC = "oidc",
  SAML = "saml",
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface HealthStatus {
  name: string;
  version: string;
  status: "ok";
  time: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
}

export interface OrganizationWorkspaceSummary extends OrganizationSummary {
  membershipId: string;
  membershipStatus: MembershipStatus;
  repositoryCount: number;
  projectCount: number;
}

export interface RepositorySummary {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: RepositoryVisibility;
  projectCount: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  type: ProjectType;
  organizationId: string;
}

export interface ScopedProjectSummary extends ProjectSummary {
  repositoryId: string;
  repositorySlug: string;
  description: string | null;
}

export interface Hoi4ProjectSummary extends ProjectSummary {
  type: ProjectType.HOI4;
  focusTreeCount: number;
  localizationEntryCount: number;
}

export interface TeamRoleSummary {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  scope: TeamRoleScope;
  permissions: ProjectPermission[];
}

export interface AuthenticatedUserSummary {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  globalRole: string;
  accountStatus: UserAccountStatus;
  primaryEmailVerified: boolean;
}

export interface SessionSummary {
  id: string;
  userId: string;
  provider: AuthProvider;
  expiresAt: string;
}

export interface InvitationSummary {
  id: string;
  organizationId: string;
  email: string;
  status: OrganizationInviteStatus;
  expiresAt: string;
}

export const I18N_KEYS = {
  common: {
    appName: "common.appName",
    enterStudio: "common.enterStudio",
    switchLanguage: "common.switchLanguage",
    systemStatus: "common.systemStatus",
  },
  home: {
    heroTitle: "home.heroTitle",
    heroSubtitle: "home.heroSubtitle",
    projectSectionTitle: "home.projectSectionTitle",
    architectureSectionTitle: "home.architectureSectionTitle",
  },
  auth: {
    loginTitle: "auth.login.title",
    registerTitle: "auth.register.title",
    forgotPasswordTitle: "auth.forgotPassword.title",
    verifyEmailTitle: "auth.verifyEmail.title",
  },
  studio: {
    organizationsTitle: "studio.organizations.title",
    repositoriesTitle: "studio.repositories.title",
    projectsTitle: "studio.projects.title",
  },
} as const;