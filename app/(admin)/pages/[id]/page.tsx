"use client";

import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageConversationsTab } from "@/components/pages/detail/PageConversationsTab";
import { PageFaqsTab } from "@/components/pages/detail/PageFaqsTab";
import { PageProductsTab } from "@/components/pages/detail/PageProductsTab";
import { usePageDetail, useDeletePage } from "@/hooks/usePages";
import type { PageItem } from "@/services/pages.service";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Spin,
  Tabs,
} from "antd";

function jsonPreview(value: unknown) {
  if (value === null || value === undefined) return "(empty)";
  const s = JSON.stringify(value, null, 2);
  return s.length > 2000 ? `${s.slice(0, 2000)}…` : s;
}

function GeneralTabContent({ page }: { page: PageItem }) {
  const scalars: { key: string; value: string }[] = [
    { key: "ID", value: page.id },
    { key: "Page ID", value: page.pageId },
    { key: "User ID", value: page.userId },
    { key: "Created", value: new Date(page.createdAt).toLocaleString() },
    { key: "Updated", value: new Date(page.updatedAt).toLocaleString() },
  ];

  return (
    <Space orientation="vertical" size={16} className="w-full">
      {scalars.map((entry) => (
        <p key={entry.key} className="mb-0">
          <strong>{entry.key}:</strong> {entry.value}
        </p>
      ))}
      <div>
        <p className="mb-2 font-semibold">System prompt</p>
        <p className="mb-0 mt-0 whitespace-pre-wrap break-words">
          {page.systemPrompt || "(empty)"}
        </p>
      </div>
      <div>
        <p className="mb-2 font-semibold">AI config</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.aiConfig)}
        </pre>
      </div>
      <div>
        <p className="mb-2 font-semibold">Templates</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.templates)}
        </pre>
      </div>
      <div>
        <p className="mb-2 font-semibold">Order ship config</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.orderShipConfig)}
        </pre>
      </div>
      <div>
        <p className="mb-2 font-semibold">Order collection config</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.orderCollectionConfig)}
        </pre>
      </div>
      <div>
        <p className="mb-2 font-semibold">RAG config</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.ragConfig)}
        </pre>
      </div>
      <div>
        <p className="mb-2 font-semibold">Order config</p>
        <pre className="max-h-48 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs">
          {jsonPreview(page.orderConfig)}
        </pre>
      </div>
    </Space>
  );
}

export default function PageDetailRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  const { data: page, isLoading: isPageLoading } = usePageDetail(id);
  const deleteMutation = useDeletePage();

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/pages")}>
              Back to pages
            </Button>
            {page && (
              <Space>
                <Button
                  type="default"
                  onClick={() => router.push(`/pages/${page.id}/edit`)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this page?"
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                  onConfirm={() => {
                    deleteMutation.mutate(page.id, {
                      onSuccess: () => router.push("/pages"),
                    });
                  }}
                >
                  <Button danger type="default">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </div>

          <Card>
            {isPageLoading || !page ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spin />
              </div>
            ) : (
              <Tabs
                defaultActiveKey="general"
                items={[
                  {
                    key: "general",
                    label: "General",
                    children: <GeneralTabContent page={page} />,
                  },
                  {
                    key: "products",
                    label: "Products",
                    children: <PageProductsTab pageUuid={page.id} />,
                  },
                  {
                    key: "faqs",
                    label: "FAQs",
                    children: <PageFaqsTab pageUuid={page.id} />,
                  },
                  {
                    key: "conversations",
                    label: "Conversations",
                    children: <PageConversationsTab pageUuid={page.id} />,
                  },
                ]}
              />
            )}
          </Card>
        </div>
      </section>
    </AuthGuard>
  );
}
