import type { Project } from "../model/project";

export const WORKSPACE_PROJECT_SELECT_EVENT_NAME = "workspace-project-select";
export const WORKSPACE_PROJECT_CREATE_EVENT_NAME = "workspace-project-create";
export const WORKSPACE_PROJECT_CREATED_EVENT_NAME = "workspace-project-created";
export const WORKSPACE_PROJECT_UPDATE_EVENT_NAME = "workspace-project-update";
export const WORKSPACE_PROJECT_UPDATED_EVENT_NAME = "workspace-project-updated";
export const WORKSPACE_PROJECT_DELETE_EVENT_NAME = "workspace-project-delete";
export const WORKSPACE_PROJECT_DELETED_EVENT_NAME = "workspace-project-deleted";

export class WorkspaceProjectSelectEvent extends Event {
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WORKSPACE_PROJECT_SELECT_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

export class WorkspaceProjectCreateEvent extends Event {
  public readonly name: string;

  constructor(name: string) {
    super(WORKSPACE_PROJECT_CREATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.name = name;
  }
}

export class WorkspaceProjectCreatedEvent extends Event {
  public readonly project: Project;

  constructor(project: Project) {
    super(WORKSPACE_PROJECT_CREATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.project = project;
  }
}

export class WorkspaceProjectUpdateEvent extends Event {
  public readonly projectId: string;
  public readonly name: string;

  constructor(projectId: string, name: string) {
    super(WORKSPACE_PROJECT_UPDATE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
    this.name = name;
  }
}

export class WorkspaceProjectUpdatedEvent extends Event {
  public readonly project: Project;

  constructor(project: Project) {
    super(WORKSPACE_PROJECT_UPDATED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.project = project;
  }
}

export class WorkspaceProjectDeleteEvent extends Event {
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WORKSPACE_PROJECT_DELETE_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

export class WorkspaceProjectDeletedEvent extends Event {
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WORKSPACE_PROJECT_DELETED_EVENT_NAME, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [WORKSPACE_PROJECT_SELECT_EVENT_NAME]: WorkspaceProjectSelectEvent;
    [WORKSPACE_PROJECT_CREATE_EVENT_NAME]: WorkspaceProjectCreateEvent;
    [WORKSPACE_PROJECT_CREATED_EVENT_NAME]: WorkspaceProjectCreatedEvent;
    [WORKSPACE_PROJECT_UPDATE_EVENT_NAME]: WorkspaceProjectUpdateEvent;
    [WORKSPACE_PROJECT_UPDATED_EVENT_NAME]: WorkspaceProjectUpdatedEvent;
    [WORKSPACE_PROJECT_DELETE_EVENT_NAME]: WorkspaceProjectDeleteEvent;
    [WORKSPACE_PROJECT_DELETED_EVENT_NAME]: WorkspaceProjectDeletedEvent;
  }
}
