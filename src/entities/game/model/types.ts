export default interface Game {
  id: string;
  name: string;
  image: any; // require()로 불러온 이미지
  difficulty: number; // 1-5
  description: string;
  measuredSkills: string[];
  images: any[]; // require()로 불러온 이미지
  numberOfQuestions: number | null; // 문항수 (null이면 무제한)
  numberOfRounds: number;
  timeLimit: number; // 응시 시간 (초)
}
