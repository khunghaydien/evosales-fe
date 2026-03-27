"use client";

import { useMemo } from "react";
import { useConversationsByPage } from "@/hooks/useConversations";
import type { ConversationItem } from "@/services/conversations.service";
import { Spin, Table } from "antd";

function shortJson(obj: Record<string, unknown> | null) {
  if (!obj || !Object.keys(obj).length) return "—";
  const s = JSON.stringify(obj);
  return s.length > 56 ? `${s.slice(0, 56)}…` : s;
}

export function PageConversationsTab({ pageUuid }: { pageUuid: string }) {
  const { data: rows, isLoading, dataUpdatedAt } = useConversationsByPage(
    pageUuid
  );

  const columns = useMemo(
    () => [
      {
        title: "External ID",
        dataIndex: "externalConversationId",
        key: "externalConversationId",
        ellipsis: true,
      },
      { title: "Status", dataIndex: "status", key: "status", width: 200 },
      {
        title: "Order info",
        key: "orderInfo",
        width: 160,
        render: (_: unknown, r: ConversationItem) => shortJson(r.orderInfo),
      },
      {
        title: "Shipping",
        key: "shippingInfo",
        width: 160,
        render: (_: unknown, r: ConversationItem) =>
          shortJson(r.shippingInfo),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 180,
        render: (v: string) => new Date(v).toLocaleString(),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-muted text-sm">
        This list refreshes every minute.
        {dataUpdatedAt
          ? ` Last updated: ${new Date(dataUpdatedAt).toLocaleTimeString()}`
          : null}
      </p>
      {isLoading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Spin />
        </div>
      ) : (
        <Table<ConversationItem>
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          dataSource={rows ?? []}
          columns={columns}
        />
      )}
    </div>
  );
}
