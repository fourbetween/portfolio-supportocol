import type { Project } from "../model/project";

export class WorkspaceProjectSelectEvent extends Event {
  static get eventName() { return "workspace-project-select" as const; }
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WorkspaceProjectSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

export class WorkspaceProjectCreateEvent extends Event {
  static get eventName() { return "workspace-project-create" as const; }
  public readonly name: string;

  constructor(name: string) {
    super(WorkspaceProjectCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.name = name;
  }
}

export class WorkspaceProjectCreatedEvent extends Event {
  static get eventName() { return "workspace-project-created" as const; }
  public readonly project: Project;

  constructor(project: Project) {
    super(WorkspaceProjectCreatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.project = project;
  }
}

export class WorkspaceProjectUpdateEvent extends Event {
  static get eventName() { return "workspace-project-update" as const; }
  public readonly projectId: string;
  public readonly name: string;
  public readonly premise: string;

  constructor(projectId: string, name: string, premise: string) {
    super(WorkspaceProjectUpdateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
    this.name = name;
    this.premise = premise;
  }
}

export class WorkspaceProjectUpdatedEvent extends Event {
  static get eventName() { return "workspace-project-updated" as const; }
  public readonly project: Project;

  constructor(project: Project) {
    super(WorkspaceProjectUpdatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.project = project;
  }
}

export class WorkspaceProjectDeleteEvent extends Event {
  static get eventName() { return "workspace-project-delete" as const; }
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WorkspaceProjectDeleteEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

export class WorkspaceProjectDeletedEvent extends Event {
  static get eventName() { return "workspace-project-deleted" as const; }
  public readonly projectId: string;

  constructor(projectId: string) {
    super(WorkspaceProjectDeletedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.projectId = projectId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [WorkspaceProjectSelectEvent.eventName]: WorkspaceProjectSelectEvent;
    [WorkspaceProjectCreateEvent.eventName]: WorkspaceProjectCreateEvent;
    [WorkspaceProjectCreatedEvent.eventName]: WorkspaceProjectCreatedEvent;
    [WorkspaceProjectUpdateEvent.eventName]: WorkspaceProjectUpdateEvent;
    [WorkspaceProjectUpdatedEvent.eventName]: WorkspaceProjectUpdatedEvent;
    [WorkspaceProjectDeleteEvent.eventName]: WorkspaceProjectDeleteEvent;
    [WorkspaceProjectDeletedEvent.eventName]: WorkspaceProjectDeletedEvent;
  }
}
