export default interface Game {
  id: string;
  name: string;
  image: any; // require()로 불러온 이미지
  difficulty: number; // 1-5
  description: string;
  measuredSkills: string[];
}
