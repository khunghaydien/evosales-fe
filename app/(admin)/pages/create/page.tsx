"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useCreatePage } from "@/hooks/usePages";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";

type CreatePageFormValues = {
  pageId: string;
  accessTokensInput: string;
  salePrompt?: string;
};

const parseAccessTokens = (input: string): string[] =>
  input
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

export default function CreatePageRoute() {
  const router = useRouter();
  const [form] = Form.useForm<CreatePageFormValues>();
  const createMutation = useCreatePage();

  const handleSubmit = (values: CreatePageFormValues) => {
    createMutation.mutate(
      {
        pageId: values.pageId.trim(),
        accessTokens: parseAccessTokens(values.accessTokensInput),
        salePrompt: values.salePrompt?.trim() || null,
      },
      {
        onSuccess: (created) => {
          router.push(`/pages/${created.id}`);
        },
      }
    );
  };

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="w-full flex flex-col gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/pages")}>
            Back to pages
          </Button>
          <Card title="Create new page">
            <Form
              layout="vertical"
              form={form}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Page ID"
                name="pageId"
                rules={[{ required: true, message: "Please input page ID" }]}
              >
                <Input placeholder="Enter external page ID" />
              </Form.Item>

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
                <Button onClick={() => router.push("/pages")}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending}
                >
                  Create
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </section>
    </AuthGuard>
  );
}

