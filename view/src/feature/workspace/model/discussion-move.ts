export interface DiscussionSummaryForMove {
  id: string;
  projectId: string;
  theme: string;
}

export interface ProjectWithDiscussions {
  projectId: string;
  projectName: string;
  isDefault: boolean;
  discussions: DiscussionSummaryForMove[];
}
