import { MailFeedbackScreen } from "@/shared/ui/mail-feedback-screen";

export default function ImprovementScreen() {
  return (
    <MailFeedbackScreen
      headerTitle="개선 제안"
      recipient="biblecookie@naver.com"
      defaultSubject="[개선 제안]"
      subjectPlaceholder="제안 제목을 입력해 주세요"
      bodyPlaceholder="개선하고 싶은 점, 아이디어 등을 적어 주세요"
    />
  );
}
