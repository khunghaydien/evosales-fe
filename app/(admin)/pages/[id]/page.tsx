"use client";

import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useKnowledgeEmbeddings } from "@/hooks/useKnowledgeEmbeddings";
import { usePageDetail, useDeletePage } from "@/hooks/usePages";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Empty, List, Popconfirm, Space, Spin, Tag } from "antd";

export default function PageDetailRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  const { data: page, isLoading: isPageLoading } = usePageDetail(id);
  const { data: chunks, isLoading: isChunksLoading } = useKnowledgeEmbeddings(
    page?.pageId ?? null
  );
  const deleteMutation = useDeletePage();

  const detailEntries = page
    ? [
      { key: "ID", value: page.id },
      { key: "Page ID", value: page.pageId },
      { key: "User ID", value: page.userId },
      { key: "Created", value: new Date(page.createdAt).toLocaleString() },
      { key: "Updated", value: new Date(page.updatedAt).toLocaleString() },
    ]
    : [];

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/pages")}>
              Back to pages
            </Button>
            {page && (
              <Space>
                <Button
                  type="default"
                  onClick={() => {
                    router.push(`/pages/${page.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this page?"
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                  onConfirm={() => {
                    if (!page) return;
                    deleteMutation.mutate(page.id, {
                      onSuccess: () => {
                        router.push("/pages");
                      },
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
          <Card
            title="Page detail"
          >
            {isPageLoading || !page ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spin />
              </div>
            ) : (
              <Space orientation="vertical" size={12} className="w-full">
                {detailEntries.map((entry) => (
                  <p key={entry.key}>
                    <strong>{entry.key}:</strong> {entry.value}
                  </p>
                ))}
                <div>
                  <p className="font-semibold">Access tokens:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {page.accessTokens.length ? (
                      page.accessTokens.map((token) => (
                        <Tag key={token} className="max-w-full break-all">
                          {token.length > 24 ? `${token.slice(0, 24)}...` : token}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-text-muted">No token</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Sale prompt:</p>
                  <p className="mb-0 mt-2 whitespace-pre-wrap break-words">
                    {page.salePrompt || "(empty)"}
                  </p>
                </div>
              </Space>
            )}
          </Card>
          <Card title="Embedded chunks">
            {isChunksLoading ? (
              <div className="flex min-h-[140px] items-center justify-center">
                <Spin />
              </div>
            ) : !chunks?.length ? (
              <Empty description="No chunk for this page" />
            ) : (
              <List
                bordered
                dataSource={chunks}
                renderItem={(chunk, index) => (
                  <List.Item>
                    <Space orientation="vertical" size={4} className="w-full">
                      <span className="text-text-muted">
                        Chunk {index + 1} - {chunk.id}
                      </span>
                      <p className="mb-0 whitespace-pre-wrap">
                        {chunk.chunk}
                      </p>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </section>
    </AuthGuard>
  );
}
