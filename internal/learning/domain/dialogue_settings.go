package domain

type DialogueSettings struct {
	CommentFrame CommentFrame
}

func (s DialogueSettings) Validate() error {
	if err := s.CommentFrame.Validate(); err != nil {
		return err
	}
	return nil
}
