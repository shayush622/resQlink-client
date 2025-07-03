import formidable, { Fields, Files } from "formidable";
import { IncomingMessage } from "http";

export function parseForm(req: IncomingMessage): Promise<[Fields, Files]> {
  const form = formidable({ multiples: false, keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files]);
    });
  });
}
