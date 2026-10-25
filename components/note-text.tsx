const URL_PATTERN = /https?:\/\/[^\s<>"]+/g;

export function NoteText({ text }: { text: string }) {
  const pattern = new RegExp(URL_PATTERN);
  const nodes: Array<string | { url: string; index: number }> = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push({ url: match[0], index });
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  return (
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
      {nodes.map((node, nodeIndex) =>
        typeof node === "string" ? (
          <span key={nodeIndex}>{node}</span>
        ) : (
          <a
            key={`${node.index}-${node.url}`}
            href={node.url}
            className="text-blue underline decoration-1 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.url}
          </a>
        ),
      )}
    </p>
  );
}
