import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function indexTheDoc(filePath) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });
  const texts = await splitter.splitText(docs[0].pageContent);
  console.log(texts.length);

  //
}

// indexTheDoc("MERN_jd.pdf");
