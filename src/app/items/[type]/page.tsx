import { notFound } from "next/navigation";

import { itemTypes } from "@/lib/mock-data";
import { typeHref } from "@/lib/type-icons";

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const itemType = itemTypes.find((t) => typeHref(t.name) === `/items/${type}`);

  if (!itemType) {
    notFound();
  }

  return (
    <div className="p-6">
      <h2>{itemType.name}</h2>
    </div>
  );
}
