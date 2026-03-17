"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { usePagesList } from "@/hooks/usePages";
import { Empty, Table } from "antd";

const columns = [
  {
    title: "Page ID",
    dataIndex: "pageId",
    key: "pageId",
  },
  {
    title: "Page UUID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Updated At",
    dataIndex: "updatedAt",
    key: "updatedAt",
  },
];

export default function PagesListRoute() {
  const router = useRouter();
  const { data: pages, isLoading, isFetching } = usePagesList();

  if (isFetching) {
    return (
      <AuthGuard>
        <section className="w-full p-4">
          <TableSkeleton
            columns={columns}
            rowCount={12}
          />
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
        <Table
          rowKey="id"
          loading={isLoading}
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
