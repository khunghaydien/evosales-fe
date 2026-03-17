"use client";

import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useKnowledgeEmbeddings } from "@/hooks/useKnowledgeEmbeddings";
import { usePageDetail, useUpdatePage } from "@/hooks/usePages";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Spin } from "antd";

type EditPageFormValues = {
  accessTokensInput: string;
  salePrompt?: string;
};

const parseTokens = (value: string): string[] =>
  value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export default function EditPageRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  const { data: page, isLoading } = usePageDetail(id);
  useKnowledgeEmbeddings(page?.pageId ?? null); // keep prefetch behaviour, even if not shown here

  const [form] = Form.useForm<EditPageFormValues>();
  const updateMutation = useUpdatePage();

  const handleSubmit = (values: EditPageFormValues) => {
    if (!page) return;
    updateMutation.mutate(
      {
        id: page.id,
        payload: {
          accessTokens: parseTokens(values.accessTokensInput),
          salePrompt: values.salePrompt?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          router.push(`/pages/${page.id}`);
        },
      }
    );
  };

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="w-full flex flex-col gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/pages/${id}`)}
          >
            Back to detail
          </Button>
          <Card title="Edit page">
            {isLoading || !page ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Spin />
              </div>
            ) : (
              <Form
                layout="vertical"
                form={form}
                initialValues={{
                  accessTokensInput: page.accessTokens.join(", "),
                  salePrompt: page.salePrompt ?? "",
                }}
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item
                  label="Access tokens"
                  name="accessTokensInput"
                  rules={[{ required: true, message: "Please input access tokens" }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="token1, token2, token3"
                  />
                </Form.Item>

                <Form.Item label="Sale prompt" name="salePrompt">
                  <Input.TextArea
                    rows={4}
                    placeholder="Optional prompt to guide sales conversation"
                  />
                </Form.Item>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      form.resetFields();
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateMutation.isPending}
                  >
                    Save changes
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </div>
      </section>
    </AuthGuard>
  );
}

