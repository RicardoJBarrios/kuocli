export interface GitlintGeneratorSchema {
  gitflow?: boolean;
  scopes?: string;
  appScopes?: boolean;
  libScopes?: boolean;
  skipFormat?: boolean;
}
