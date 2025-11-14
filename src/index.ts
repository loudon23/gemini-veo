import { GoogleGenAI, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import dateformat from 'dateformat';
import mime from 'mime-types';
import { glob } from 'glob'

// .env 파일에서 환경변수 로드
dotenv.config();

// 환경변수 할당
const {
  GEMINI_API_KEY = '',
  MODEL = '',
} = process.env;

async function main() {
  // @see https://googleapis.github.io/js-genai/release_docs/interfaces/client.GoogleGenAIOptions.html
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // 프롬프트
  const prompt = `두 캐릭터가 달리기를 하다가, 파란색 두건을 쓴 캐릭터가 넘어지는 영상으로 만들어`;

  // 자원으로 쓸 이미지 파일 경로
  // 해당 폴더 아래의 모든 이미지를 자원으로 사용
  const assetPath = 'assets/1';

  // 로컬 이미지 파일을 읽어 Base64로 인코딩 후 레퍼런스객체에 넣기
  const referenceImages: VideoGenerationReferenceImage[] = [];
  const assetFiles = await glob(`${assetPath}/*.png`);
  for (let assetImage of assetFiles) {
    const imagePath = path.join(assetImage);
    const imageBytes = fs.readFileSync(imagePath).toString('base64');
    const mimeType = mime.lookup(imagePath);
    if (!mimeType) {
      throw new Error("❌ 이미지의 MIME 타입을 확인할 수 없습니다.");
    }

    referenceImages.push({
      image: {
        imageBytes: imageBytes,
        mimeType: mimeType,
      },
      referenceType: VideoGenerationReferenceType.ASSET,
    });
  }

  // 이미지를 사용하여 Veo 3.1로 비디오를 생성합니다.
  // @see https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html#generatevideos
  let operation = await ai.models.generateVideos({
    model: MODEL,
    prompt: prompt,
    config: {
      referenceImages: referenceImages,
    },
  });

  // 비디오가 준비될 때까지 작업 상태를 폴링합니다.
  while (!operation.done) {
    console.log("♻️ 비디오 생성이 완료될 때까지 기다리는 중...")
    await new Promise((resolve) => setTimeout(resolve, 10000));
    // @see https://googleapis.github.io/js-genai/release_docs/classes/operations.Operations.html#getvideosoperation
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  // 응답에서 video 파일 얻기
  const file = operation?.response?.generatedVideos?.[0]?.video;
  if (!file) {
    throw new Error('❌ 비디오 생성에 실패했습니다.')
  }

  // 파일명 만들기. output 디렉토리에 YYYYMMDD_HHmmss.mp4 로 만듬
  const prefix = 'output';
  const saveFilename = `${dateformat(new Date(), "yyyymmdd_HHMMss")}.mp4`;
  const downloadPath = `${prefix}/${saveFilename}`;


  // 비디오를 다운로드
  // @see https://googleapis.github.io/js-genai/release_docs/classes/files.Files.html#download 
  ai.files.download({
    file,
    downloadPath,
  });
  console.log(`✅ 생성된 비디오는 ${downloadPath}에 저장되었습니다.`);
}

main();