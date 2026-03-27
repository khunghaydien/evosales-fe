"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageConversationsTab } from "@/components/pages/detail/PageConversationsTab";
import { PageFaqsTab } from "@/components/pages/detail/PageFaqsTab";
import { PageProductsTab } from "@/components/pages/detail/PageProductsTab";
import { useCreatePage, useUpdatePage } from "@/hooks/usePages";
import { getGlobalMessageApi } from "@/libs/antd/messageBridge";
import type { PageItem } from "@/services/pages.service";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Tabs } from "antd";

type CreatePageFormValues = {
  pageId: string;
  systemPrompt?: string;
  aiConfigJson?: string;
  templatesJson?: string;
  orderShipConfigJson?: string;
  orderCollectionConfigJson?: string;
  ragConfigJson?: string;
  orderConfigJson?: string;
};

const DEFAULT_CREATE_PAGE_DATA = {
  pageId: "lingerie_shop_001",
  systemPrompt: `Bạn là nhân viên tư vấn bán đồ lót nữ chuyên nghiệp.
Phong cách:
- Nhẹ nhàng, tinh tế, lịch sự, không phản cảm
- Tư vấn phù hợp nhu cầu (thoải mái, sexy, sau sinh, mặc hàng ngày…)
- Chủ động gợi ý size, chất liệu, combo
- Luôn hướng tới chốt đơn nhưng không gây áp lực

Nguyên tắc:
- Không nói tục, không dùng từ nhạy cảm
- Không bịa thông tin sản phẩm
- Nếu thiếu info thì hỏi thêm ngắn gọn`,
  aiConfig: {
    allowedIntent: [
      "greeting",
      "product_question",
      "price_inquiry",
      "promotion_question",
      "recommendation_request",
      "buy_intent_soft",
      "order",
      "add_to_cart",
      "update_quantity",
      "update_shipping_info",
      "shipping_fee_question",
      "delivery_time_question",
      "cod_available",
      "confirm_order",
      "cancel_order",
      "hesitation",
      "price_objection",
      "trust_issue",
      "thanks",
    ],
    extractorRules: [
      "ưu tiên extract size (S,M,L,XL, cup A,B,C...)",
      "màu sắc phải normalize (đen, trắng, nude...)",
      "quantity là số",
      "phone phải đúng format số",
      "address giữ nguyên text",
      "chỉ extract khi user nói rõ",
    ],
  },
  templates: {
    greeting:
      "Em chào chị ạ 🌸 Bên em chuyên đồ lót nữ mặc siêu thoải mái và tôn dáng. Chị đang tìm loại nào để em tư vấn kỹ hơn ạ?",
    askMissing:
      "Dạ chị cho em xin {{fields}} để em lên đơn chuẩn cho mình nhé ạ 💕",
    suggestProduct:
      "Dạ em có thể gợi ý mẫu phù hợp dáng và nhu cầu của chị, chị cho em xin thêm thông tin nhé ạ 💖",
    consultProduct:
      "Dạ chị xác nhận giúp em thông tin nhận hàng để em lên đơn ngay cho mình ạ 🚚",
    confirmOrder:
      "Em xin phép xác nhận đơn ạ:\n- Sản phẩm: {{product_name}}\n- Số lượng: {{quantity}}\n- Màu: {{color}}\n- SĐT: {{phone}}\n- Địa chỉ: {{address}}\n👉 Chị xác nhận giúp em để bên em gửi hàng nhé 💕",
    thanks:
      "Dạ em cảm ơn chị nhiều ạ 💖 Cần hỗ trợ thêm cứ nhắn em bất cứ lúc nào nhé!",
    objectionHandling:
      "Dạ bên em cam kết hàng chuẩn form đẹp, chất liệu mềm mại thoải mái ạ. Nếu chị cần em tư vấn mẫu phù hợp hơn với nhu cầu thì em hỗ trợ ngay nhé 💕",
    shippingFee: "Phí ship bên em là {{shippingFee}} ạ 🚚",
    deliveryTime: "Thời gian giao hàng từ 2-4 ngày tùy khu vực ạ ⏱️",
    codAvailable: "Dạ bên em hỗ trợ nhận hàng rồi thanh toán (COD) ạ 💵",
    cancelOrder: "Dạ em đã ghi nhận hủy đơn theo yêu cầu của chị ạ 💔",
    fallback:
      "Dạ chị cần em tư vấn mẫu nào hoặc hỗ trợ lên đơn thì cứ nhắn em nhé ạ 💕",
  },
  orderCollectionConfig: {
    required: ["product_name", "quantity", "size", "color"],
    fieldLabels: {
      product_name: "tên sản phẩm",
      quantity: "số lượng",
      size: "size",
      color: "màu sắc",
    },
    fieldAliases: {
      product_name: ["product", "name", "item"],
      quantity: ["qty", "so_luong"],
      size: ["kich_thuoc", "size_ao"],
      color: ["mau", "mau_sac"],
    },
  },
  orderShipConfig: {
    required: ["phone", "address", "name"],
    fieldLabels: {
      phone: "số điện thoại",
      address: "địa chỉ",
      name: "tên người nhận",
    },
    fieldAliases: {
      phone: ["sdt", "so_dien_thoai"],
      address: ["dia_chi"],
      name: ["ten", "nguoi_nhan"],
    },
  },
  orderConfig: {
    shippingFee: 30000,
    doneMessage:
      "Dạ đơn của chị đã được ghi nhận 💖 Bên em sẽ gọi xác nhận và giao sớm nhất ạ!",
  },
  ragConfig: {
    topK: 3,
  },
};

