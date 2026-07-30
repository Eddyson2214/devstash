import { FileText } from "lucide-react";

import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { Badge } from "@/components/ui/badge";
import type { FetchedItemDetail } from "@/hooks/use-item-drawer-data";
import { formatFileSize } from "@/lib/file-upload";

interface ItemViewContentProps {
  item: FetchedItemDetail;
  showsFile: boolean;
  showsLanguage: boolean;
  isPro: boolean;
}

export function ItemViewContent({ item, showsFile, showsLanguage, isPro }: ItemViewContentProps) {
  return (
    <>
      {item.description && (
        <section>
          <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Description
          </h4>
          <p className="text-sm">{item.description}</p>
        </section>
      )}

      {item.contentType === "URL" && item.url ? (
        <section>
          <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            URL
          </h4>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary underline underline-offset-4"
          >
            {item.url}
          </a>
        </section>
      ) : showsFile && item.fileUrl ? (
        <section>
          <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.itemType.name === "Image" ? "Image" : "File"}
          </h4>
          {item.itemType.name === "Image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not a local asset
            <img
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              className="max-h-72 w-full rounded-lg border border-border/60 bg-muted object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{item.fileName}</span>
                {item.fileSize !== null && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        item.content && (
          <section>
            <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Content
            </h4>
            {showsLanguage ? (
              <CodeEditor
                value={item.content}
                language={item.language}
                readOnly
                explain={{ title: item.title, isPro }}
              />
            ) : (
              <MarkdownEditor value={item.content} readOnly />
            )}
          </section>
        )
      )}

      {item.tags.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
