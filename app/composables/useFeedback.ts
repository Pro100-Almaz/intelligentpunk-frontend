export const useFeedback = () => {
  const feedbackModalOpen = useState('feedback-modal-open', () => false)

  const openFeedbackModal = () => {
    feedbackModalOpen.value = true
  }

  const closeFeedbackModal = () => {
    feedbackModalOpen.value = false
  }

  return {
    feedbackModalOpen: readonly(feedbackModalOpen),
    openFeedbackModal,
    closeFeedbackModal
  }
} 