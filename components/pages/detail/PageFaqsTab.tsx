"use client";

import { useMemo, useState } from "react";
import {
  useCreateFaq,
  useDeleteFaq,
  useFaqsByPage,
  useUpdateFaq,
} from "@/hooks/useFaqs";
import type { FaqItem } from "@/services/faqs.service";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Table,
} from "antd";

type FaqFormValues = {
  question: string;
  intent: string;
  answer: string;
  keywordsInput?: string;
  priority?: number;
  isActive?: boolean;
};

type FaqCreateModalValues = {
  faqs: FaqFormValues[];
};

const DEFAULT_FAQS: FaqFormValues[] = [
  {
    question: "ao nay gia bao nhieu",
    intent: "price_inquiry",
    answer:
      "Da san pham nay ben em dang co gia {{price}} a. Neu chi lay combo nhieu ben em co uu dai them nhe!",
    keywordsInput: "gia, bao nhieu tien, price",
    priority: 1,
    isActive: true,
  },
  {
    question: "con hang khong",
    intent: "availability_check",
    answer:
      "Da mau nay ben em van con hang a. Chi cho em xin size va mau de em check ky hon cho minh nhe!",
    keywordsInput: "con hang, het hang, stock",
    priority: 1,
    isActive: true,
  },
  {
    question: "tu van size giup minh",
    intent: "recommendation_request",
    answer:
      "Da chi cho em xin chieu cao + can nang hoac so do 3 vong, em tu van size chuan cho minh nhe!",
    keywordsInput: "size, size gi, mac size nao",
    priority: 2,
    isActive: true,
  },
  {
    question: "phi ship bao nhieu",
    intent: "shipping_fee_question",
    answer:
      "Da phi ship ben em khoang {{shippingFee}} tuy khu vuc a. Chi cho em xin dia chi de em bao chinh xac nhe!",
    keywordsInput: "ship, phi ship, van chuyen",
    priority: 1,
    isActive: true,
  },
  {
    question: "bao lau nhan duoc hang",
    intent: "delivery_time_question",
    answer: "Da thoi gian giao hang tu 2-4 ngay tuy khu vuc a.",
    keywordsInput: "bao lau, may ngay, giao hang",
    priority: 1,
    isActive: true,
  },
  {
    question: "co duoc kiem tra hang khong",
    intent: "cod_available",
    answer: "Da ben em co ho tro COD (nhan hang roi thanh toan) a.",
    keywordsInput: "cod, thanh toan, tra tien khi nhan",
    priority: 1,
    isActive: true,
  },
  {
    question: "hang co tot khong",
    intent: "trust_issue",
    answer:
      "Da ben em cam ket hang chuan form dep, chat lieu mem mai mac rat thoai mai a. Neu chi can em tu van ky hon theo nhu cau thi em ho tro ngay nhe!",
    keywordsInput: "chat luong, tot khong, uy tin",
    priority: 2,
    isActive: true,
  },
  {
    question: "ao nay co nang nguc khong",
    intent: "product_question",
    answer:
      "Da tuy mau a. Co loai nang nhe tu nhien va co loai nang day ro, chi dang quan tam kieu nao de em tu van chuan hon nhe!",
    keywordsInput: "nang nguc, push up, day nguc",
    priority: 2,
    isActive: true,
  },
  {
    question: "mac co thoai mai khong",
    intent: "product_question",
    answer:
      "Da san pham ben em uu tien chat lieu mem mai, co gian tot nen mac rat thoai mai ca ngay a.",
    keywordsInput: "thoai mai, mac de chiu, co dau khong",
    priority: 2,
    isActive: true,
  },
  {
    question: "mac vay co bi lo khong",
    intent: "product_question",
    answer:
      "Da neu chi mac dong seamless khong vien thi se khong bi lo dau a. Em co the goi y mau phu hop cho minh nhe!",
    keywordsInput: "lo, seamless, vay body",
    priority: 2,
    isActive: true,
  },
  {
    question: "co khuyen mai khong",
    intent: "promotion_question",
    answer:
      "Da ben em thuong co uu dai khi mua combo hoac so luong nhieu a. Chi dang dinh lay may san pham de em bao gia tot nhat nhe!",
    keywordsInput: "khuyen mai, giam gia, sale",
    priority: 1,
    isActive: true,
  },
  {
    question: "mua nhu the nao",
    intent: "buy_intent_soft",
    answer:
      "Da chi chi can gui giup em san pham + size + mau + SDT + dia chi, ben em se len don ngay cho minh a.",
    keywordsInput: "mua, dat hang, order",
    priority: 1,
    isActive: true,
  },
];

