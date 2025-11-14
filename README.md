# gemini veo 
api 로 동영상 만들기 

# 사용법
1. assets 폴더 안에 특정 폴더를 만들어서 참조 이미지들을 넣음  
  여기에서는 1이라는 폴더에 이미지를 넣음 
3. index.ts 내에
   ```typescript
   // 프롬프트
   const prompt = `두 캐릭터가 달리기를 하다가, 파란색 두건을 쓴 캐릭터가 넘어지는 영상으로 만들어`;

   // 자원으로 쓸 이미지 파일 경로
   // 해당 폴더 아래의 모든 이미지를 자원으로 사용
   const assetPath = 'assets/1';
   ```
   이 부분을 원하는 형태로 수정
4. 실행  
  ```npm run dev```
5. 결과물은 `output/` 안에 저장됨

# .env 환경변수
* GEMINI_API_KEY  
  Gemini Api key, https://aistudio.google.com/api-keys 에서 구할 수 있음
  
* MODEL  
  Gemini 모델 버전, https://ai.google.dev/gemini-api/docs/video?hl=ko&example=dialogue#model-versions
