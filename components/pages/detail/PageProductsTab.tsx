"use client";

import { useMemo, useState } from "react";
import {
  useCreateProduct,
  useDeleteProduct,
  useProductsByPage,
  useUpdateProduct,
} from "@/hooks/useProducts";
import type { ProductItem } from "@/services/products.service";
import { PlusOutlined } from "@ant-design/icons";
import { getGlobalMessageApi } from "@/libs/antd/messageBridge";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";

type ProductFormValues = {
  code: string;
  name: string;
  imagesInput: string;
  content: string;
};

type ProductCreateModalValues = {
  products: ProductFormValues[];
};

const parseImages = (raw: string): string[] =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ImagesPreview({ urls }: { urls: string[] }) {
  if (!urls.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((url, index) => (
        <img
          key={`${url}-${index}`}
          src={url}
          alt={`preview-${index + 1}`}
          className="h-16 w-16 rounded border border-border object-cover"
        />
      ))}
    </div>
  );
}

export function PageProductsTab({ pageUuid }: { pageUuid: string }) {
  const { data: products, isLoading } = useProductsByPage(pageUuid);
  const createMutation = useCreateProduct(pageUuid);
  const updateMutation = useUpdateProduct(pageUuid);
  const deleteMutation = useDeleteProduct(pageUuid);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [form] = Form.useForm<ProductCreateModalValues>();
  const [editForm] = Form.useForm<ProductFormValues>();

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      products: [{ code: "", name: "", imagesInput: "", content: "" }],
    });
    setModalOpen(true);
  };

  const openEdit = (row: ProductItem) => {
    setEditing(row);
    editForm.setFieldsValue({
      code: row.code,
      name: row.name,
      imagesInput: (row.images ?? []).join(", "),
      content: row.content,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      const values = await editForm.validateFields();
      updateMutation.mutate(
        {
          id: editing.id,
          payload: {
            code: values.code,
            name: values.name,
            images: parseImages(values.imagesInput),
            content: values.content,
          },
        },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      const values = await form.validateFields();
      const prepared: Array<{
        code: string;
        name: string;
        images: string[];
        content: string;
      }> = [];

      for (const [index, p] of (values.products ?? []).entries()) {
        prepared.push({
          code: p.code.trim(),
          name: p.name.trim(),
          images: parseImages(p.imagesInput),
          content: p.content,
        });
        if (!prepared[index].images.length) {
          getGlobalMessageApi()?.error(`Product ${index + 1}: images is required`);
          return;
        }
      }

      if (!prepared.length) {
        getGlobalMessageApi()?.warning("Please add at least one product");
        return;
      }

      createMutation.mutate(
        prepared,
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  const columns = useMemo(
    () => [
      { title: "Code", dataIndex: "code", key: "code", width: 120 },
      { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
      {
        title: "Images",
        dataIndex: "images",
        key: "images",
        width: 120,
        render: (imgs: string[]) => `${imgs?.length ?? 0} image(s)`,
      },
      { title: "Content", dataIndex: "content", key: "content", ellipsis: true },
      {
        title: "",
        key: "actions",
        width: 160,
        render: (_: unknown, row: ProductItem) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this product?"
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
              onConfirm={() => deleteMutation.mutate(row.id)}
            >
              <Button type="link" size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, openEdit]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add product
        </Button>
      </div>
      {isLoading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Spin />
        </div>
      ) : (
        <Table<ProductItem>
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          dataSource={products ?? []}
          columns={columns}
        />
      )}

      <Modal
        title={editing ? "Edit product" : "New products"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={
          createMutation.isPending || updateMutation.isPending
        }
        destroyOnClose
        width={900}
      >
        {editing ? (
          <Form form={editForm} layout="vertical" className="mt-2">
            <Form.Item label="Code" name="code" rules={[{ required: true, message: "Required" }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Required" }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Images (comma-separated URLs)"
              name="imagesInput"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <ImagesPreview urls={parseImages(getFieldValue("imagesInput") ?? "")} />
              )}
            </Form.Item>
            <Form.Item label="Content" name="content" rules={[{ required: true, message: "Required" }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} layout="vertical" className="mt-2">
            <Form.List name="products">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      title={`Product ${index + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button danger type="link" onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        ) : null
                      }
                    >
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Form.Item
                          label="Code"
                          name={[field.name, "code"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="Name"
                          name={[field.name, "name"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="Images (comma-separated URLs)"
                          name={[field.name, "imagesInput"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item noStyle shouldUpdate>
                          {({ getFieldValue }) => (
                            <ImagesPreview
                              urls={parseImages(
                                getFieldValue(["products", field.name, "imagesInput"]) ?? ""
                              )}
                            />
                          )}
                        </Form.Item>
                      </div>
                      <Form.Item
                        label="Content"
                        name={[field.name, "content"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    onClick={() =>
                      add({
                        code: "",
                        name: "",
                        imagesInput: "",
                        content: "",
                      } as ProductFormValues)
                    }
                  >
                    Add another product card
                  </Button>
                </div>
              )}
            </Form.List>
          </Form>
        )}
      </Modal>
    </div>
  );
}
