import { serializeStructuredData, type JsonLdObject } from "@/lib/structured-data";

type JsonLdScriptProps = {
  data: JsonLdObject | JsonLdObject[];
  id?: string;
};

export function JsonLdScript({ data, id }: JsonLdScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}
