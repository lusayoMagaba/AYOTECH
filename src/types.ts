export interface SiteMetadata {
  title: string;
  description: string;
  themeColor: string;
  icons: { src: string; sizes?: string; type?: string }[];
  url: string;
}

export interface AppConfig extends SiteMetadata {
  shortName: string;
  display: "standalone" | "fullscreen" | "minimal-ui";
  orientation: "portrait" | "any";
  backgroundColor: string;
}

export interface AuditIssue {
  id: string;
  title: string;
  description: string;
  type: "performance" | "ui" | "logic";
  severity: "high" | "medium" | "low";
}