const DEFAULT_CREATE_PAGE_FORM_VALUES: CreatePageFormValues = {
  pageId: DEFAULT_CREATE_PAGE_DATA.pageId,
  systemPrompt: DEFAULT_CREATE_PAGE_DATA.systemPrompt,
  aiConfigJson: JSON.stringify(DEFAULT_CREATE_PAGE_DATA.aiConfig, null, 2),
  templatesJson: JSON.stringify(DEFAULT_CREATE_PAGE_DATA.templates, null, 2),
  orderShipConfigJson: JSON.stringify(DEFAULT_CREATE_PAGE_DATA.orderShipConfig, null, 2),
  orderCollectionConfigJson: JSON.stringify(
    DEFAULT_CREATE_PAGE_DATA.orderCollectionConfig,
    null,
    2
  ),
  ragConfigJson: JSON.stringify(DEFAULT_CREATE_PAGE_DATA.ragConfig, null, 2),
  orderConfigJson: JSON.stringify(DEFAULT_CREATE_PAGE_DATA.orderConfig, null, 2),
};

const parseObjectJson = (value?: string, label?: string) => {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error(`${label ?? "Field"} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be a JSON object")) {
      throw error;
    }
    throw new Error(`${label ?? "Field"} must be valid JSON`);
  }
};

export default function CreatePageRoute() {
  const router = useRouter();
  const [form] = Form.useForm<CreatePageFormValues>();
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState("general");

  const handleSubmit = (values: CreatePageFormValues) => {
    let aiConfig: PageItem["aiConfig"] | undefined;
    let templates: PageItem["templates"] | undefined;
    let orderShipConfig: PageItem["orderShipConfig"] | undefined;
    let orderCollectionConfig: PageItem["orderCollectionConfig"] | undefined;
    let ragConfig: PageItem["ragConfig"] | undefined;
    let orderConfig: PageItem["orderConfig"] | undefined;

    try {
      aiConfig = parseObjectJson(values.aiConfigJson, "AI config") ?? undefined;
      templates = parseObjectJson(values.templatesJson, "Templates") ?? undefined;
      orderShipConfig = parseObjectJson(values.orderShipConfigJson, "Order ship config");
      orderCollectionConfig = parseObjectJson(
        values.orderCollectionConfigJson,
        "Order collection config"
      );
      ragConfig = parseObjectJson(values.ragConfigJson, "RAG config") ?? undefined;
      orderConfig = parseObjectJson(values.orderConfigJson, "Order config") ?? undefined;
    } catch (error) {
      getGlobalMessageApi()?.error(
        error instanceof Error ? error.message : "Invalid JSON fields"
      );
      return;
    }

    const payload = {
      pageId: values.pageId.trim(),
      systemPrompt: values.systemPrompt?.trim() || null,
      aiConfig,
      templates,
      orderShipConfig,
      orderCollectionConfig,
      ragConfig,
      orderConfig,
    };

    if (createdPageId) {
      updateMutation.mutate(
        {
          id: createdPageId,
          payload: {
            systemPrompt: payload.systemPrompt,
            aiConfig: payload.aiConfig,
            templates: payload.templates,
            orderShipConfig: payload.orderShipConfig,
            orderCollectionConfig: payload.orderCollectionConfig,
            ragConfig: payload.ragConfig,
            orderConfig: payload.orderConfig,
          },
        },
        {
          onSuccess: () => {
            getGlobalMessageApi()?.success("General info updated");
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        setCreatedPageId(created.id);
        setActiveKey("products");
      },
    });
  };

  return (
    <AuthGuard>
      <section className="w-full p-4">
        <div className="w-full flex flex-col gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/pages")}>
            Back to pages
          </Button>
          <Card
            title="Create new page"
            extra={
              createdPageId ? (
                <Button type="default" onClick={() => router.push(`/pages/${createdPageId}`)}>
                  View detail
                </Button>
              ) : null
            }
          >
            <Tabs
              activeKey={activeKey}
              onChange={setActiveKey}
              items={[
                {
                  key: "general",
                  label: "General",
                  children: (
                    <Form
                      layout="vertical"
                      form={form}
                      initialValues={DEFAULT_CREATE_PAGE_FORM_VALUES}
                      onFinish={handleSubmit}
                      autoComplete="off"
                    >
                      <Form.Item
                        label="Page ID"
                        name="pageId"
                        rules={[{ required: true, message: "Please input page ID" }]}
                      >
                        <Input placeholder="Enter external page ID" disabled={!!createdPageId} />
                      </Form.Item>

                      <Form.Item label="System prompt" name="systemPrompt">
                        <Input.TextArea
                          rows={4}
                          placeholder="Optional system prompt for this page"
                        />
                      </Form.Item>

                      <Form.Item label="AI config (JSON)" name="aiConfigJson">
                        <Input.TextArea rows={3} placeholder='{"tone":"sales","emojiLevel":2}' />
                      </Form.Item>

                      <Form.Item label="Templates (JSON)" name="templatesJson">
                        <Input.TextArea
                          rows={4}
                          placeholder='{"consultProduct":"...","suggestProduct":"..."}'
                        />
                      </Form.Item>

                      <Form.Item label="Order ship config (JSON)" name="orderShipConfigJson">
                        <Input.TextArea rows={3} placeholder='{"defaultCarrier":"ghn"}' />
                      </Form.Item>

                      <Form.Item
                        label="Order collection config (JSON)"
                        name="orderCollectionConfigJson"
                      >
                        <Input.TextArea rows={3} placeholder='{"askPhone":true}' />
                      </Form.Item>

                      <Form.Item label="RAG config (JSON)" name="ragConfigJson">
                        <Input.TextArea rows={2} placeholder='{"topK":5}' />
                      </Form.Item>

                      <Form.Item label="Order config (JSON)" name="orderConfigJson">
                        <Input.TextArea rows={2} placeholder='{"shippingFee":30000}' />
                      </Form.Item>

                      <div className="flex justify-end gap-2">
                        <Button onClick={() => router.push("/pages")}>Cancel</Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={createMutation.isPending || updateMutation.isPending}
                        >
                          {createdPageId ? "Save general" : "Create page"}
                        </Button>
                      </div>
                    </Form>
                  ),
                },
                {
                  key: "products",
                  label: "Products",
                  disabled: !createdPageId,
                  children: createdPageId ? (
                    <PageProductsTab pageUuid={createdPageId} />
                  ) : (
                    <p className="text-text-muted">
                      Create page in General tab first to manage products.
                    </p>
                  ),
                },
                {
                  key: "faqs",
                  label: "FAQs",
                  disabled: !createdPageId,
                  children: createdPageId ? (
                    <PageFaqsTab pageUuid={createdPageId} />
                  ) : (
                    <p className="text-text-muted">
                      Create page in General tab first to manage FAQs.
                    </p>
                  ),
                },
                {
                  key: "conversations",
                  label: "Conversations",
                  disabled: !createdPageId,
                  children: createdPageId ? (
                    <PageConversationsTab pageUuid={createdPageId} />
                  ) : (
                    <p className="text-text-muted">
                      Create page in General tab first to list conversations.
                    </p>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </section>
    </AuthGuard>
  );
}

