"use client";

import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { usePageDetail, useUpdatePage } from "@/hooks/usePages";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Spin } from "antd";

type EditPageFormValues = {
  systemPrompt?: string;
};

export default function EditPageRoute() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;

  const { data: page, isLoading } = usePageDetail(id);

  const [form] = Form.useForm<EditPageFormValues>();
  const updateMutation = useUpdatePage();

  const handleSubmit = (values: EditPageFormValues) => {
    if (!page) return;
    updateMutation.mutate(
      {
        id: page.id,
        payload: {
          systemPrompt: values.systemPrompt?.trim() || null,
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
                  systemPrompt: page.systemPrompt ?? "",
                }}
                onFinish={handleSubmit}
                autoComplete="off"
              >
                <Form.Item label="System prompt" name="systemPrompt">
                  <Input.TextArea
                    rows={4}
                    placeholder="Optional system prompt for this page"
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

