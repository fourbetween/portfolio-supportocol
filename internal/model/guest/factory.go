package user

type (
	Factory struct{}

	BuildParams struct {
		ID    string
		Email string
	}
)

func NewFactory() *Factory {
	return &Factory{}
}

func (f *Factory) Build(params BuildParams) Guest {
	return Guest{}
}
