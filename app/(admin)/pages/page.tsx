"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { usePagesList } from "@/hooks/usePages";
import type { PageItem } from "@/services/pages.service";
import { Empty, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

const SKELETON_KEYS = [
  "pageId",
  "id",
  "userId",
  "systemPrompt",
  "createdAt",
  "updatedAt",
  "aiConfig",
  "templates",
  "orderShipConfig",
  "orderCollectionConfig",
  "ragConfig",
  "orderConfig",
] as const;

const skeletonColumns = SKELETON_KEYS.map((k) => ({
  title: k,
  key: k,
}));

function formatListCell(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }
  if (typeof value === "object") {
    const s = JSON.stringify(value);
    return s.length > 48 ? `${s.slice(0, 48)}…` : s;
  }
  if (typeof value === "string" && /At$/.test(key)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  }
  if (typeof value === "string" && value.length > 48) {
    return `${value.slice(0, 48)}…`;
  }
  return String(value);
}

function columnsFromPages(pages: PageItem[] | undefined): ColumnsType<PageItem> {
  const sample = pages?.[0];
  const keys = sample
    ? (Object.keys(sample) as (keyof PageItem)[])
    : [...SKELETON_KEYS];
  return keys.map((key) => ({
    title: String(key),
    dataIndex: key,
    key: String(key),
    ellipsis: true,
    render: (_: unknown, record: PageItem) =>
      formatListCell(String(key), record[key]),
  }));
}

export default function PagesListRoute() {
  const router = useRouter();
  const { data: pages, isLoading } = usePagesList();

  const columns = useMemo(() => columnsFromPages(pages), [pages]);

  if (isLoading) {
    return (
      <AuthGuard>
        <section className="w-full p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pages</h2>
          </div>
          <TableSkeleton columns={skeletonColumns} rowCount={12} />
        </section>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pages</h2>
          <button
            type="button"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-sidebar-item-hover-bg"
            onClick={() => router.push("/pages/create")}
          >
            Create page
          </button>
        </div>
        <Table<PageItem>
          rowKey="id"
          loading={false}
          dataSource={pages ?? []}
          locale={{
            emptyText: <Empty description="No pages yet" />,
          }}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => router.push(`/pages/${record.id}`),
            className: "cursor-pointer",
          })}
          scroll={{ y: 400, x: "max-content" }}
          columns={columns}
        />
      </section>
    </AuthGuard>
  );
}
