import { MailFeedbackScreen } from "@/shared/ui/mail-feedback-screen";

export default function IssueScreen() {
  return (
    <MailFeedbackScreen
      headerTitle="버그 신고"
      recipient="biblecookie@naver.com"
      defaultSubject="[버그 신고]"
      subjectPlaceholder="버그 제목을 입력해 주세요"
      bodyPlaceholder="버그가 발생한 상황, 재현 방법 등을 적어 주세요"
    />
  );
}