const parseKeywords = (raw?: string) => {
  if (!raw?.trim()) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export function PageFaqsTab({ pageUuid }: { pageUuid: string }) {
  const { data: faqs, isLoading } = useFaqsByPage(pageUuid);
  const createMutation = useCreateFaq(pageUuid);
  const updateMutation = useUpdateFaq(pageUuid);
  const deleteMutation = useDeleteFaq(pageUuid);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form] = Form.useForm<FaqFormValues>();
  const [createForm] = Form.useForm<FaqCreateModalValues>();

  const openCreate = () => {
    setEditing(null);
    createForm.setFieldsValue({ faqs: DEFAULT_FAQS });
    setModalOpen(true);
  };

  const openEdit = (row: FaqItem) => {
    setEditing(row);
    form.setFieldsValue({
      question: row.question,
      intent: row.intent,
      answer: row.answer,
      keywordsInput: row.keywords?.join(", ") ?? "",
      priority: row.priority,
      isActive: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const keywords = parseKeywords(values.keywordsInput);
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          payload: {
            question: values.question,
            intent: values.intent,
            answer: values.answer,
            keywords: keywords ?? null,
            priority: values.priority,
            isActive: values.isActive,
          },
        },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      const createValues = await createForm.validateFields();
      const prepared = (createValues.faqs ?? []).map((faq) => ({
        question: faq.question,
        intent: faq.intent,
        answer: faq.answer,
        keywords: parseKeywords(faq.keywordsInput) ?? null,
        priority: faq.priority,
        isActive: faq.isActive ?? true,
      }));
      if (!prepared.length) return;
      createMutation.mutate(prepared, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns = useMemo(
    () => [
      { title: "Intent", dataIndex: "intent", key: "intent", width: 140 },
      {
        title: "Question",
        dataIndex: "question",
        key: "question",
        ellipsis: true,
      },
      {
        title: "Answer",
        dataIndex: "answer",
        key: "answer",
        ellipsis: true,
        render: (t: string) =>
          t && t.length > 64 ? `${t.slice(0, 64)}…` : t,
      },
      { title: "Priority", dataIndex: "priority", key: "priority", width: 90 },
      {
        title: "Active",
        dataIndex: "isActive",
        key: "isActive",
        width: 80,
        render: (v: boolean) => (v ? "Yes" : "No"),
      },
      {
        title: "",
        key: "actions",
        width: 160,
        render: (_: unknown, row: FaqItem) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEdit(row)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this FAQ?"
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
    [deleteMutation.isPending]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add FAQ
        </Button>
      </div>
      {isLoading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Spin />
        </div>
      ) : (
        <Table<FaqItem>
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          dataSource={faqs ?? []}
          columns={columns}
        />
      )}

      <Modal
        title={editing ? "Edit FAQ" : "New FAQs"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={900}
      >
        {editing ? (
          <Form form={form} layout="vertical" className="mt-2">
            <Form.Item
              label="Question"
              name="question"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item
              label="Intent"
              name="intent"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Answer"
              name="answer"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Keywords (comma-separated)" name="keywordsInput">
              <Input placeholder="shipping, return, ..." />
            </Form.Item>
            <Form.Item label="Priority" name="priority">
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={createForm}
            layout="vertical"
            className="mt-2"
            initialValues={{ faqs: DEFAULT_FAQS }}
          >
            <Form.List name="faqs">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-4">
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      title={`FAQ ${index + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button danger type="link" onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        ) : null
                      }
                    >
                      <Form.Item
                        label="Question"
                        name={[field.name, "question"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Form.Item
                        label="Intent"
                        name={[field.name, "intent"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label="Answer"
                        name={[field.name, "answer"]}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Form.Item label="Keywords (comma-separated)" name={[field.name, "keywordsInput"]}>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Priority" name={[field.name, "priority"]}>
                          <InputNumber className="w-full" />
                        </Form.Item>
                        <Form.Item label="Active" name={[field.name, "isActive"]} valuePropName="checked">
                          <Switch />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  <Button
                    onClick={() =>
                      add({
                        question: "",
                        intent: "",
                        answer: "",
                        keywordsInput: "",
                        priority: 1,
                        isActive: true,
                      } as FaqFormValues)
                    }
                  >
                    Add another FAQ card
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
