export function useModels() {
  const models = [
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4.1',
    'openai/gpt-3.5-turbo',
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-4o-mini' })

  if (!model.value) {
    model.value = 'openai/gpt-4o-mini'
  }

  return { models, model }
}
