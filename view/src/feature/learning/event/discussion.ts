import type { CommentFrame } from "../model/comment-frame";
import type {
  DialogueSettings,
  Discussion,
  DiscussionLanguage,
  ModelLevel,
} from "../model/discussion";

export class LearningDiscussionCommentGenerateEvent extends Event {
  static get eventName() {
    return "learning-discussion-comment-generate" as const;
  }
  public readonly sourceText: string;
  public readonly sourceUrls: string[];
  public readonly modelLevel: ModelLevel;
  public readonly commentFrame: CommentFrame;

  constructor(
    sourceText: string,
    sourceUrls: string[],
    modelLevel: ModelLevel,
    commentFrame: CommentFrame,
  ) {
    super(LearningDiscussionCommentGenerateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.sourceText = sourceText;
    this.sourceUrls = sourceUrls;
    this.modelLevel = modelLevel;
    this.commentFrame = commentFrame;
  }
}

export class LearningDiscussionSelectEvent extends Event {
  static get eventName() {
    return "learning-discussion-select" as const;
  }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(LearningDiscussionSelectEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class LearningDiscussionCreateEvent extends Event {
  static get eventName() {
    return "learning-discussion-create" as const;
  }
  public readonly theme?: string;
  public readonly premise?: string;
  public readonly language?: DiscussionLanguage;
  public readonly sourceText?: string;
  public readonly sourceUrls?: string[];
  public readonly modelLevel?: ModelLevel;
  public readonly commentFrame?: CommentFrame;

  constructor(
    theme?: string,
    premise?: string,
    language?: DiscussionLanguage,
    sourceText?: string,
    sourceUrls?: string[],
    modelLevel?: ModelLevel,
    commentFrame?: CommentFrame,
  ) {
    super(LearningDiscussionCreateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
    this.premise = premise;
    this.language = language;
    this.sourceText = sourceText;
    this.sourceUrls = sourceUrls;
    this.modelLevel = modelLevel;
    this.commentFrame = commentFrame;
  }
}

export class LearningDiscussionCreatedEvent extends Event {
  static get eventName() {
    return "learning-discussion-created" as const;
  }
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LearningDiscussionCreatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionUpdateEvent extends Event {
  static get eventName() {
    return "learning-discussion-update" as const;
  }
  public readonly theme: string;
  public readonly premise: string;
  public readonly conclusion: string;
  public readonly language: DiscussionLanguage;

  constructor(
    theme: string,
    premise: string,
    conclusion: string,
    language: DiscussionLanguage,
  ) {
    super(LearningDiscussionUpdateEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.theme = theme;
    this.premise = premise;
    this.conclusion = conclusion;
    this.language = language;
  }
}

export class LearningDiscussionUpdatedEvent extends Event {
  static get eventName() {
    return "learning-discussion-updated" as const;
  }
  public readonly discussion: Discussion;

  constructor(discussion: Discussion) {
    super(LearningDiscussionUpdatedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussion = discussion;
  }
}

export class LearningDiscussionDeleteEvent extends Event {
  static get eventName() {
    return "learning-discussion-delete" as const;
  }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(LearningDiscussionDeleteEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class LearningDiscussionDeletedEvent extends Event {
  static get eventName() {
    return "learning-discussion-deleted" as const;
  }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(LearningDiscussionDeletedEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class LearningDiscussionSearchEvent extends Event {
  static get eventName() {
    return "learning-discussion-search" as const;
  }
  public readonly query: string;

  constructor(query: string) {
    super(LearningDiscussionSearchEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.query = query;
  }
}

export class LearningDiscussionArchiveFilterEvent extends Event {
  static get eventName() {
    return "learning-discussion-archive-filter" as const;
  }
  public readonly archived: boolean;

  constructor(archived: boolean) {
    super(LearningDiscussionArchiveFilterEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.archived = archived;
  }
}

export class LearningDiscussionFormOpenEvent extends Event {
  static get eventName() {
    return "learning-discussion-form-open" as const;
  }
  constructor() {
    super(LearningDiscussionFormOpenEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class LearningDiscussionFormCloseEvent extends Event {
  static get eventName() {
    return "learning-discussion-form-close" as const;
  }
  constructor() {
    super(LearningDiscussionFormCloseEvent.eventName, {
      bubbles: true,
      composed: true,
    });
  }
}

export class LearningDiscussionUpdateStatusEvent extends Event {
  static get eventName() {
    return "learning-discussion-update-status" as const;
  }
  public readonly status: Discussion["status"];

  constructor(status: Discussion["status"]) {
    super(LearningDiscussionUpdateStatusEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.status = status;
  }
}

export class LearningDiscussionUpdateDialogueSettingsEvent extends Event {
  static get eventName() {
    return "learning-discussion-update-dialogue-settings" as const;
  }
  public readonly settings: DialogueSettings;

  constructor(settings: DialogueSettings) {
    super(LearningDiscussionUpdateDialogueSettingsEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.settings = settings;
  }
}

export class LearningDiscussionRenameCommentTypeEvent extends Event {
  static get eventName() {
    return "learning-discussion-rename-comment-type" as const;
  }
  public readonly oldType: string;
  public readonly newType: string;

  constructor(oldType: string, newType: string) {
    super(LearningDiscussionRenameCommentTypeEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.oldType = oldType;
    this.newType = newType;
  }
}

export class LearningDiscussionArchiveEvent extends Event {
  static get eventName() {
    return "learning-discussion-archive" as const;
  }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(LearningDiscussionArchiveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

export class LearningDiscussionUnarchiveEvent extends Event {
  static get eventName() {
    return "learning-discussion-unarchive" as const;
  }
  public readonly discussionId: string;

  constructor(discussionId: string) {
    super(LearningDiscussionUnarchiveEvent.eventName, {
      bubbles: true,
      composed: true,
    });
    this.discussionId = discussionId;
  }
}

declare global {
  interface HTMLElementEventMap {
    [LearningDiscussionCommentGenerateEvent.eventName]: LearningDiscussionCommentGenerateEvent;
    [LearningDiscussionSelectEvent.eventName]: LearningDiscussionSelectEvent;
    [LearningDiscussionCreateEvent.eventName]: LearningDiscussionCreateEvent;
    [LearningDiscussionCreatedEvent.eventName]: LearningDiscussionCreatedEvent;
    [LearningDiscussionUpdateEvent.eventName]: LearningDiscussionUpdateEvent;
    [LearningDiscussionUpdatedEvent.eventName]: LearningDiscussionUpdatedEvent;
    [LearningDiscussionDeleteEvent.eventName]: LearningDiscussionDeleteEvent;
    [LearningDiscussionDeletedEvent.eventName]: LearningDiscussionDeletedEvent;
    [LearningDiscussionSearchEvent.eventName]: LearningDiscussionSearchEvent;
    [LearningDiscussionArchiveFilterEvent.eventName]: LearningDiscussionArchiveFilterEvent;
    [LearningDiscussionUpdateStatusEvent.eventName]: LearningDiscussionUpdateStatusEvent;
    [LearningDiscussionUpdateDialogueSettingsEvent.eventName]: LearningDiscussionUpdateDialogueSettingsEvent;
    [LearningDiscussionRenameCommentTypeEvent.eventName]: LearningDiscussionRenameCommentTypeEvent;
    [LearningDiscussionArchiveEvent.eventName]: LearningDiscussionArchiveEvent;
    [LearningDiscussionUnarchiveEvent.eventName]: LearningDiscussionUnarchiveEvent;
    [LearningDiscussionFormOpenEvent.eventName]: LearningDiscussionFormOpenEvent;
    [LearningDiscussionFormCloseEvent.eventName]: LearningDiscussionFormCloseEvent;
  }
}
